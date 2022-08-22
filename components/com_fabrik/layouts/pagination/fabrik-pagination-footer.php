<?php
/**
 * Layout: List Pagination Footer
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2015 fabrikar.com - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 * @since       3.3.3
 */

$d = $displayData;

if ($d->showNav) :
?>
<div class="list-footer container">
	<div class="limit row input-group pb-2">
			<div class="col col-sm-2">
				<label for="<?php echo $d->listName;?>">
					<small>
						<?php echo $d->label; ?>
					</small>
				</label>
			</div>
			<?php echo $d->list; ?>
			<div class="col col-sm-3 ms-auto">
				<small>
					<?php echo $d->pagesCounter; ?>
				</small>
			</div>
	</div>
	<?php echo $d->links; ?>
	<input type="hidden" name="limitstart<?php echo $d->id; ?>" id="limitstart<?php echo $d->id; ?>" value="<?php echo $d->value; ?>" />
</div>
	<?php
else :
	if ($d->showTotal) : ?>
		<div class="list-footer">
			<div class="input-group">
				<small>
					<?php echo $d->pagesCounter; ?>
				</small>
			</div>
		</div>
		<?php
	endif;
endif;
