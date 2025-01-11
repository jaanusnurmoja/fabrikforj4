<?php
/**
 * List Copy Row plugin
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.list.copy
 * @copyright   Copyright (C) 2005-2025  Fabrikar, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Plugin\List\Copy\Extension;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Component\Fabrik\Site\Model\PluginlistModel;
use Joomla\CMS\Language\Text;
use Joomla\Event\SubscriberInterface;


/**
 * Add an action button to the list to copy rows
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.list.copy
 * @since       3.0
 */
class Copy extends PluginlistModel implements SubscriberInterface
{
	protected $app; // Provided by the CSMPlugin interface

	/**
	 * Button prefix
	 *
	 * @var string
	 */
	protected $buttonPrefix = 'copy';

	/**
	 * Returns the javascript import map name for the plugin javascript.
	 *
	 * @return  string	 *
	 * @since   5.0
	 */
	public function getImportMapName()
	{
		return 'import { FbCopy } from "@fbcopy";';
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
        $pluginMethods = ["onLoadJavascriptInstance" => "onLoadJavascriptInstance"];

        return array_merge(parent::getSubscribedEvents(), $pluginMethods);
    }

	/**
	 * Prep the button if needed
	 *
	 * @param   array  &$args  Arguments
	 *
	 * @return  bool;
	 */
	public function button(&$args)
	{
		parent::button($args);

		return true;
	}

	/**
	 * Get the button label
	 *
	 * @return  string
	 */
	protected function buttonLabel()
	{
		return Text::_($this->getParams()->get('copytable_button_label', parent::buttonLabel()));
	}

	/**
	 * Get button image
	 *
	 * @since   3.1b
	 *
	 * @return   string  image
	 */

	protected function getImageName()
	{
		$img = parent::getImageName();

		if ($img === 'copy.png')
		{
			$img = 'copy';
		}

		return $img;
	}

	/**
	 * Get the parameter name that defines the plugins acl access
	 *
	 * @return  string
	 */
	protected function getAclParam()
	{
		return 'copytable_access';
	}

	/**
	 * Can the plug-in select list rows
	 *
	 * @return  bool
	 */
	public function canSelectRows()
	{
		return true;
	}

	/**
	 * Do the plug-in action
	 *
	 * @param   array  $opts  Custom options
	 *
	 * @return  bool
	 */
	public function process($opts = array())
	{
		$model = $this->getModel();
		$ids = $this->app->input->get('ids', array(), 'array');
		$formModel = $model->getFormModel();

		return $model->copyRows($ids);
	}

	/**
	 * Get the message generated in process()
	 *
	 * @param   int  $c  plugin render order
	 *
	 * @return  string
	 */
	public function process_result($c)
	{
		$ids = $this->app->input->get('ids', array(), 'array');

		return Text::sprintf('PLG_LIST_ROWS_COPIED', count($ids));
	}

	/**
	 * Return the javascript to create an instance of the class defined in formJavascriptClass
	 *
	 * @param   array  $args  Array [0] => string table's form id to contain plugin
	 *
	 * @return bool
	 */
	public function onLoadJavascriptInstance($args)
	{
		parent::onLoadJavascriptInstance($args);
		$opts = $this->getElementJSOptions();
		$opts = json_encode($opts);
		$this->jsInstance = "new FbListCopy($opts)";

		return true;
	}

	/**
	 * Load the AMD module class name
	 *
	 * @return string
	 */
	public function loadJavascriptClassName_result()
	{
		return 'FbListCopy';
	}
}
