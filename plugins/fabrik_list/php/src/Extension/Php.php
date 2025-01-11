<?php
/**
 *  Add an action button to run PHP
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.list.php
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Plugin\List\Php\Extension;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Component\Fabrik\Site\Model\PluginlistModel;
use Fabrik\Library\Fabrik\FabrikArray;
use Fabrik\Helpers\Php as PhpHelper;
use Joomla\CMS\Factory;
use Joomla\CMS\Filter\InputFilter;
use Joomla\CMS\Language\Text;
use Joomla\Event\SubscriberInterface;


/**
 *  Add an action button to run PHP
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.list.php
 * @since       3.0
 */

class Php extends PluginlistModel implements SubscriberInterface
{
	protected $app; // Provided by the CSMPlugin interface

	protected $buttonPrefix = 'php';

	protected $msg = null;

	/**
	 * Returns the javascript import map name for the plugin javascript.
	 *
	 * @return  string	 *
	 * @since   5.0
	 */
	public function getImportMapName()
	{
		return 'import { FbPlgListPhp } from "@fbplglistphp";';
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
		$heading = false;

		if (!empty($args))
		{
			$heading = \FabrikArray::getValue($args[0], 'heading');
		}

		if ($heading)
		{
			return true;
		}

		$params = $this->getParams();

		return (bool) $params->get('button_in_row', true);
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

		if ($img === 'php.png')
		{
			$img = 'lightning';
		}

		return $img;
	}

	/**
	 * Get the button label
	 *
	 * @return  string
	 */

	protected function buttonLabel()
	{
		return Text::_($this->getParams()->get('table_php_button_label', parent::buttonLabel()));
	}

	/**
	 * Get the parameter name that defines the plugins acl access
	 *
	 * @return  string
	 */

	protected function getAclParam()
	{
		return 'table_php_access';
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
		// We don't use $model, but user code may as it used to be an arg, so fetch it
		$model = $this->getModel();
		$params = $this->getParams();
		$f = InputFilter::getInstance();
		$file = $f->clean($params->get('table_php_file'), 'CMD');
		$statusMsg = null;

		if ($file == -1 || $file == '')
		{
			$code = $params->get('table_php_code');
			\FabrikWorker::clearEval();
			$php_result = PhpHelper::Eval(['code' => $code, 'vars'=> ['model'=>$model, 'params'=>$params, 'f'=>$f, 'statusMsg' => &$statusMsg]]); 
			\FabrikWorker::logEval($php_result, 'Eval exception : list php plugin : %s');
		}
		else
		{
			require_once JPATH_ROOT . '/plugins/fabrik_list/php/scripts/' . $file;
		}

		if (!empty($statusMsg))
		{
			$this->msg = $statusMsg;
		}

		return true;
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
        $params = $this->getParams();

        if ($params->get('table_php_show_msg', '1') === '0') {
            $package = $this->app->getUserState('com_fabrik.package', 'fabrik');
            $model = $this->getModel();
            $model->setRenderContext($model->getId());
            $context = 'com_' . $package . '.list' . $model->getRenderContext() . '.showmsg';
            $session = Factory::getSession();
            $session->set($context, false);
        }

		if (isset($this->msg))
		{
			return $this->msg;
		}
		else
		{
			$msg = Text::_($params->get('table_php_msg', Text::_('PLG_LIST_PHP_CODE_RUN')));

			return $msg;
		}
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
		$wa = Factory::getApplication()->getDocument()->getWebAssetManager();
		$wr = $wa->getRegistry();
		$wr->addRegistryFile("media/fabrik/plg_fabrik_list_php/joomla.asset.json");
		$wa->usePreset("plg.fabrik_list.php");
		parent::onLoadJavascriptInstance($args);
		$opts = $this->getElementJSOptions();
		$params = $this->getParams();
		$opts->js_code = $params->get('table_php_js_code', '');
		$opts->requireChecked = (bool) $params->get('table_php_require_checked', '1');
		$opts = json_encode($opts);
		$this->jsInstance = "new FbListPhp($opts)";

		return true;
	}

	/**
	 * Load the AMD module class name
	 *
	 * @return string
	 */
	public function loadJavascriptClassName_result()
	{
		return 'FbListPHP';
	}
}
