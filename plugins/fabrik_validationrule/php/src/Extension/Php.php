<?php
/**
 * PHP Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.php
 * @copyright   Copyright (C) 2005-2025  Fabrikar, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Plugin\Validationrule\Php\Extension;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Component\Fabrik\Site\Model\PluginvalidationruleModel;
use Fabrik\Helpers\Php as PhpHelper;
use Fabrik\Library\Fabrik\FabrikWorker;
use Joomla\CMS\Plugin\PluginHelper;
use Joomla\Event\SubscriberInterface;
use Joomla\Registry\Registry;

/**
 * PHP Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.php
 * @since       3.0
 */
class Php extends  PluginvalidationruleModel implements SubscriberInterface
{

	protected $app; // Provided by the CSMPlugin interface
	/**
	 * Plugin name
	 *
	 * @var string
	 */
	protected $pluginName = 'php';

	/**
	 * Returns the javascript import map name for the plugin javascript.
	 *
	 * @return  string	 *
	 * @since   5.0
	 */
	public function getImportMapName()
	{
		return 'import { FbPlgValPhp } from "@fbplgvalphp";';
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
	 * Validate the elements data against the rule
	 *
	 * @param   string  $data           To check
	 * @param   int     $repeatCounter  Repeat group counter
	 *
	 * @return  bool  true if validation passes, false if fails
	 */
	public function validate($data, $repeatCounter = 0) {
		// For multi-select elements
		if (is_array($data)) {
			$data = implode('', $data);
		}

		$params = $this->getParams();
		$doMatch = $params->get('php-match');

		if ($doMatch) {
			return $this->_eval($data, $repeatCounter);
		}

		return true;
	}

	/**
	 * Checks if the validation should replace the submitted element data
	 * if so then the replaced data is returned otherwise original data returned
	 *
	 * @param   string  $data           Original data
	 * @param   int     $repeatCounter  Repeat group counter
	 *
	 * @return  string	original or replaced data
	 */
	public function replace($data, $repeatCounter = 0) {
		$params = $this->getParams();
		$doMatch = $params->get('php-match');

		if (!$doMatch) {
			return $this->_eval($data, $repeatCounter);
		}

		return $data;
	}

	/**
	 * Run eval
	 *
	 * @param   string  $data  Original data
	 * @param   int     $repeatCounter  Repeat group counter
	 *
	 * @return  string	Evaluated PHP function
	 */

	private function _eval($data, $repeatCounter = 0) {
		$params = $this->getParams();
		$elementModel = $this->elementModel;
		$formModel = $elementModel->getFormModel();
		$formData = $formModel->formData;
		$w = new FabrikWorker;
		$phpCode = $params->get('php-code');
		$phpCode = $w->parseMessageForPlaceHolder($phpCode, $formData, true, true);
		/**
		 * $$$ hugh - added trigger_error(""), which will "clear" any existing errors,
		 * otherwise logEval will pick up and report notices and warnings generated
		 * by the rest of our code, which can be VERY confusing.  Note that this required a tweak
		 * to logEval, as error_get_last won't be null after doing this, but $error['message'] will
		 * be empty.
		 * $$$ hugh - moved the $trigger_error() into a helper func
		 */
		FabrikWorker::clearEval();
		$return = PhpHelper::Eval(['code' => $phpCode, 'vars' => ['thisValidation' => $this, 'data' => $data, 'formData' => $formData,'formModel'=>$formModel,'repeatCounter'=>$repeatCounter,'elementModel'=>$elementModel]]);
		FabrikWorker::logEval($return, 'Caught exception on php validation of ' . $elementModel->getFullName(true, false) . ': %s');

		return $return;
	}

	/**
	 * Get the base icon image as defined by the J Plugin options
	 *
	 * @since   3.1b2
	 *
	 * @return  string
	 */
	public function iconImage() {
		$plugin = PluginHelper::getPlugin('Validationrule', $this->pluginName);
		$globalParams = new Registry($plugin->params);
		$default = $globalParams->get('icon', 'star');
		$params = $this->getParams();

		return $params->get('icon', $default);
	}
}
