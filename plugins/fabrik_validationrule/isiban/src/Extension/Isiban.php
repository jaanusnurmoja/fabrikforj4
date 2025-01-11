<?php
/**
 * Is IBAN  Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.isiban
 * @copyright   Copyright (C) 2005-2017  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Plugin\Fabrik_validationrule\Isiban\Extension;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\Event\SubscriberInterface;

// Require the abstract plugin classes
require_once COM_FABRIK_FRONTEND . '/models/validation_rule.php';
require_once JPATH_ROOT . '/plugins/fabrik_validationrule/isiban/libs/php-iban.php';

/**
 * Is IBAN Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.isiban
 * @since       3.0
 */
class Isiban extends \PlgFabrik_Validationrule implements SubscriberInterface
{
	protected $app; // Provided by the CSMPlugin interface

	/**
	 * Plugin name
	 *
	 * @var string
	 */
	protected $pluginName = 'isiban';

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
		$allow_empty = $params->get('isiban-allow_empty');

		if ($allow_empty == '1' and empty($data))
		{
			return true;
		}

		return verify_iban($data);
	}

	/**
	 * Does the validation allow empty value?
	 * Default is false, can be overridden on per-validation basis (such as isiban)
	 *
	 * @return bool
	 */

	protected function allowEmpty()
	{
		$params = $this->getParams();
		$allow_empty = $params->get('isiban-allow_empty');

		return $allow_empty == '1';
	}
}
