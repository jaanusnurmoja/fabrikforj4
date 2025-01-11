<?php
/**
 * Plugin element to render user view levels
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.element.viewlevel
 * @copyright   Copyright (C) 2005-2025  Fabrikar, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Plugin\Element\Viewlevel\Extension;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Component\Fabrik\Site\Model\ElementlistModel;
use Joomla\Event\SubscriberInterface;

/**
 * Plugin element to render user view levels
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.element.viewlevel
 * @since       3.0.6
 */
class Viewlevel extends ElementlistModel implements SubscriberInterface
{
	protected $app; // Provided by the CSMPlugin interface

	/**
	 * Db table field type
	 *
	 * @var string
	 */
	protected $fieldDesc = 'INT(%s)';

	/**
	 * Db table field size
	 *
	 * @var string
	 */
	protected $fieldSize = '3';

	/**
	 * Array of id, label's queried from #__viewlevel
	 *
	 * @var array
	 */
	protected $allOpts = null;

	/**
	 * Returns the javascript import map name for the plugin javascript.
	 *
	 * @return  string
	 *
	 * @since   5.0
	 */
	public function getImportMapName()
	{
		return 'import { FbPlgElementViewlevel } from "@fbplgelementviewlevel";';
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
	 * @param   array  $data           To pre-populate element with
	 * @param   int    $repeatCounter  Repeat group counter
	 *
	 * @return  string	Elements html
	 */
	public function render($data, $repeatCounter = 0)
	{
		$htmlName = $this->getHTMLName($repeatCounter);
		$name = $this->getFullName(true, false);
		$id = $this->getHTMLId($repeatCounter);
		$selected = $this->user->getAuthorisedViewLevels();
		arsort($selected);
		$selected = array_shift($selected);

		if (isset($data[$name]))
		{
			$selected = !is_array($data[$name]) ? explode(',', $data[$name]) : $data[$name];
		}

		if (!$this->isEditable())
		{
			$data = new \stdClass;

			return $this->renderListData($selected, $data);
		}

		$options = array();

		$layout = $this->getLayout('form');
		$layoutData = new \stdClass;
		$layoutData->name = $htmlName;
		$layoutData->selected = $selected;
		$layoutData->options = $options;
		$layoutData->id = $id;

		return $layout->render($layoutData);
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
		$opts = $this->getElementJSOptions($repeatCounter);

		return array('FbPlgElementViewlevel', $id, $opts);
	}

	/**
	 * Get all user groups (id/title)
	 *
	 * @return  array
	 */
	private function allOpts()
	{
		if (!isset($this->allOpts))
		{
			$db = $this->_db;
			$query = $db->getQuery(true);
			$query->select('id, title');
			$query->from($db->qn('#__viewlevels'));
			$db->setQuery($query);
			$this->allOpts = $db->loadObjectList('id');
		}

		return $this->allOpts;
	}

	/**
	 * Get sub option values
	 *
	 * @param   array  $data  Form data. If submitting a form, we want to use that form's data and not
	 *                        re-query the form Model for its data as with multiple plugins of the same type
	 *                        this was getting the plugin params out of sync.
	 *
	 * @return  array
	 */
	protected function getSubOptionValues($data = array())
	{
		$opts = $this->allOpts();
		$return = array();

		foreach ($opts as $opt)
		{
			$return[] = $opt->id;
		}

		return $return;
	}

	/**
	 * Get sub option labels
	 *
	 * @param   array  $data  Form data. If submitting a form, we want to use that form's data and not
	 *                        re-query the form Model for its data as with multiple plugins of the same type
	 *                        this was getting the plugin params out of sync.
	 *
	 * @return  array
	 */
	protected function getSubOptionLabels($data = array())
	{
		$opts = $this->allOpts();
		$return = array();

		foreach ($opts as $opt)
		{
			$return[] = $opt->title;
		}

		return $return;
	}
}
