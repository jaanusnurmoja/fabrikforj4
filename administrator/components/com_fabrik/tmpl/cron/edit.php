<?php
/**
 * Admin Cron Edit Tmpl
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 * @since       3.0
 */

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrikar\Library\Fabrik\FabrikHtml;
use Joomla\CMS\Form\FormHelper;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Router\Route;

FormHelper::addFieldPrefix('Fabrikar\Component\Fabrik\Administrator\Field');

//HTMLHelper::addIncludePath(JPATH_COMPONENT . '/helpers/html');
HTMLHelper::stylesheet('administrator/components/com_fabrik/views/fabrikadmin.css'); // F5: add 2nd paran asset name
HTMLHelper::_('bootstrap.tooltip');
FabrikHtml::formvalidation();
HTMLHelper::_('behavior.keepalive');

?>
/<form action="<?php Route::_('index.php?option=com_fabrik');?>" method="post" name="adminForm" id="adminForm" class="form-validate">

	<div class="row">
		<div class="col-sm-6">
			<fieldset>
		    	<legend>
		    		<?php echo Text::_('COM_FABRIK_DETAILS'); ?>
		    	</legend>
				<?php
foreach ($this->form->getFieldset('details') as $key => $this->field):
	if ($key !== 'jform_plugin') {
		echo $this->loadTemplate('control_group');
	} else {
		// Defer the plug-in field to the end
		$pluginField = $this->field;
	}
endforeach;
foreach ($this->form->getFieldset('connection') as $this->field):
	echo $this->loadTemplate('control_group');
endforeach;
$this->field = $pluginField;
echo $this->loadTemplate('control_group');
?>
			</fieldset>

		</div>

		<div class="col-sm-6">

			<fieldset>
		    	<legend>
		    		<?php echo Text::_('COM_FABRIK_RUN'); ?>
		    	</legend>
				<?php foreach ($this->form->getFieldset('run') as $this->field):
	echo $this->loadTemplate('control_group');
endforeach;
?>
			</fieldset>

			<fieldset>
		    	<legend>
		    		<?php echo Text::_('COM_FABRIK_LOG'); ?>
		    	</legend>
				<?php foreach ($this->form->getFieldset('log') as $this->field):
	echo $this->loadTemplate('control_group');
endforeach;
?>
			</fieldset>
		</div>
	</div>
	<div class="row">
		<div class="col-sm-12">
			<fieldset>
				<div id="plugin-container">
					<?php echo $this->pluginFields; ?>
				</div>
			</fieldset>
		</div>
	</div>
	<input type="hidden" name="task" value="" />
	<?php echo HTMLHelper::_('form.token'); ?>
</form>
