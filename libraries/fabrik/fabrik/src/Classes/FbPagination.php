<?php
/**
 * Fabrik Joomla\CMS\Form\Form overloader
 * Used for lso we can add dynamic properties to the Form class
 * and not get php warnings or failures.
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @since       5.0
 */

namespace Fabrik\Library\Fabrik\Classes;

use Joomla\CMS\Pagination\Pagination;

class FbPagination extends Pagination 
{
	public tmpl;
};