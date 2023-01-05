<?php
/**
 * Fabrik List Template: Div CSS
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

header('Content-type: text/css');
$c = $_REQUEST['c'];
$buttonCount = (int) $_REQUEST['buttoncount'];
$buttonTotal = $buttonCount === 0 ? '100%' : 30 * $buttonCount ."px";
echo "

/** Hide the checkbox in each record*/

#listform_$c .fabrikList input[type=checkbox] {
	display: none;
}

#listform_$c .row	{margin-bottom:1em;}
#listform_$c .fabrow {    border: solid 1px;
    position: relative;
    padding: 5px;
    height: 100%;}
	
#listform_$c .fabrik_action {
	position: absolute;
	top: 10px;
	right: 10px;
}

";?>
