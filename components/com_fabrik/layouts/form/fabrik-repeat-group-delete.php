<?php
/**
 * Repeat group delete button
 */
defined('JPATH_BASE') or die;

use Fabrikar\Library\Fabrik\FabrikHtml;
use Joomla\CMS\Language\Text;

$d = $displayData;
?>
<a class="deleteGroup btn btn-small btn-danger" href="#"  data-bs-toggle="tooltip" title="<?php echo Text::_('COM_FABRIK_DELETE_GROUP'); ?>">
	<?php echo FabrikHtml::icon('icon-minus', '', 'data-role="fabrik_delete_group"'); ?>
</a>