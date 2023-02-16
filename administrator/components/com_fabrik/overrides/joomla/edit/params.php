<?php

/* In this file we will load in the standard joomla layout, modify it so it works for us, and them return the output */

defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Fabrik\Helpers\Php;

/* The following is used by the install/upgrade script to validate whether an installed override is ours or not */
$validationtag = 'FABRIK_JOOMLA_EDIT_LAYOUT_OVERRIDE';

$originalLayout = JPATH_ROOT."/layouts/joomla/edit/params.php";
$targets = ["\$displayData->get('ignore_fieldsets') ?: array();", 
			"//fieldset[not(ancestor::field/form/*)]');"];
$replacement = ["array_merge(\$displayData->get('ignore_fieldsets') ?: array(),  ['list_elements_modal', 'prefilters_modal']);",
				"//fieldset[not(ancestor::field/form/*)]//fieldset[not(ancestor::field/fields/*)]');"];

$buffer = file_get_contents($originalLayout);

foreach ($targets as $key=>$target) {
	$pos = strpos($buffer, $target); 
	if ($pos === false) {
		/* Enque a message */
	} else {
		$buffer = substr_replace($buffer, $replacement[$key], $pos, strlen($target));
	}
}

echo Php::Eval(['code' => '?>'.$buffer.PHP_EOL]);
