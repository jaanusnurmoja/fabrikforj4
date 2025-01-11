<?php
/**
 * Not Empty Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.notempty
 * @copyright   Copyright (C) 2005-2025  Fabrikar, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Plugin\Validationrule\Notempty\Extension;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Component\Fabrik\Site\Model\PluginvalidationruleModel;
use Joomla\Event\SubscriberInterface;

/**
 * Not Empty Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.notempty
 * @since       3.0
 */
class Notempty extends PluginvalidationruleModel implements SubscriberInterface
{
	protected $app; // Provided by the CSMPlugin interface

	/**
	 * Plugin name
	 *
	 * @var string
	 */
	protected $pluginName = 'notempty';

	/**
	 * Returns the javascript import map name for the plugin javascript.
	 *
	 * @return  string	 *
	 * @since   5.0
	 */
	public function getImportMapName()
	{
		return 'import { FbPlgValNotempty } from "@fbplgvalnotempty";';
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
		if (method_exists($this->elementModel, 'dataConsideredEmptyForValidation'))
		{
			$ok = $this->elementModel->dataConsideredEmptyForValidation($data, $repeatCounter);
		}
		else
		{
			$ok = $this->elementModel->dataConsideredEmpty($data, $repeatCounter);
		}

		return !$ok;
	}
}
