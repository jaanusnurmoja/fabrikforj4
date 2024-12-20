<?php
/**
 * Renders a list of connections
 *
 * @package     Joomla
 * @subpackage  Form
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrikar\Component\Fabrik\Administrator\Field;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrikar\Library\Fabrik\FabrikWorker;
use Joomla\CMS\Factory;
use Joomla\CMS\Form\Field\ListField;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;

/**
 * Renders a list of table columns
 *
 * @package     Joomla
 * @subpackage  Form
 * @since       3.0
 */
class ListcolumnsField extends ListField {
	/**
	 * Element name
	 *
	 * @var        string
	 */
	protected $name = 'Listcolumns';

	/**
	 * Method to get the field options.
	 *
	 * @return  array  The field option objects.
	 */

	protected function getOptions() {
		// Get id from session, because this also can be in a subform or a multiselect dd
		$session = Factory::getSession();
		$cid = $session->get('sess_cid');
		$table_name = $session->get('sess_table_name');

		$db = FabrikWorker::getDbo(false, $cid);
		$query = $db->getQuery(true);
		$db->setQuery("DESCRIBE " . $table_name);
		$fields = $db->loadObjectList();
//		$options[] = HTMLHelper::_('select.option', '', '-');
		foreach ($fields as $field) {
			//  For the primarykey only type = INT, all types for other fields (join-key).
			if ($this->fieldname == 'db_primary_key') {
				$type = strtoupper(preg_replace('#(\(\d+\))$#', '', $field->Type));
				$type = preg_replace('#(\s+SIGNED|\s+UNSIGNED)#', '', $type);
				if ($type == 'INT') {
					$options[] = HTMLHelper::_('select.option', $table_name.'.'.$field->Field, $field->Field);
				}

			} else {
				$options[] = HTMLHelper::_('select.option', $table_name.'.'.$field->Field, $field->Field);
			}
		}
		return $options;
	}

	/**
	 * Method to get the field input markup.
	 *
	 * @return    string    The field input markup.
	 */

	protected function getInput() {
		// Check if we are part of a subform
		$formName = $this->form->getName();

		if (stristr($formName, "subform")) {
			$session = Factory::getSession();
			$id = $session->get('sess_id');
		} else {
			$id = $this->form->getValue('id');
		}

		if ($id == 0) {
			echo Text::_('COM_FABRIK_AVAILABLE_ONCE_SAVED');
		} else {
			return parent::getInput();
		}

	}
}
