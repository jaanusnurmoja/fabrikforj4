<?php
/**
 * Plugin element to render button
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.element.button
 * @copyright   Copyright (C) 2005-2023  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Plugin\Fabrik_element\Button\Extension;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\Language\Text;
use Joomla\Event\SubscriberInterface;

/**
 * Plugin element to render button
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.element.button
 * @since       3.0
 */
class Button extends \PlgFabrik_Element implements SubscriberInterface
{
	protected $app; // Provided by the CSMPlugin interface

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

        return array_merge(method_exists('\PlgFabrik_Element', 'getSubscribedEvents') ? parent::getSubscribedEvents() : [], $pluginMethods);
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
		$element = $this->getElement();
		$params = $this->getParams();
		$class = $params->get('bootstrap_class', 'btn-secondary') . ' fabrikinput  button btn';
		$icon = $params->get('bootstrap_icon', '');
		$type = $params->get('button_type', 'button');

		$layout = $this->getLayout('form');
		$displayData = new \stdClass;
		$displayData->class = $class;
		$displayData->id = $id;
		$displayData->name = $name;
		$displayData->label = Text::_($element->label);;
		$displayData->icon = $icon;
		$displayData->type = $type;


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
		$opts = $this->getElementJSOptions($repeatCounter);

		return array('FbButton', $id, $opts);
	}

	/**
	 * Get an array of element html ids and their corresponding
	 * js events which trigger a validation.
	 * Examples of where this would be overwritten include timedate element with time field enabled
	 *
	 * @param   int  $repeatCounter  repeat group counter
	 *
	 * @return  array  html ids to watch for validation
	 */
	public function getValidationWatchElements($repeatCounter)
	{
		$id = $this->getHTMLId($repeatCounter);
		$ar = array('id' => $id, 'triggerEvent' => 'click');

		return array($ar);
	}
}
