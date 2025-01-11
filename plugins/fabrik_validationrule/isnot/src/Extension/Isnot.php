<?php
/**
 * Is Not Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.isnot
 * @copyright   Copyright (C) 2005-2025  Fabrikar, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Plugin\Validationrule\Isnot\Extension;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Component\Fabrik\Site\Model\PluginvalidationruleModel;
use Joomla\CMS\Language\Text;
use Joomla\Event\SubscriberInterface;

/**
 * Is Not Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.isnot
 * @since       3.0
 */
class IsNot extends PluginvalidationruleModel implements SubscriberInterface
{
	protected $app; // Provided by the CSMPlugin interface

	/**
	 * Plugin name
	 *
	 * @var string
	 */
	protected $pluginName = 'isnot';

	/**
	 * Returns the javascript import map name for the plugin javascript.
	 *
	 * @return  string	 *
	 * @since   5.0
	 */
	public function getImportMapName()
	{
		return 'import { FbPlgValIsnot } from "@fbplgvalisnot";';
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
