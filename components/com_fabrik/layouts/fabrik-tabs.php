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
		$i==0 ? $active = 'active' : $active = '';
		$i==0 ? $selected = 'true' : $selected = 'false';
		?>
		<li role="presentation" class="nav-item" <?php echo implode(' ', $style); ?>>
			<button class="nav-link <?php echo $active; ?>" id="<?php echo $tab->id; ?>" data-bs-toggle="tab" data-bs-target="#<?php echo $href; ?>" type="button" role="tab" aria-controls="<?php echo $tab->href; ?>" aria-selected="<?php echo $selected;?>">
				<?php echo Text::_($tab->label); ?>
			</button>
		</li>

		<?php
		$i++;
	endforeach;
	?>
</ul>

