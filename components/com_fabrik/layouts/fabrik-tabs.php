<?php
/**
 * Tabs layout
 */

defined('JPATH_BASE') or die;

use Joomla\CMS\Language\Text;

$d = $displayData;
$i = 0;
?>

<ul class="nav nav-tabs" role="tablist">
	<?php foreach ($d->tabs as $tab) :
		$style = array();
		$style[] = isset($tab->class) && $tab->class !== '' ? 'class="' . $tab->class . '"' : '';
		$style[] = isset($tab->css) && $tab->css !== '' ? 'style="' . $tab->css . '"': '';
		$href = isset($tab->href) ? $tab->href : $tab->id;
		?>
<!--
		<li role="presentation" data-role="fabrik_tab" <?php echo implode(' ', $style); ?>>

			<?php //if (isset($tab->js) && $tab->js === false) : ?>

				<a href="<?php //echo $href; ?>"
					id="<?php //echo $tab->id; ?>">
					<?php //echo Text::_($tab->label); ?>
				</a>

			<?php
			//else :
			?>
			<a href="#<?php //echo $href; ?>"
				aria-controls="<?php //echo $tab->id; ?>"
				id="<?php //echo $tab->id; ?>"
				role="tab"
				data-bs-toggle="tab"
				class="mootools-noconflict">
				<?php //echo Text::_($tab->label); ?>
			</a>
				<?php //endif;
			?>
		</li>
-->
		<?php $i==0 ? $active = 'active' : $active = ''; ?>
		<li role="presentation" class="nav-item" <?php echo implode(' ', $style); ?>>

			<?php if (isset($tab->js) && $tab->js === false) : ?>
				<button class="nav-link <?php echo $active; ?>" id="<?php echo $tab->id; ?>" data-bs-toggle="tab" data-bs-target="#<?php echo $href; ?>" type="button" role="tab" aria-controls="" aria-selected="true">
					<?php echo Text::_($tab->label); ?>
				</button>
			<?php else : ?>
				<button class="nav-link <?php echo $active; ?> mootools-noconflict" id="<?php echo $tab->id; ?>" data-bs-toggle="tab" data-bs-target="#<?php echo $href; ?>" type="button" role="tab" aria-controls="<?php echo $tab->id; ?>" aria-selected="true">
					<?php echo Text::_($tab->label); ?>
				</button>
			<?php endif; ?>
		</li>

		<?php
		$i++;
	endforeach;
	?>
</ul>

