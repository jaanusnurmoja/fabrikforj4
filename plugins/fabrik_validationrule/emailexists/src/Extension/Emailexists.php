<?php
/**
 * Email Already Registered Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.emailexists
 * @copyright   Copyright (C) 2005-2025  Fabrikar, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Plugin\Validationrule\Emailexists\Extension;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Component\Fabrik\Site\Model\PluginvalidationruleModel;
use Fabrik\Library\Fabrik\FabrikArray;
use Fabrik\Library\Fabrik\FabrikWorker;
use Joomla\CMS\Language\Text;
use Joomla\Event\SubscriberInterface;

/**
 * Email Already Registered Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.emailexists
 * @since       3.0
 */
class EmailExists extends PluginvalidationruleModel implements SubscriberInterface
{
	protected $app; // Provided by the CSMPlugin interface

	/**
	 * Plugin name
	 *
	 * @var string
	 */
	protected $pluginName = 'emailexists';

	/**
	 * Returns the javascript import map name for the plugin javascript.
	 *
	 * @return  string	 *
	 * @since   5.0
	 */
	public function getImportMapName()
	{
		return 'import { FbPlgValEmailexists } from "@fbplgvalemailexists";';
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
		if (empty($data))
		{
			return false;
		}

		if (is_array($data))
		{
			$data = $data[0];
		}

		$params = $this->getParams();
		$elementModel = $this->elementModel;
		$orNot = $params->get('emailexists_or_not', 'fail_if_exists');
		$userField = $params->get('emailexists_user_field');
		$userId = 0;

		if ((int) $userField !== 0)
		{
			$user_elementModel = FabrikWorker::getPluginManager()->getElementPlugin($userField);
			$user_fullName = $user_elementModel->getFullName(true, false);
			$userField = $user_elementModel->getFullName(false, false);
		}

		if (!empty($userField))
		{
			// $$$ the array thing needs fixing, for now just grab 0
			$formData = $elementModel->getForm()->formData;
			$userId = FabrikArray::getValue($formData, $user_fullName . '_raw', FabrikArray::getValue($formData, $user_fullName, ''));

			if (is_array($userId))
			{
				$userId = FabrikArray::getValue($userId, 0, '');
			}
		}

		jimport('joomla.user.helper');
		$db = FabrikWorker::getDbo(true);
		$query = $db->getQuery(true);
		$query->select('id')->from('#__users')->where('email = ' . $db->quote($data));
		$db->setQuery($query);
		$result = $db->loadResult();

		if ($this->user->get('guest'))
		{
			if (!$result)
			{
				if ($orNot == 'fail_if_exists')
				{
					return true;
				}
			}
			else
			{
				if ($orNot == 'fail_if_not_exists')
				{
					return true;
				}
			}

			return false;
		}
		else
		{
			if (!$result)
			{
				return ($orNot == 'fail_if_exists') ? true : false;
			}
			else
			{
				if ($userId != 0)
				{
					if ($result == $userId)
					{
						return ($orNot == 'fail_if_exists') ? true : false;
					}

					return false;
				}
				else
				{
					if ($result == $this->user->get('id')) // The connected user is editing his own data
					{
						return ($orNot == 'fail_if_exists') ? true : false;
					}

					return false;
				}
			}
		}

		return false;
	}

	/**
	 * Gets the hover/alt text that appears over the validation rule icon in the form
	 *
	 * @return	string	label
	 */
	protected function getLabel()
	{
		$params = $this->getParams();
		$cond = $params->get('emailexists_or_not');

		if ($cond == 'fail_if_not_exists')
		{
			return Text::_('PLG_VALIDATIONRULE_EMAILEXISTS_LABEL_NOT');
		}
		else
		{
			return parent::getLabel();
		}
	}
}
