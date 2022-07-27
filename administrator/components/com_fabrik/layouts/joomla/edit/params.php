<?php

/* In this file we will load in the standard joomla layout, modify it so it works for us, and them return the output */

defined('_JEXEC') or die;

use Joomla\CMS\Factory;

/* The following is used by the install/upgrade script to validate whether an installed override is ours or not */
define('FABRIK_JOOMLA_EDIT_LAYOUT_OVERRIDE', 1);

$originalLayout = JPATH_ROOT."/layouts/joomla/edit/params.php";
$targetInstructions = "//fieldset[not(ancestor::field/form/*)]');";
$newInstructions = "//fieldset[not(ancestor::field/form/*)]//fieldset[not(ancestor::field/fields/*)]');";

$buffer = file_get_contents($originalLayout);
$pos = strpos($buffer, $targetInstructions); 

if ($pos === false) {
	/* Enque a message */
} else {
	$buffer = substr_replace($buffer, $newInstructions, $pos, strlen($targetInstructions));
}
eval('?>'.$buffer.PHP_EOL.'?>');