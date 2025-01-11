<?php
/**
 * Is Not Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.isnot
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Plugin\Fabrik_validationrule\Isnot\Extension;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\Language\Text;
use Joomla\Event\SubscriberInterface;

// Require the abstract plugin class
require_once COM_FABRIK_FRONTEND . '/models/validation_rule.php';

/**
 * Is Not Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.isnot
 * @since       3.0
 */
class IsNot extends \PlgFabrik_Validationrule implements SubscriberInterface
{
	protected $app; // Provided by the CSMPlugin interface

	/**
	 * Plugin name
	 *
	 * @var string
	 */
	protected $pluginName = 'isnot';

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
		if (is_array($data))
		{
			$data = implode('', $data);
		}

		$params = $this->getParams();
		$isNot = $params->get('isnot-isnot');
		$isNot = explode('|', $isNot);

		foreach ($isNot as $i)
		{
			if ((string) $data === (string) $i)
			{
				return false;
			}
		}

		return true;
	}

	/**
	 * Gets the hover/alt text that appears over the validation rule icon in the form
	 *
	 * @return  string	label
	 */
	protected function getLabel()
	{
		$params = $this->getParams();
		$tipText = $params->get('tip_text', '');

		if ($tipText !== '')
		{
			return Text::_($tipText);
		}

		$isNot = $params->get('isnot-isnot');

		return Text::sprintf('PLG_VALIDATIONRULE_ISNOT_LABEL', $isNot);
	}
}
