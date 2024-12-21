<?php
/**
 * View to edit a connection.
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 * @since       3.0
 */

namespace Fabrik\Component\Fabrik\Administrator\View\Connection;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Component\Fabrik\Administrator\Helper\FabrikHelper;
use Joomla\CMS\Factory;
use Joomla\CMS\Form\Form;
use Joomla\CMS\Language\Text;
use Joomla\CMS\MVC\View\HtmlView as BaseHtmlView;
use Joomla\CMS\Table\Table;
use Joomla\CMS\Toolbar\ToolbarHelper;

/**
 * View to edit a connection.
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
	 * Connection item
	 *
	 * @var Table
	 */
	protected $item;

	/**
	 * A state object
	 *
	 * @var    object
	 */
	protected $state;

	/**
	 * Display the view
	 *
	 * @param   string  $tpl  template
	 *
	 * @return  void
	 */

	public function display($tpl = null) {
		// Initialiase variables.
//		$model = $this->getModel();
		$model = Factory::getApplication()->bootComponent('com_fabrik')->getMVCFactory()->createModel('Connection', 'Administrator');
		$this->item = $this->get('Item');
		$model->checkDefault($this->item);
		$this->form = $this->get('Form');
		$this->form->bind($this->item);
		$this->state = $this->get('State');

		// Check for errors.
		if (count($errors = $this->get('Errors'))) {
			throw new \RuntimeException(implode("\n", $errors), 500);
		}

		$this->addToolbar();

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
		$title = $isNew ? Text::_('COM_FABRIK_MANAGER_CONNECTION_NEW') : Text::_('COM_FABRIK_MANAGER_CONNECTION_EDIT') . ' "' . $this->item->description . '"';
		ToolBarHelper::title($title, 'tree-2');

		if ($isNew) {
			// For new records, check the create permission.
			if ($canDo->get('core.create')) {
				ToolBarHelper::apply('connection.apply', 'JTOOLBAR_APPLY');
				ToolBarHelper::save('connection.save', 'JTOOLBAR_SAVE');
				ToolBarHelper::addNew('connection.save2new', 'JTOOLBAR_SAVE_AND_NEW');
			}

			ToolBarHelper::cancel('connection.cancel', 'JTOOLBAR_CANCEL');
		} else {
			// Can't save the record if it's checked out.
			if (!$checkedOut) {
				// Since it's an existing record, check the edit permission, or fall back to edit own if the owner.
				if ($canDo->get('core.edit') || ($canDo->get('core.edit.own') && $this->item->created_by == $userId)) {
					ToolBarHelper::apply('connection.apply', 'JTOOLBAR_APPLY');
					ToolBarHelper::save('connection.save', 'JTOOLBAR_SAVE');

					// We can save this record, but check the create permission to see if we can return to make a new one.
					if ($canDo->get('core.create')) {
						ToolBarHelper::addNew('connection.save2new', 'JTOOLBAR_SAVE_AND_NEW');
					}
				}
			}

			if ($canDo->get('core.create')) {
				ToolBarHelper::custom('connection.save2copy', 'save-copy.png', 'save-copy_f2.png', 'JTOOLBAR_SAVE_AS_COPY', false);
			}

			ToolBarHelper::cancel('connection.cancel', 'JTOOLBAR_CLOSE');
		}

		ToolBarHelper::divider();
		ToolBarHelper::help('JHELP_COMPONENTS_FABRIK_CONNECTIONS_EDIT', false, Text::_('JHELP_COMPONENTS_FABRIK_CONNECTIONS_EDIT'));
	}
}
