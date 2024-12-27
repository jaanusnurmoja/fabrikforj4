<?php
/**
 * HTMLHelper element helper
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 * @since       3.0
 */

namespace Fabrik\Component\Fabrik\Administrator\Helper;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\Factory;
use Joomla\CMS\HTML\HTMLHelper;

/**
 * HTMLHelper element helper
 *
 * @package  Fabrik
 * @since    3.0
 */

class FabrikElementHelper
{
	/**
	 * Get html id
	 *
	 * @param   object  $element       field
	 * @param   string  $control_name  control name
	 * @param   string  $name          name
	 *
	 * @return string
	 */

	public static function getId($element, $control_name, $name)
	{
		if (method_exists($element, 'getId'))
		{
			$id = $element->getId($control_name, $name);
		}
		else
		{
			$id = "$control_name.$name";
		}

		return $id;
	}

	/**
	 * Get full name
	 *
	 * @param   object  $element       field
	 * @param   string  $control_name  control name
	 * @param   string  $name          name
	 *
	 * @return string
	 */

	public static function getFullName($element, $control_name, $name)
	{
		if (method_exists($element, 'getFullName'))
		{
			$fullName = $element->getFullName($control_name, $name);
		}
		else
		{
			$fullName = $control_name . '[' . $name . ']';
		}

		return $fullName;
	}

	/**
	 * Get repeat counter
	 *
	 * @param   object  $element  Jhtml field
	 *
	 * @return mixed
	 */

	public static function getRepeatCounter($element)
	{
		if (method_exists($element, 'getRepeatCounter'))
		{
			$c = $element->getRepeatCounter();
		}
		else
		{
			$c = false;
		}

		return $c;
	}

	/**
	 * Get repeat
	 *
	 * @param   object  $element  Jhtml field
	 *
	 * @return mixed
	 */

	public static function getRepeat($element)
	{
		if (method_exists($element, 'getRepeat'))
		{
			$c = $element->getRepeat();
		}
		else
		{
			$c = 0;
		}

		return $c;
	}

	/**
	 * Gets a list of the actions that can be performed.
	 *
	 * @param   int  $categoryId  The category ID.
	 *
	 * @since	1.6
	 *
	 * @return	CMSObject
	 */

	public static function getActions($categoryId = 0)
	{
		$user = Factory::getUser();
		$result = new \Joomla\Registry\Registry();

		if (empty($categoryId))
		{
			$assetName = 'com_fabrik';
		}
		else
		{
			$assetName = 'com_fabrik.category.' . (int) $categoryId;
		}

		$actions = array('core.admin', 'core.manage', 'core.create', 'core.edit', 'core.edit.state', 'core.delete');

		foreach ($actions as $action)
		{
			$result->set($action, $user->authorise($action, $assetName));
		}

		return $result;
	}

	/**
	 * Set the layout based on Joomla version
	 * Allows for loading of new bootstrap admin templates in J3.0+
	 *
	 * @param   JView  &$view  current view to setLayout for
	 *
	 * @return  void
	 */

	public static function setViewLayout(&$view)
	{
			// If rendering a list inside a form and viewing in admin - there were layout name conflicts (so renamed bootstrap to admin_bootstrap)
			$layout = $view->getName() === 'list' ? 'admin_bootstrap' : 'edit';
			$view->setLayout($layout);
	}
}
