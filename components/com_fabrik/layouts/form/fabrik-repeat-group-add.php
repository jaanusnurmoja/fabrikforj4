<?php
/**
 * Repeat group add button
 */
defined('JPATH_BASE') or die;

use Fabrikar\Library\Fabrik\FabrikHtml;
use Joomla\CMS\Language\Text;

$d = $displayData;
?>
<a class="addGroup btn btn-small btn-success" href="#" data-bs-toggle="tooltip" title="<?php echo Text::_('COM_FABRIK_ADD_GROUP'); ?>">
	<?php echo FabrikHtml::icon('icon-plus', '', 'data-role="fabrik_duplicate_group"'); ?>
</a>

