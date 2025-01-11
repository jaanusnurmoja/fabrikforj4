<?php
/**
 * Is Greater or Less than Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.isgreaterorlessthan
 * @copyright   Copyright (C) 2005-2025  Fabrikar, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Plugin\Validationrule\Isgreaterorlessthan\Extension;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Component\Fabrik\Site\Model\PluginvalidationruleModel;
use Fabrik\Library\Fabrik\FabrikWorker;
use Joomla\Event\SubscriberInterface;

/**
 * Is Greater or Less than Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.isgreaterorlessthan
 * @since       3.0
 */
class Isgreaterorlessthan extends PluginvalidationruleModel implements SubscriberInterface
{
	protected $app; // Provided by the CSMPlugin interface

	/**
	 * Plugin name
	 *
	 * @var string
	 */
	protected $pluginName = 'isgreaterorlessthan';

	/**
	 * Returns the javascript import map name for the plugin javascript.
	 *
	 * @return  string	 *
	 * @since   5.0
	 */
	public function getImportMapName()
	{
		return 'import { FbPlgValIsgreaterorlessthan } from "@fbplgvalisgreaterorlessthan";';
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
	public function validate($data, $repeatCounter)
	{
		// Could be a drop-down with multi-values
		if (is_array($data))
		{
			$data = implode('', $data);
		}

		$params = $this->getParams();
		$elementModel = $this->elementModel;
		$formData = $elementModel->getForm()->formData;
		$cond = $params->get('isgreaterorlessthan-greaterthan');
		$compareValue = $params->get('compare_value', '');

		switch ($cond)
		{
			case '0':
				$cond = '<';
				$base = $data < $compareValue;
				break;
			case '1':
				$cond = '>';
				$base = $data > $compareValue;
				break;
			case '2':
				$cond = '<=';
				$base = $data <= $compareValue;
				break;
			case '3':
				$cond = '>=';
				$base = $data >= $compareValue;
				break;
			case '4':
			default:
				$cond = '==';
				$base = $data == $compareValue;
				break;
		}

		$otherElementModel = $this->getOtherElement();
		$compare = $compareValue === '' ? $otherElementModel->getValue($formData, $repeatCounter) : $compareValue;
		$compare = is_array($compare) ? array_pop($compare) : $compare;

		if ($this->allowEmpty() && ($data === '' || $compare === ''))
		{
			return true;
		}

		if ($compareValue === '')
		{
			$res = $elementModel->greaterOrLessThan($data, $cond, $compare);
		}
		else
		{
			return $base;
		}

		return $res;
	}

	/**
	 * Does the validation allow empty value?
	 * Default is false, can be overridden on per-validation basis (such as isnumeric)
	 *
	 * @return	bool
	 */
	protected function allowEmpty()
	{
		$params = $this->getParams();
		$allow_empty = $params->get('isgreaterorlessthan-allow_empty');

		return $allow_empty == '1';
	}

	/**
	 * Get the other element to compare this elements data against
	 *
	 * @return  object element model
	 */
	private function getOtherElement()
	{
		$params = $this->getParams();
		$otherField = $params->get('isgreaterorlessthan-comparewith');

		return FabrikWorker::getPluginManager()->getElementPlugin($otherField);
	}
}
