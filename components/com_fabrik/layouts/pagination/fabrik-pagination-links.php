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
$list = $d->list;

?>

<nav>
	<ul class="pagination  pagination-sm">
		<li class="page-item pagination-start">
		<div class="page-link">
			<?php echo $list['start']['data']; ?>
		</div>
		</li>
		<li class="page-item pagination-prev">
		<div class="page-link">
			<?php echo $list['previous']['data']; ?>
		</div>
		</li>
		<?php
		foreach ($list['pages'] as $page) :
			$class = $page['active'] == 1 ? '' : 'active'; ?>
			<li class="page-item <?php echo $class; ?>">
			<div class="page-link">
				<?php echo $page['data']; ?>
			</div>
			</li>
		<?php endforeach ;?>

		<li class="page-item pagination-next">
		<div class="page-link">
			<?php echo $list['next']['data'];?>
		</div>
		</li>
		<li class="page-item pagination-end">
		<div class="page-link">
			<?php echo $list['end']['data'];?>
		</div>
		</li>
	</ul>
</nav>