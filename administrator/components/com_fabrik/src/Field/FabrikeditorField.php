<?php
/**
 * Form Field class for the Joomla Platform.
 * An ace.js code editor field
 *
 * @package     Joomla
 * @subpackage  Form
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */
namespace Fabrik\Component\Fabrik\Administrator\Field;
// No direct access
defined('_JEXEC') or die('Restricted access');
use Joomla\CMS\Editor\Editor;
use Joomla\CMS\Version;
use Joomla\CMS\Factory;
use Joomla\CMS\Form\FormHelper;
use Joomla\CMS\Form\Field\TextareaField;
use Fabrik\Library\Fabrik\FabrikWorker;
use Fabrik\Library\Fabrik\FabrikHtml;

/**
 * Form Field class for the Joomla Platform.
 * An ace.js code editor field
 *
 * @package     Joomla.Libraries
 * @subpackage  Form
 * @see         Editor
 * @since       1.6
 */
class FabrikeditorField extends TextareaField
{
	/**
	 * The form field type.
	 *
	 * @var    string
	 * @since  1.6
	 */
	public $type = 'Fabrikeditor';
	/**
	 * Method to get the field input markup for the editor area
		*
		* @return  string  The field input markup.
	 *
	 * @since   1.6
	*/
	protected function getInput()
	{
		$wa = Factory::getApplication()->getDocument()->getWebAssetManager();
		// Initialize some field attributes.
		$class    = $this->element['class'] ? ' class="' . (string) $this->element['class'] . '"' : '';
		$disabled = ((string) $this->element['disabled'] == 'true') ? ' disabled="disabled"' : '';
		$columns  = $this->element['cols'] ? ' cols="' . (int) $this->element['cols'] . '"' : '';
		$rows     = $this->element['rows'] ? ' rows="' . (int) $this->element['rows'] . '"' : '';
		$required = $this->required ? ' required="required" aria-required="true"' : '';
		// JS events are saved as encoded html - so we don't want to double encode them
		$encoded = FabrikWorker::toBoolean($this->getAttribute('encoded', false), false);
		if (!$encoded)
		{
			$this->value = htmlspecialchars($this->value, ENT_COMPAT, 'UTF-8');
		}
		$onChange = FabrikWorker::toBoolean($this->getAttribute('onchange', false), false);
		$onChange = $onChange ? ' onchange="' . (string) $onChange . '"' : '';
		// Joomla 3 version
		FabrikWorker::toBoolean($this->getAttribute('highlightpk', false), false);
		$mode      = $this->getAttribute('mode', 'html'); // Need all ? Only php selected, there are 11 now =2Mb
		$theme     = $this->getAttribute('theme', 'github'); // Need all ? Non selected so we use github, there are 30 now =2Mb
		$height    = $this->getAttribute('height', '300px');
		$width     =$this->getAttribute('width', '100%');
		$maxHeight = $this->getAttribute('max-height', str_ireplace('px', '', $height) * 2 . 'px');
		$editor = '<textarea name="' . $this->name . '" id="' . $this->id . '"'
			. $columns . $rows . $class . $disabled . $onChange . $required . '>'
			. $this->value . '</textarea>';
		if ($mode === 'php')
		{
			$aceMode = ['path' => 'ace/mode/php', 'inline' => true];
		}
		else
		{
			$aceMode = ['path' => 'ace/mode' . $mode];
		}
		$minHeight = str_ireplace('px', '', $height);
		$maxHeight = str_ireplace('px', '', $maxHeight);
		/**
		 * In code below...
		 *   the +/- 2 is to account for the top/bottom border of 1px each
		 *
		 *   pluginmanager.js renames names/ids when you delete a preceding plugin which breaks ace
		 *   so we need to keep ace-ids intact and avoid issues with duplicate ids by:
		 *       adding a random string to the id where ace needs id to be kept the same; and
		 *       save dom object for textarea so that change of id doesn't break it.
		 **/
		$aceId  = $this->id . '_' . sprintf("%06x", mt_rand(0, 0xffffff));
		$wa->usePreset('com_fabrik.lib.ace'); // loaded in head. prefered to be loaded defer, but then inlinescript must wait for pageload event.

		/* Before we insert the initialization code, we need to know if this is a subForm template, and if so skip the init */
		$js = [];
		if (!preg_match('/^subform/i', $this->form->getName()) 
		    || !preg_match('/\[.*X\]$/', $this->formControl)) {
			/* It is either not a subform, or it is not the template */
			$js[] = "<script>";
		    $js[] = "const intervalId" . $aceId . " = setInterval(() => {";
			$js[] = "\t\t\t\t\tconsole.log('$aceId');";
		    $js[] = "\t\t\t\tconst aceDiv = document.getElementById('" . $aceId . "-ace');";
		    $js[] = "\t\t\t\tif (aceDiv && typeof initAceEditor === 'function') { // If the div is found";
		    $js[] = "\t\t\t\t\tclearInterval(intervalId" . $aceId . "); // Stop checking";
			$js[] = "\t\t\t\t\tconst aceParams = JSON.parse(aceDiv.parentNode.querySelector('.aceParams').textContent);";
			$js[] = "\t\t\t\t\t initAceEditor(aceParams);";
			$js[] = "\t\t\t\t}";
			$js[] = "\t\t\t}, 50); // Check every 50 milliseconds";
			$js[] = "</script>";

	//		FabrikHtml::addToEleminitScripts(implode("\n", $js));
		}

		$aceParams = "<div class='aceParams' style='display:none;'>"
			. json_encode([
				'editorId'		=> $aceId . "-ace",
				'theme'			=> $theme,
				'mode'			=> json_encode($aceMode),
				'fieldId'		=> $this->id,
				'maxHeight'		=> $maxHeight,
				'minHeight'		=> $minHeight
				], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)
			. "</div>";

		$style[] = "<style type='text/css'>";
		$style[] = '#' . $aceId . "-ace {";
		$style[] = "position: absolute;";
		$style[] = "top: 0;";
		$style[] = "right: 0;";
		$style[] = "bottom: 0;";
		$style[] = "left: 0;";
		$style[] = "border: 1px solid #c0c0c0;";
		$style[] = "border-radius: 3px;";
		$style[] = "}";
		$style[] = "#" . $aceId . "-aceContainer {";
		$style[] = "position: relative;";
		$style[] = "width: " . $width . ";";
		$style[] = "height: " . $height . ";";
		$style[] = "}";
		$style[] = "</style>";
		$this->element['cols'] = 1;
		$this->element['rows'] = 1;
		// For element js event code.
		return  implode("\n", $style) . implode("\n", $js) . '<div id="' . $aceId . '-aceContainer">
			<div id="' . $aceId . '-ace" ></div>' . $editor. $aceParams . '</div>' ;
	}
}
