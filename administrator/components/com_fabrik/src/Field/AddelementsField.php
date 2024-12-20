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
use Joomla\CMS\Form\Field\ListField;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;

/**
 * Renders a list of element plugins
 *
 * @package     Joomla
 * @subpackage  Form
 * @since       3.0
 */
class AddelementsField extends ListField {
	/**
	 * Element name
	 *
	 * @var        string
	 */
	protected $name = 'Element_plgs';

	/**
	 * Method to get the element plugins options.
	 *
	 * @return  array  The field option objects.
	 */
	protected function getOptions() {
		// Get the options. plg_fabrik_element_internalid will always be added.
		$db = FabrikWorker::getDbo(true);
		$query = $db->getQuery(true);
		$query->select('element AS value, name AS text');
		$query->from('#__extensions AS c');
		$query->where("folder = 'fabrik_element' AND type = 'plugin' AND enabled = 1 AND name <> 'plg_fabrik_element_internalid' ");
		$query->order('name');
		$db->setQuery($query);
		$options = $db->loadObjectList();

		// TODO: Strip plg_fabrik_element_ from name.
		$sel = HTMLHelper::_('select.option', '', Text::_('COM_FABRIK_FIELD_SELECT_DEFAULT'));
		$sel->default = false;
		array_unshift($options, $sel);

		return $options;
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
	}

	/**
	 * Method to get the field label markup.
	 *
	 * @return    string    The field label markup.
	 */

	protected function getLabel() {
		if ((int) $this->form->getValue('id') > 0) {
			return '';
		}
		return parent::getLabel();
	}

}
