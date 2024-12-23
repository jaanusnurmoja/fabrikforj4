<?php
/**
 * Display a json loaded window with a repeatable set of sub fields
 *
 * @package     Joomla
 * @subpackage  Form
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Component\Fabrik\Administrator\Field;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\Form\Field\SubformField;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;

//jimport('joomla.form.formfield');
HTMLHelper::_('bootstrap.modal', '.selector', []);

/**
 * Display a json loaded window with a repeatable set of sub fields
 *
 * @package     Joomla
 * @subpackage  Form
 * @since       1.6
 */

class FabrikmodalsubformField extends SubformField
{

	protected $type = 'Fabrikmodalsubform';

	/**
	 * Method to get the html for the input field.
	 *
	 * @return  string  The field input html.
	 */
	protected function getInput()
	{

		if (!isset($this->form->repeatCounter))
		{
			$this->form->repeatCounter = 0;
		}

		$str = [];

		$icon = (string)$this->element['icon'] ?? 'icon-list';

		$str[] = '<button type="button" class="btn btn-outline-secondary" id="' . $this->id . $this->form->repeatCounter . '-modal-button" data-bs-toggle="modal" data-bs-target="#' . $this->id . $this->form->repeatCounter . '-modal"><i class="' . $icon . '"></i> Select</button>';

		$close		= '		<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">' . Text::_('JCLOSE') . '</button>';
		$save		= '		<button type="button" class="btn btn-primary">' . Text::_('JSAVE') . '</button>';

		$modalParams = array(
		    'title'       => Text::_($this->description),
		    'closeButton' => true,
//		    'height'      => '300px',
//		    'width'       => '300px',
		    'backdrop'    => 'static',
		    'keyboard'    => true,
//		    'modalWidth' => 30, 
//		    'bodyHeight' => 30,
		    'footer'      => $close . $save,
		    'tabindex'		=> '-1',
		    'modal_class'	=> 'joomla-modal moal fade show',
		    'display'	=> 'block'
		);

		$modalBody = parent::getInput();

		$str[] =  HTMLHelper::_('bootstrap.renderModal', $this->id . $this->form->repeatCounter. '-modal', $modalParams, $modalBody);

		return implode("\n", $str);
	}
}