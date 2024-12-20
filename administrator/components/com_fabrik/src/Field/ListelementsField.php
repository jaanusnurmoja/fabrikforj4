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
use Joomla\CMS\Form\Form;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;

/**
 * Renders a list of element plugins
 *
 * @package     Joomla
 * @subpackage  Form
 * @since       3.0
 */
class ListelementsField extends ListField {
	/**
	 * Element name
	 *
	 * @var        string
	 */
	protected $name = 'Listelements';

	/**
	 * Method to get the elemens options.
	 *
	 * @return  array  The field option objects.
	 */
	protected function getOptions() {
		// Get id from session, because this also can be in a subform or a multiselect dd
		$session = Factory::getSession();
		$id = $session->get('sess_id');
		$none = $this->getAttribute('none', 0);
 
		$db = FabrikWorker::getDbo(true);
		// get the elements
		$query = $db->getQuery(true);
		// Use id as value? Or element name?
		$query = "SELECT `id` AS value,`name` AS text FROM `#__fabrik_elements`
			WHERE `group_id` IN (SELECT `group_id` FROM `#__fabrik_formgroup`
			JOIN `#__fabrik_lists` ON `#__fabrik_lists`.`form_id` = `#__fabrik_formgroup`.`form_id`
			WHERE `#__fabrik_lists`.`published` = 1 AND `#__fabrik_lists`.`id` = '" . $id . "')
			AND `#__fabrik_elements`.`published` = 1 ";
		$db->setQuery($query);
		$options = $db->loadObjectList();
		if($none == 1) {
			$sel = HTMLHelper::_('select.option', 0, Text::_('COM_FABRIK_SELECT_NONE'));
			$sel->default = false;
			array_unshift($options, $sel);
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

	/**
	 * Method to get the field input markup.
	 *
	 * @return    string    The field input markup.
	 */

	protected function getValue() {
//$value = json_encode($this->value);
//$this->setValue($value);
//$new = $this->value;
//print_r("new = ");print_r($new);
//		return $value;

	}

}
