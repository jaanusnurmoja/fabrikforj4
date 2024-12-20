<?php
/**
 * Renders widget for (de)selecting available groups when editing a from
 *
 * @package     Joomla
 * @subpackage  Form
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrikar\Component\Fabrik\Administrator\Field;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrikar\Library\Fabrik\FabrikString;
use Fabrikar\Library\Fabrik\FabrikWorker;
use Joomla\CMS\Form\Field\ListField;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;
use Joomla\Utilities\ArrayHelper;

/**
 * Renders widget for (de)selecting available groups when editing a from
 *
 * @package     Joomla
 * @subpackage  Form
 * @since       1.6
 */
class SwaplistField extends ListField {
	/**
	 * Element name
	 * @access	protected
	 * @var		string
	 */
	protected $name = 'SwapList';

	/**
	 * Method to get the field input markup.
	 *
	 * @return  string	The field input markup.
	 */
	protected function getInput() {
		$from = $this->id . '-from';
		$add = $this->id . '-add';
		$remove = $this->id . '-remove';
		$up = $this->id . '-up';
		$down = $this->id . '-down';
		$this->currentGroups = $this->getCurrentGroupList();
		$this->groups = $this->getGroupList();
		$str = '';
//print_r($this->id);exit;
		$checked = empty($this->current_groups) ? 'checked="checked"' : '';

		if (empty($this->groups) && empty($this->currentGroups)) {
			return Text::_('COM_FABRIK_NO_GROUPS_AVAILABLE');
		} else {
			$str = Text::_('COM_FABRIK_AVAILABLE_GROUPS');
			$str .= '<br />';
			$str .= HTMLHelper::_('select.genericlist', $this->groups, 'jform[groups]', 'class="input-group" size="5" style="width:50%;"',
				'value', 'text', null, $this->id . '-from');
			$str .= '<button class="button btn btn-success btn-small" type="button" id="' . $this->id . '-add">';
			$str .= '<i class="icon-new"></i>' . Text::_('COM_FABRIK_ADD') . '</button>';
			$str .= '<br />' . Text::_('COM_FABRIK_CURRENT_GROUPS');
			$str .= '<br />';
			$str .= HTMLHelper::_('select.genericlist', $this->currentGroups, $this->name, 'class="input-group" multiple="multiple" style="width:50%;" size="5" ',
				'value', 'text', '/', $this->id);
			$str .= '<button class="button btn btn-small" type="button" id="' . $this->id . '-up" >';
			$str .= '<i class="icon-arrow-up"></i> ' . Text::_('COM_FABRIK_UP') . '</button> ';
			$str .= '<button class="button btn btn-small" type="button" id="' . $this->id . '-down" >';
			$str .= '<i class="icon-arrow-down"></i> ' . Text::_('COM_FABRIK_DOWN') . '</button> ';
			$str .= '<button class="button btn btn-danger btn-small" type="button" id="' . $this->id . '-remove">';
			$str .= '<i class="icon-delete"></i> ' . Text::_('COM_FABRIK_REMOVE');
			$str .= '</button>';
			return $str;
		}

	}

	/**
	 * Method to get the field label markup.
	 *
	 * @return  string  The field label markup.
	 */
	protected function getLabel() {
		return '';
	}

	/**
	 * get a list of unused groups
	 *
	 * @return  array	list of groups, html list of groups
	 */
	public function getGroupList() {
		$db = FabrikWorker::getDbo(true);
		$query = $db->getQuery(true);
		$query->select('DISTINCT(group_id)')->from('#__fabrik_formgroup');
		$db->setQuery($query);
		$usedgroups = $db->loadColumn();
		$usedgroups = ArrayHelper::toInteger($usedgroups);
		$query = $db->getQuery(true);
		$query->select('id AS value, name AS text')->from('#__fabrik_groups');

		if (!empty($usedgroups)) {
			$query->where('id NOT IN(' . implode(',', $usedgroups) . ')');
		}

		$query->where('published <> -2');
		$query->order(FabrikString::safeColName('text'));
		$db->setQuery($query);
		$groups = $db->loadObjectList();

		return $groups;
	}

	/**
	 * Get a list of groups currently used by the form
	 *
	 * @return  array  list of groups, html list of groups
	 */
	public function getCurrentGroupList() {
		$db = FabrikWorker::getDbo(true);
		$query = $db->getQuery(true);
		$query->select('fg.group_id AS value, g.name AS text');
		$query->from('#__fabrik_formgroup AS fg');
		$query->join('LEFT', ' #__fabrik_groups AS g ON fg.group_id = g.id');
		$query->where('fg.form_id = ' . (int) $this->form->getValue('id'));
		$query->where('g.name <> ""');
		$query->order('fg.ordering');
		$db->setQuery($query);
		$currentGroups = $db->loadObjectList();

		return $currentGroups;
	}
}
