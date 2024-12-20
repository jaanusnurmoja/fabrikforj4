<?php
/**
 * Renders a Fabrik Help link
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 * @since       3.0.9
 */
namespace Fabrikar\Component\Fabrik\Administrator\Field;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\Language\Text;
use Joomla\CMS\Form\FormField;

/**
 * Renders a Fabrik Help link
 *
 * @package  Fabrik
 * @since    3.0.9
 */

class HelplinkField extends FormField
{
	/**
	 * Element name
	 *
	 * @access	protected
	 * @var		string
	 */
	protected $title = 'Helplink';

	/**
	 * Return blank label
	 *
	 * @return  string  The field label markup.
	 */

	protected function getLabel()
	{
		$url = $this->element['url'] ? (string) $this->element['url'] : '';
		$text = $this->element['name'] ? (string) $this->element['name'] : 'Help';
		$js = 'Joomla.popupWindow(\'' . Text::_($url) . '\', \'Help\', 800, 600, 1);return false';
		$label = '<div style="float:left;">';
		$label .= '<a class="btn btn-sm btn-info" href="#" rel="help" onclick="' . $js . '">';
		$label .= '<i class="icon-help icon-32-help icon-question-sign"></i> ' . Text::_($text) . '</a></div>';
		
		return $label;
	}

	/**
	 * Get the input - a right floated help icon
	 *
	 * @return string
	 */

	public function getInput()
	{
		return '';
	}
}
