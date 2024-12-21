<?php
/**
 * Admin Import Tmpl
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 * @since       3.0
 */

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Library\Fabrik\FabrikHtml;
use Fabrik\Library\Fabrik\FabrikWorker;
use Joomla\CMS\Factory;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Router\Route;
use Joomla\Utilities\ArrayHelper;

HTMLHelper::_('bootstrap.tooltip');
FabrikHtml::formvalidation();
$app = Factory::getApplication();
$input = $app->input;

?>
<form enctype="multipart/form-data" action="<?php Route::_('index.php?option=com_fabrik');?>" method="post" name="adminForm" id="adminForm" class="form-validate">

<div class="fltlft">
	<?php
$id = $input->getInt('listid', 0); // from list data view in admin
$cid = $input->getVar('cid', array(0), 'array'); // from list of lists checkbox selection
$cid = ArrayHelper::toInteger($cid);
if ($id === 0):
	$id = $cid[0];
endif;
if (($id !== 0)):
	$db = FabrikWorker::getDbo(true);
	$query = $db->getQuery(true);
	$query->select('label')->from('#__fabrik_lists')->where('id = ' . $id);
	$db->setQuery($query);
	$list = $db->loadResult();
endif;
$fieldsets = array('details');
$fieldsets[] = $id === 0 ? 'creation' : 'append';
$fieldsets[] = 'format';
?>
		<input type="hidden" name="listid" value="<?php echo $id; ?>" />

	<?php
foreach ($fieldsets as $n => $fieldset): ?>
	<fieldset>
		<?php
if ($n == 0):
	echo '<legend>' . Text::_('COM_FABRIK_IMPORT_CSV') . '</legend>';
endif;
foreach ($this->form->getFieldset($fieldset) as $this->field):
	echo $this->loadTemplate('control_group');
endforeach;
?>
	</fieldset>
	<?php endforeach;?>
	<input type="hidden" name="drop_data" value="0" />
	<input type="hidden" name="overwrite" value="0" />
 	<input type="hidden" name="task" value="" />
  	<?php echo HTMLHelper::_('form.token');
echo HTMLHelper::_('behavior.keepalive'); ?>
	</div>
</form>
