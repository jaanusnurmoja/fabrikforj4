<?php
/**
 * Is Email Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.isemail
 * @copyright   Copyright (C) 2005-2025  Fabrikar, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Plugin\Validationrule\Isemail\Extension;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Component\Fabrik\Site\Model\PluginvalidationruleModel;
use Fabrik\Library\Fabrik\FabrikWorker;
use Joomla\Event\SubscriberInterface;

/**
 * Is Email Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.isemail
 * @since       3.0
 */
class IsEmail extends PluginvalidationruleModel implements SubscriberInterface
{
	protected $app; // Provided by the CSMPlugin interface

	/**
	 * Plugin name
	 *
	 * @var string
	 */
	protected $pluginName = 'isemail';

	/**
	 * Returns the javascript import map name for the plugin javascript.
	 *
	 * @return  string	 *
	 * @since   5.0
	 */
	public function getImportMapName()
	{
		return 'import { FbPlgValIsemail } from "@fbplgvalisemail";';
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
		$email = $data;

		// Could be a drop-down with multi-values
		if (is_array($email))
		{
			$email = implode('', $email);
		}

		// Decode as it can be posted via ajax
		// (but first % encode any + characters, as urldecode() will turn + into space)
		$email = urldecode(str_replace('+', '%2B', $email));
		$params = $this->getParams();
		$allow_empty = $params->get('isemail-allow_empty');

		if ($allow_empty == '1' and empty($email))
		{
			return true;
		}

		// $$$ hugh - let's try using new helper func instead of rolling our own.
		if (FabrikWorker::isEmail($email))
		{
			if ($params->get('isemail-check_mx', '0') === '1')
			{
				list($user, $domain) = explode('@', $data);
				if (!checkdnsrr($domain, 'MX')) {
					return false;
				}
			}
			return true;
		}
		else
		{
			return false;
		};
	}

	/**
	 * Does the validation allow empty value?
	 * Default is false, can be overridden on per-validation basis (such as isnumeric)
	 *
	 * @return  bool
	 */
	protected function allowEmpty()
	{
		$params = $this->getParams();
		$allow_empty = $params->get('isemail-allow_empty');

		return $allow_empty == '1';
	}
}
