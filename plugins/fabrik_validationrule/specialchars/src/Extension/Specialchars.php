<?php
/**
 * Special Characters Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.specialchars
 * @copyright   Copyright (C) 2005-2025  Fabrikar, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Plugin\Validationrule\Specialchars\Extension;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Component\Fabrik\Site\Model\PluginvalidationruleModel;
use Joomla\Event\SubscriberInterface;

/**
 * Special Characters Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.specialchars
 * @since       3.0
 */
class SpecialChars extends PluginvalidationruleModel implements SubscriberInterface
{
	protected $app; // Provided by the CSMPlugin interface

	/**
	 * Plugin name
	 *
	 * @var string
	 */
	protected $pluginName = 'specialchars';

	/**
	 * Returns the javascript import map name for the plugin javascript.
	 *
	 * @return  string	 *
	 * @since   5.0
	 */
	public function getImportMapName()
	{
		return 'import { FbPlgValSpecialchars } from "@fbplgvalspecialchars";';
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
		// For multi-select elements
		if (is_array($data))
		{
			$data = implode('', $data);
		}

		$params = $this->getParams();
		$doMatch = $params->get('specialchars-match');

		if ($doMatch)
		{
			$v = $params->get('specalchars');
			$v = explode(',', $v);

			foreach ($v as $c)
			{
				if (!empty($c) && strstr($data, $c))
				{
					return false;
				}
			}
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
	public function replace($data, $repeatCounter)
	{
		$params = $this->getParams();
		$doMatch = $params->get('specialchars-match');

		if (!$doMatch)
		{
			$replace = $params->get('specialchars-replacestring');

			if ($replace === '_default')
			{
				$replace = '';
			}

			$v = $params->get('specalchars');
			$v = explode(',', $v);

			foreach ($v as $c)
			{
				if (!empty($c))
				{
					$data = str_replace($c, $replace, $data);
				}
			}
		}

		return $data;
	}
}
