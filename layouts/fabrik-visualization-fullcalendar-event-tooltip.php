<?php
defined('JPATH_BASE') or die;

use Joomla\CMS\Language\Text;
?>
<div id="FbFcTtPopup">
	<div id="FbFcTtHeader" class="row">
		<div class="col-sm-12"/>
	</div>
	<div id="FbFcTtStart" class="row">
		<div class="col-sm-4" id="FbFcTtStartTitle"><?php echo Text::_('PLG_VISUALIZATION_FULLCALENDAR_START') ?>:</div>
		<div class="col-sm-8" id="FbFcTtStartDate"></div>
	</div>
	<div id="FbFcTtEnd" class="row">
		<div class="col-sm-4" id="FbFcTtEndTitle"><?php echo Text::_('PLG_VISUALIZATION_FULLCALENDAR_END') ?>:</div>
		<div class="col-sm-8" id="FbFcTtEndDate"></div>
	</div>
</div>

