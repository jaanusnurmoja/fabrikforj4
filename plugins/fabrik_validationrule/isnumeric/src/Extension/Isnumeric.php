<?php
/**
 * Is Numeric Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.isnumeric
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Plugin\Fabrik_validationrule\Isnumeric\Extension;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\Event\SubscriberInterface;

// Require the abstract plugin classes
require_once COM_FABRIK_FRONTEND . '/models/validation_rule.php';

/**
 * Is Numeric Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.isnumeric
 * @since       3.0
 */
class IsNumeric extends \PlgFabrik_Validationrule implements SubscriberInterface
{
	protected $app; // Provided by the CSMPlugin interface

	/**
	 * Plugin name
	 *
	 * @var string
	 */
	protected $pluginName = 'isnumeric';

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
		$allow_empty = $params->get('isnumeric-allow_empty');

		if ($allow_empty == '1' and empty($data))
		{
			return true;
		}

		return is_numeric($this->elementModel->unNumberFormat($data));
	}

	/**
	 * Does the validation allow empty value?
	 * Default is false, can be overridden on per-validation basis (such as isnumeric)
	 *
	 * @return bool
	 */

	protected function allowEmpty()
	{
		$params = $this->getParams();
		$allow_empty = $params->get('isnumeric-allow_empty');

		return $allow_empty == '1';
	}
}
