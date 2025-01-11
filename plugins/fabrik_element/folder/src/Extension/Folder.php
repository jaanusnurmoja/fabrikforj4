<?php
/**
 * Plugin element to render folder list
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.element.folder
 * @copyright   Copyright (C) 2005-2025  Fabrikar, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Plugin\Element\Folder\Extension;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Component\Fabrik\Site\Model\PluginelementModel;
use Joomla\CMS\Filesystem\Folder as JFolder;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;
use Joomla\Event\SubscriberInterface;

require_once JPATH_SITE . '/components/com_fabrik/models/element.php';

/**
 * Plugin element to render folder list
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.element.folder
 * @since       3.0
 */

class Folder extends PluginelementModel implements SubscriberInterface
{
	protected $app; // Provided by the CSMPlugin interface

	/**
	 * Returns the javascript import map name for the plugin javascript.
	 *
	 * @return  string
	 *
	 * @since   5.0
	 */
	public function getImportMapName()
	{
		return 'import { FbPlgElementFolder } from "@fbplgelementfolder";';
	}

	/**
     * Returns an array of events this subscriber will listen to.
     *
     * @return  array
     *
     * @since   5.0
     */
    public static function getSubscribedEvents(): array
    {
        $pluginMethods = [];

        return array_merge(parent::getSubscribedEvents(), $pluginMethods);
    }

	/**
	 * Draws the html form element
	 *
	 * @param   array  $data           to pre-populate element with
	 * @param   int    $repeatCounter  repeat group counter
	 *
	 * @return  string	elements html
	 */

	public function render($data, $repeatCounter = 0)
	{
		$name = $this->getHTMLName($repeatCounter);
		$id = $this->getHTMLId($repeatCounter);
		$params = $this->getParams();
		$selected = $this->getValue($data, $repeatCounter);
		$errorCss = $this->elementError != '' ? " elementErrorHighlight" : '';
		$aRoValues = array();
		$path = JPATH_ROOT . '/' . $params->get('fbfolder_path');
		$opts = array();

		if ($params->get('folder_allownone', true))
		{
			$opts[] = HTMLHelper::_('select.option', '', Text::_('NONE'));
		}

		if ($params->get('folder_listfolders', true))
		{
			$folders = JFolder::folders($path);

			foreach ($folders as $folder)
			{
				$opts[] = HTMLHelper::_('select.option', $folder, $folder);

				if ($selected === $folder)
				{
					$aRoValues[] = $folder;
				}
			}
		}

		if ($params->get('folder_listfiles', false))
		{
			$files = JFolder::files($path);

			foreach ($files as $file)
			{
				$opts[] = HTMLHelper::_('select.option', $file, $file);

				if ($selected === $file)
				{
					$aRoValues[] = $file;
				}
			}
		}

		if (!$this->isEditable())
		{
			return implode(', ', $aRoValues);
		}

		$layout = $this->getLayout('form');
		$displayData = new \stdClass;
		$displayData->options = $opts;
		$displayData->name = $name;
		$displayData->selected = $selected;
		$displayData->id = $id;
		$displayData->errorCss = $errorCss;

		return $layout->render($displayData);
	}

	/**
	 * Returns javascript which creates an instance of the class defined in formJavascriptClass()
	 *
	 * @param   int  $repeatCounter  Repeat group counter
	 *
	 * @return  array
	 */

	public function elementJavascript($repeatCounter)
	{
		$id = $this->getHTMLId($repeatCounter);
		$params = $this->getParams();
		$element = $this->getElement();
		$path = JPATH_ROOT . '/' . $params->get('fbfbfolder_path');
		$folders = JFolder::folders($path);
		$opts = $this->getElementJSOptions($repeatCounter);
		$opts->defaultVal = $element->default;
		$opts->data = $folders;

		return array('FbFolder', $id, $opts);
	}
}
