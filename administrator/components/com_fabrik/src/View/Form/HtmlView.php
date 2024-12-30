<?php
/**
 * View to edit a form.
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Component\Fabrik\Administrator\View\Form;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Component\Fabrik\Administrator\Helper\FabrikHelper;
use Fabrik\Library\Fabrik\FabrikHtml;
use Joomla\CMS\Factory;
use Joomla\CMS\Form\Form;
use Joomla\CMS\Helper\ContentHelper;
use Joomla\CMS\Language\Text;
use Joomla\CMS\MVC\View\GenericDataException;
use Joomla\CMS\MVC\View\HtmlView as BaseHtmlView;
use Joomla\CMS\Table\Table;
use Joomla\CMS\Toolbar\ToolbarHelper;

/**
 * View to edit a form.
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @since       3.0
 */
class HtmlView extends BaseHtmlView {
	/**
	 * Form
	 *
	 * @var Form
	 */
	protected $form;

	/**
	 * Form item
	 *
	 * @var Table
	 */
	protected $item;

	/**
	 * View state
	 *
	 * @var object
	 */
	protected $state;

	/**
	 * Display the view
	 *
	 * @param   string $tpl template
	 *
	 * @return  void
	 */

	public function display($tpl = null) {
		// Initialise variables.
		$model = $this->getModel();
		$this->form = $model->getForm();
		$this->item = $model->getItem();
		$this->state = $model->getState();

		$this->js = $model->getJs();

		// Check for errors.
		if (\count($errors = $this->get('Errors'))) {
			throw new GenericDataException(implode("\n", $errors), 500);
		}

		$wa = Factory::getApplication()->getDocument()->getWebAssetManager();

        $wa->useScript("com_fabrik.admin.adminelement");
		$wa->useScript("com_fabrik.fabsubform");
		$wa->useScript("com_fabrik.admin.pluginmanager");
        FabrikHtml::addToElemInitScripts($this->js);;

		$this->addToolbar();

		parent::display($tpl);
	}

	/**
	 * Alias to display
	 *
	 * @param   string $tpl Template
	 *
	 * @return  void
	 */

	public function form($tpl = null) {
		parent::display($tpl);
	}

	/**
	 * Add the page title and toolbar.
	 *
	 * @return  void
	 */

	protected function addToolbar() {
		$app = Factory::getApplication();
		$input = $app->input;
		$input->set('hidemainmenu', true);
		$user = Factory::getUser();
		$userId = $user->get('id');
		$isNew = ($this->item->id == 0);
		$checkedOut = !($this->item->checked_out == 0 || $this->item->checked_out == $user->get('id'));
		$canDo = FabrikHelper::getActions($this->state->get('filter.category_id'));
		$title = $isNew ? Text::_('COM_FABRIK_MANAGER_FORM_NEW') : Text::_('COM_FABRIK_MANAGER_FORM_EDIT') . ' "'
		. Text::_($this->item->label) . '"';
		ToolBarHelper::title($title, 'file-2');

		$canDo = ContentHelper::getActions('com_fabrik');

		if ($isNew) {
			// For new records, check the create permission.
			if ($canDo->get('core.create')) {
				ToolBarHelper::apply('form.apply', 'JTOOLBAR_APPLY');
				ToolBarHelper::save('form.save', 'JTOOLBAR_SAVE');
				ToolBarHelper::addNew('form.save2new', 'JTOOLBAR_SAVE_AND_NEW');
			}
			ToolBarHelper::cancel('form.cancel', 'JTOOLBAR_CANCEL');
		} else {
			// Can't save the record if it's checked out.
			if (!$checkedOut) {
				// Since it's an existing record, check the edit permission, or fall back to edit own if the owner.
				if ($canDo->get('core.edit') || ($canDo->get('core.edit.own') && $this->item->created_by == $userId)) {
					ToolBarHelper::apply('form.apply', 'JTOOLBAR_APPLY');
					ToolBarHelper::save('form.save', 'JTOOLBAR_SAVE');

					// We can save this record, but check the create permission to see if we can return to make a new one.
					if ($canDo->get('core.create')) {
						ToolBarHelper::addNew('form.save2new', 'JTOOLBAR_SAVE_AND_NEW');
					}
				}
				ToolBarHelper::cancel('form.cancel', 'JTOOLBAR_CLOSE');
			}
			// $$$ No 'save as copy' as this gets complicated due to renaming lists, groups etc. Users should copy from list view.
		}

		ToolBarHelper::divider();
		ToolBarHelper::help('JHELP_COMPONENTS_FABRIK_FORMS_EDIT', false, Text::_('JHELP_COMPONENTS_FABRIK_FORMS_EDIT'));
	}

}
