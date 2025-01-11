<?php
/**
 * Plugin element to render mootools slider
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.element.slider
 * @copyright   Copyright (C) 2005-2025  Fabrikar, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Plugin\Element\Slider\Extension;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Component\Fabrik\Site\Model\PluginelementModel;
use Fabrik\Library\Fabrik\FabrikHtml;
use Joomla\Event\SubscriberInterface;

jimport('joomla.application.component.model');

/**
 * Plugin element to render mootools slider
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.element.slider
 * @since       3.0
 */

class Slider extends PluginelementModel implements SubscriberInterface
{
	protected $app; // Provided by the CSMPlugin interface

	/**
	 * If the element 'Include in search all' option is set to 'default' then this states if the
	 * element should be ignored from search all.
	 * @var bool  True, ignore in extended search all.
	 */
	protected $ignoreSearchAllDefault = true;

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
	protected $fieldSize = '6';

	/**
	 * Returns the javascript import map name for the plugin javascript.
	 *
	 * @return  string
	 *
	 * @since   5.0
	 */
	public function getImportMapName()
	{
		return 'import { FbPlgElementSlider } from "@fbplgelementslider";';
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
	 * @return  string	elements html
	 */

	public function render($data, $repeatCounter = 0)
	{
		$params = $this->getParams();
		$width = (int) $params->get('slider_width', 250);
		$val = $this->getValue($data, $repeatCounter);

		if (!$this->isEditable())
		{
			return $val;
		}

		$labels = explode(',', $params->get('slider-labels', ''));
		FabrikHtml::addPath(COM_FABRIK_BASE . 'plugins/fabrik_element/slider/images/', 'image', 'form', false);

		$layout = $this->getLayout('form');
		$layoutData = new \stdClass;
		$layoutData->id = $this->getHTMLId($repeatCounter);;
		$layoutData->name = $this->getHTMLName($repeatCounter);;
		$layoutData->value = $val;
		$layoutData->width = $width;
		$layoutData->showNone = $params->get('slider-shownone');
		$layoutData->outSrc = FabrikHtml::image('clear_rating_out.png', 'form', $this->tmpl, array(), true);
		$layoutData->labels = $labels;
		$layoutData->spanWidth = floor(($width - (2 * count($labels))) / count($labels));

		$layoutData->align = array();

		for ($i = 0; $i < count($labels); $i++)
		{
			switch ($i)
			{
				case 0:
					$align = 'left';
					break;
				case count($labels) - 1:
					$align = 'right';
					break;
				case 1:
				default:
					$align = 'center';
					break;
			}

			$layoutData->align[] = $align;
		}

		return $layout->render($layoutData);
	}

	/**
	 * Manipulates posted form data for insertion into database
	 *
	 * @param   mixed  $val   This elements posted form data
	 * @param   array  $data  Posted form data
	 *
	 * @return  mixed
	 */

	public function storeDatabaseFormat($val, $data)
	{
		// If clear button pressed then store as null.
		if ($val == '')
		{
			$val = null;
		}

		return $val;
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
		$params = $this->getParams();
		$id = $this->getHTMLId($repeatCounter);
		$opts = $this->getElementJSOptions($repeatCounter);
		$opts->steps = (int) $params->get('slider-steps', 100);
		$data = $this->getFormModel()->data;
		$opts->value = $this->getValue($data, $repeatCounter);

		return array('FbPlgElementSlider', $id, $opts);
	}
}
