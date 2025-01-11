<?php
/**
 * Is Alpha Numeric Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.isalphanumeric
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Plugin\Fabrik_validationrule\Isalphanumeric\Extension;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\Event\SubscriberInterface;

// Require the abstract plugin class
require_once COM_FABRIK_FRONTEND . '/models/validation_rule.php';

/**
 * Is Alpha Numeric Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.isalphanumeric
 * @since       3.0
 */
class Isalphanumeric extends \PlgFabrik_Validationrule implements SubscriberInterface
{
	protected $app; // Provided by the CSMPlugin interface

	/**
	 * Plugin name
	 *
	 * @var string
	 */
	protected $pluginName = 'isalphanumeric';

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

		if ($data == '')
		{
			return false;
		}

		// Not a word character
		preg_match('/[^\w\s]/', $data, $matches);

		return empty($matches) ? true : false;
	}
}
