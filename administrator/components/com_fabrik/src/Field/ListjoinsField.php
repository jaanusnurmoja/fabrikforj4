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

use Joomla\CMS\Factory;
use Joomla\CMS\Form\Field\ListField;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;

/**
 * Renders a list of connections
 *
 * @package     Joomla
 * @subpackage  Form
 * @since       3.0
 */
class ListjoinsField extends ListField {
	/**
	 * Element name
	 *
	 * @var        string
	 */
	protected $name = 'Listjoins';

	/**
	 * Method to get the field options in case we edit a list.
	 * On creating a new list the options are get by JS and ajax
	 *
	 * @return  array  The field option objects.
	 */

	protected function getOptions() {
		// Get id from session, because this also can be in a subform or a multiselect dd
		$session = Factory::getSession();
		$cid = $session->get('sess_cid');
		$table_name = $session->get('sess_table_name');

		$options[] = HTMLHelper::_('select.option', '', '-');
		$options[] = HTMLHelper::_('select.option', $table_name, $table_name);
		// More options are added by JS code

		return $options;
	}

	/**
	 * Method to get the field input markup.
	 *
	 * @return    string    The field input markup.
	 */

	protected function getInput() {
		// Get id from session
		$session = Factory::getSession();
		$id = $session->get('sess_id');

		if ($id == 0) {
			echo Text::_('COM_FABRIK_AVAILABLE_ONCE_SAVED');
		} else {
			return parent::getInput();
		}
	}
}
