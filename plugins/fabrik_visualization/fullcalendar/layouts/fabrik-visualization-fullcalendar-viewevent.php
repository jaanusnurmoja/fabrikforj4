<?php
defined('JPATH_BASE') or die;

use Joomla\CMS\Language\Text;
?>
<div class="form-horizontal" id="viewDetails">
	<div class="row">
		<div class="col-md-12" data-role="fabrik-popup-template">

		</div>
	</div>
	<div class="row">
		<div class="col-md-4"><?php echo Text::_('PLG_VISUALIZATION_FULLCALENDAR_START') ?>:</div>
		<div class="col-md-8" id="viewstart"></div>
	</div>
	<div class="row">
		<div class="col-md-4"><?php echo Text::_('PLG_VISUALIZATION_FULLCALENDAR_END') ?>:</div>
		<div class="col-md-8" id="viewend"></div>
	</div>
</div>

