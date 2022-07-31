<?php
/**
 * Plugin List Field class for Fabrik.
 *
 * @package     Joomla
 * @subpackage  Form
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Form\Field\ListField;

/**
 * Plugin List Field class for Fabrik.
 *
 * @package     Joomla
 * @subpackage  Form
 * @since       1.6
 */
class JFormFieldPluginList extends ListField
{
	/**
	 * The form field type.
	 *
	 * @var        string
	 * @since    1.6
	 */
	protected $type = 'PluginList';

	/**
	 * Method to get the field options.
	 *
	 * @return  array  The field option objects.
	 */
	protected function getInput()
	{
		$app = Factory::getApplication();
		$group = $this->element->attributes()['plugin'];

		if ($this->value == '')
		{
			$this->value = $app->getUserStateFromRequest('com_fabrik.elements.filter.plugin', 'filter_pluginId', $this->value);
		}

		$db    = Factory::getDbo();
		$query = $db->getQuery(true);

		$query->select('extension_id AS value, element AS text');
		$query->from('#__extensions');
		$query->where($db->qn('type') . ' = ' . $db->q('plugin'));
		$query->where($db->qn('enabled') . ' = 1 AND state != -1');
		$query->where($db->qn('folder') . ' = ' . $db->q($group));
		$query->order('text');

		// Get the options.
		$db->setQuery($query);
		$plugins = $db->loadObjectList();

		$this->translateDescription = false;
		$this->addOption(Text::_("COM_FABRIK_PLEASE_SELECT"), ['value'=>'']);
		
		foreach ($plugins as $plugin)
		{
			$this->addOption(htmlspecialchars($plugin->text), ['value'=>htmlspecialchars($plugin->text)]);
		}

		return parent::getInput();
	}
}
