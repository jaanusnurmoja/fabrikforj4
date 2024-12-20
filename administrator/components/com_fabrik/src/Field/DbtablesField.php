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

/**
 * Renders a list of connections
 *
 * @package     Joomla
 * @subpackage  Form
 * @since       3.0
 */
class DbtablesField extends ListField {
	/**
	 * Element name
	 *
	 * @var        string
	 */
	protected $name = 'Dbtables';

	/**
	 * Method to get the field options in case we edit a list.
	 * On creating a new list the options are get by JS and ajax
	 *
	 * @return  array  The field option objects.
	 */

	protected function getOptions() {
		if ($this->fieldname != 'db_table_name') {
			// Get from session, because this also can be in a subform or a multiselect dd
			$session = Factory::getSession();
			$cid = $session->get('sess_cid');

			// In edit mode, for any other field we don't use JS
			$db = FabrikWorker::getDbo(false, $cid); // if $cid = null we get the default db, same as $cid = 1 (but we should get an error)
			$db->setQuery("SHOW TABLES");
			$rows = (array) $db->loadColumn();
			$options[] = HTMLHelper::_('select.option', '', '-');
			foreach ($rows as $row) {
				$options[] = HTMLHelper::_('select.option', $row, $row);
			}
			return $options;
		}
	}

	/**
	 * Method to get the field input markup.
	 *
	 * @return    string    The field input markup.
	 */

	protected function getInput() {
		if ((int) $this->form->getValue('id') == 0 || !$this->element['readonlyonedit']) {
			return parent::getInput();
		}
		return '<input type="text" value="' . $this->value . '" class="form-control" name="' . $this->name . '" readonly />';
	}
}
