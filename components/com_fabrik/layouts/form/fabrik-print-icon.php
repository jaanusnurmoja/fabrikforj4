<?php
/**
 * Email form layout
 */

defined('JPATH_BASE') or die;

use Fabrikar\Library\Fabrik\FabrikHtml;
use Joomla\CMS\Language\Text;

$d = $displayData;

?>
<a class="btn btn-default" data-fabrik-print href="<?php echo $d->link; ?>">
	<?php echo FabrikHtml::icon('icon-print', Text::_('COM_FABRIK_PRINT')); ?>
</a>