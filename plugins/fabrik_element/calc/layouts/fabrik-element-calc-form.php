<?php
defined('JPATH_BASE') or die;

$d = $displayData;
$width = null;
foreach ([0, 25, 50, 75, 100] as $allowed) {
	if ($width === null || abs($d->cols - $width) > abs($allowed - $d->cols)) {
		$width = $allowed;
	}
}
if ($width == 0) $width = "auto";
if ($d->height <= 1) :
?>
<input class="form-control-plaintext w-<?php echo $width;?>"
	type="text"
	readonly 
	style="display:inline-block;" 
	name="<?php echo $d->name;?>" 
	id="<?php echo $d->id;?>" 
	value="<?php echo $d->value;?>"
	>
<?php
else : ?>
<textarea class="form-control-plaintext w-<?php echo $width;?>" 
	readonly name="<?php echo $d->name;?>"
	id="<?php echo $d->id;?>" 
	cols="<?php echo $d->cols; ?>"
	rows="<?php echo $d->rows; ?>"
		><?php echo $d->value;?>
	</textarea>
<?php endif; ?>