<?php
defined('JPATH_BASE') or die;

use Fabrik\Library\Fabrik\FabrikHtml;

$d    = $displayData;

echo implode("\n", FabrikHtml::grid($d->values, $d->labels, $d->default, $d->name,
	'checkbox', false, 1, array('input' => array('fabrik_filter'))));
