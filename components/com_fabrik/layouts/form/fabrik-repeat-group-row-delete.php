<?php
/**
 * Repeat group delete button for table format
 */
defined('JPATH_BASE') or die;

use Fabrikar\Library\Fabrik\FabrikHtml;
use Joomla\CMS\Language\Text;

$d = $displayData;
?>
<a class="deleteGroup" href="#">
	<?php echo FabrikHtml::icon('icon-minus fabrikTip tip-small', '', 'data-role="fabrik_delete_group" opts="{trigger: \'hover\'}" title="' . Text::_('COM_FABRIK_DELETE_GROUP') . '"'); ?>
</a>