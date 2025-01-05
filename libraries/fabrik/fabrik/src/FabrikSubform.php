<?php
/**
 * Subform helper class
 *
 * @package     Joomla
 * @subpackage  Fabrik.helpers
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Library\Fabrik;

// No direct access
defined('_JEXEC') or die('Restricted access');

/**
 * Subform helper class
 *
 * @package     Joomla
 * @subpackage  Fabrik.helpers
 * @since       3.0
 */

class FabrikSubform {

	/** 
	 * A function to extract and array of values for a specific subform field 
	 * @param   array   &$array   A named array
	 * @param   string  $name     The key to search for
	 * @param   mixed   $default  The default value to give if no key found
	 **/
	public static function getValues(&$array, $name, $default = null) {
		$result = [];
		foreach ($array as $subFormKey => $subform) {
			$result[$subFormKey] = $subform[$name];
		}
		return $result;
	} 
}