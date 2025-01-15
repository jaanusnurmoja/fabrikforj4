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

use Joomla\CMS\Form\Form;

#[\AllowDynamicProperties]
class FbForm extends Form 
{
	public $model;
	public $repeatCounter;

	public function __construct(...$args) {
		parent::__construct(...$args);
	}
};