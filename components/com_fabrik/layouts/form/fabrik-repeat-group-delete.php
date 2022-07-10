<?php
/**
 * Repeat group delete button
 */

defined('JPATH_BASE') or die;

use Joomla\CMS\Language\Text;

$d = $displayData;
?>
<a class="deleteGroup btn btn-small btn-danger" href="#">
	<?php echo FabrikHelperHTML::icon('icon-minus fabrikTip tip-small', '', 'data-role="fabrik_delete_group" opts=\'{"trigger": "hover"}\' title="' . Text::_('COM_FABRIK_DELETE_GROUP'). '"'); ?>
</a>