<?php
/**
 * View to edit a list.
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Component\Fabrik\Administrator\View\List;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Component\Fabrik\Administrator\Helper\FabrikHelper;
use Fabrik\Library\Fabrik\FabrikHtml;
use Joomla\CMS\Factory;
use Joomla\CMS\Form\Form;
use Joomla\CMS\Language\Text;
use Joomla\CMS\MVC\View\HtmlView as BaseHtmlView;
use Joomla\CMS\Table\Table;
use Joomla\CMS\Toolbar\ToolbarHelper;

/**
 * View to edit a list.
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @since       1.5
 */
class HtmlView extends BaseHtmlView {
	/**
	 * List form
	 *
	 * @var Form
	 */
	protected $form;

	/**
	 * List item
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
	 * Display the list
	 *
	 * @param   string $tpl template
	 *
	 * @return  void
	 */
	public function display($tpl = null) {
		// Initialise variables.
		$model      = $this->getModel();
		$this->form = $this->get('Form');
		$this->item = $this->get('Item'); // Get the record.
		$formModel = $this->get('FormModel');
		$formModel->setId($this->item->form_id); // Why ?
		$this->state = $this->get('State');
		$this->addToolbar();

		$this->js = $model->getJs();

		// Need to do session store here
		$session = Factory::getSession();
		$session->set('sess_id', $this->item->id);
		$session->set('sess_table_name', $this->item->db_table_name);
		$session->set('sess_cid', $this->item->connection_id);

		$wa = Factory::getApplication()->getDocument()->getWebAssetManager();

        $wa->useScript("com_fabrik.admin.adminelement");
		$wa->usePreset("com_fabrik.fabsubform");
		$wa->useScript("com_fabrik.admin.pluginmanager");
        FabrikHtml::addToElemInitScripts($this->js);;

		parent::display($tpl);
	}
	/**
	 * Show the list's linked forms etc
	 *
	 * @param   string $tpl template
	 *
	 * @return  void
	 */
	public function showLinkedElements($tpl = null) {
		$model = $this->getModel('Form');
		$this->addLinkedElementsToolbar();
		$this->formGroupEls = $model->getFormGroups(false);
		$this->formTable = $model->getForm();
		parent::display($tpl);
	}

	/**
	 * See if the user wants to rename the list/form/groups
	 *
	 * @param   string $tpl template
	 *
	 * @return  void
	 */
	public function confirmCopy($tpl = null) {
		$app = Factory::getApplication();
		$input = $app->input;
		$cid = $input->get('cid', array(0), 'array');
		$lists = array();
		$model = $this->getModel();

		foreach ($cid as $id) {
			$model->setId($id);
			$table = $model->getTable();
			$formModel = $model->getFormModel();
			$row = new \stdClass;
			$row->id = $id;
			$row->formid = $table->form_id;
			$row->label = $table->label;
			$row->formlabel = $formModel->getForm()->label;
			$groups = $formModel->getGroupsHiarachy();
			$row->groups = array();

			foreach ($groups as $group) {
				$grouprow = new \stdClass;
				$g = $group->getGroup();
				$grouprow->id = $g->id;
				$grouprow->name = $g->name;
				$row->groups[] = $grouprow;
			}

			$lists[] = $row;
		}
		$this->lists = $lists;
		$this->addConfirmCopyToolbar();
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
		$title = $isNew ? Text::_('COM_FABRIK_MANAGER_LIST_NEW') : Text::_('COM_FABRIK_MANAGER_LIST_EDIT') . ' "' . $this->item->label . '"';
		ToolBarHelper::title($title, 'list');

		if ($isNew) {
			// For new records, check the create permission.
			if ($canDo->get('core.create')) {
				ToolBarHelper::apply('list.apply', 'JTOOLBAR_APPLY'); // save
				ToolBarHelper::save('list.save', 'JTOOLBAR_SAVE'); // save $ close
				ToolBarHelper::addNew('list.save2new', 'JTOOLBAR_SAVE_AND_NEW');
			}
			ToolBarHelper::cancel('list.cancel', 'JTOOLBAR_CANCEL');
		} else {
			// Can't save the record if it's checked out.
			if (!$checkedOut) {
				// Since it's an existing record, check the edit permission, or fall back to edit own if the owner.
				if ($canDo->get('core.edit') || ($canDo->get('core.edit.own') && $this->item->created_by == $userId)) {
					ToolBarHelper::apply('list.apply', 'JTOOLBAR_APPLY');
					ToolBarHelper::save('list.save', 'JTOOLBAR_SAVE');

					// We can save this record, but check the create permission to see if we can return to make a new one.
					if ($canDo->get('core.create')) {
						ToolBarHelper::addNew('list.save2new', 'JTOOLBAR_SAVE_AND_NEW');
					}
				}
			}
			// If checked out, we can still save
			if ($canDo->get('core.create')) {
				ToolBarHelper::custom('list.save2copy', 'save-copy.png', 'save-copy_f2.png', 'JTOOLBAR_SAVE_AS_COPY', false);
			}
			ToolBarHelper::cancel('list.cancel', 'JTOOLBAR_CLOSE');
		}

		ToolBarHelper::divider();
		ToolBarHelper::help('JHELP_COMPONENTS_FABRIK_LISTS_EDIT', false, Text::_('JHELP_COMPONENTS_FABRIK_LISTS_EDIT'));
	}

	/**
	 * Add the page title and toolbar for the linked elements page
	 *
	 * @return  void
	 */
	protected function addLinkedElementsToolbar() {
		$app = Factory::getApplication();
		$input = $app->input;
		$input->set('hidemainmenu', true);
		ToolBarHelper::title(Text::_('COM_FABRIK_MANAGER_LIST_LINKED_ELEMENTS'), 'list');
		ToolBarHelper::cancel('list.cancel', 'JTOOLBAR_CLOSE');
		ToolBarHelper::divider();
		ToolBarHelper::help('JHELP_COMPONENTS_FABRIK_LISTS_EDIT');
	}

	/**
	 * Add the page title and toolbar for the confirm copy page
	 *
	 * @return  void
	 */
	protected function addConfirmCopyToolbar() {
		$app = Factory::getApplication();
		$input = $app->input;
		$input->set('hidemainmenu', true);
		ToolBarHelper::title(Text::_('COM_FABRIK_MANAGER_LIST_COPY'), 'list');
		ToolBarHelper::cancel('list.cancel', 'JTOOLBAR_CLOSE');
		ToolBarHelper::save('list.doCopy', 'JTOOLBAR_SAVE');
		ToolBarHelper::divider();
		ToolBarHelper::help('JHELP_COMPONENTS_FABRIK_LISTS_EDIT');
	}
}
