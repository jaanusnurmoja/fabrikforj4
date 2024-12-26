<?php
defined('JPATH_BASE') or die;

use Fabrik\Library\Fabrik\FabrikHtml;

$d = $displayData;

if ($d->optsPerRow < 1)
{
	$d->optsPerRow = 1;
}
if ($d->optsPerRow > 12)
{
	$d->optsPerRow = 12;
}

$grid = FabrikHtml::grid(
	array_column($d->options, 'value'), 
	array_column($d->options, 'text'), 
	$d->default, 
	$d->name, 
	'radio',
	false,
	$d->optsPerRow,
	["form-check-input"]
);
echo implode("\n", $grid);
