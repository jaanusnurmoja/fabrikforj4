<?php
/**
 * Bootstrap List Template - Toggle columns widget
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 * @since       3.1
 */

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\Language\Text;
use Fabrikar\Library\Fabrik\FabrikHtml;

?>
<li class="dropdown togglecols">
	<button id="togglecols" type="button" class="dropdown-toggle btn" data-bs-toggle="dropdown" aria-expanded="false">
		<?php echo FabrikHtml::icon('icon-eye-open', Text::_('COM_FABRIK_TOGGLE')); ?>
		<b class="caret"></b>
	</button>
	<ul class="dropdown-menu" aria-labelledby="togglecols">
	<?php
	$groups = array();
	foreach ($this->toggleCols as $group) :
		?>
		<li>
			<a data-bs-toggle-group="<?php echo $group['name']?>" data-bs-toggle-state="open">
				<?php echo FabrikHtml::icon('icon-eye-open'); ?>
				<?php echo Text::_($group['name']); // Don't add any html tags, like <strong> !?>
			</a>
		</li>
		<?php
		foreach ($group['elements'] as $element => $label) :
		?>
		<li>
			<a data-bs-toggle-col="<?php echo $element?>" data-bs-toggle-parent-group="<?php echo $group['name']?>" data-bs-toggle-state="open">
				<?php echo FabrikHtml::icon('icon-eye-open', Text::_($label)); ?>
			</a>
		</li>
		<?php
		endforeach;

	endforeach;

	?>
	</ul>
</li>
