<?php

defined('JPATH_BASE') or die;

use Fabrik\Library\Fabrik\FabrikHtml;

$d = $displayData;
?>
<div class="<?php echo $d->class; ?>">
	<?php
		echo FabrikHtml::image($d->icon, 'list', $d->tmpl, array('title' => $d->alt, 'style' => 'font-size:18px'));
	?>
</div>
