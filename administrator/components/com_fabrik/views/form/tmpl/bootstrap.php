<?php
/**
 * Admin Form Edit Tmpl
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 * @since       3.0
 */

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\HTML\HTMLHelper;

$wa = JFactory::getApplication()->getDocument()->getWebAssetManager();
$wa->useScript('jquery');JHtml::addIncludePath(JPATH_COMPONENT . '/helpers/html');
JHTML::stylesheet('administrator/components/com_fabrik/views/fabrikadmin.css');
JHtml::_('bootstrap.tooltip');
FabrikHelperHTML::formvalidation();
JHtml::_('behavior.keepalive');
?>

<script type="text/javascript">

	Joomla.submitbutton = function(task) {

		requirejs(['fab/fabrik'], function (Fabrik) {
			var currentGroups = document.id('jform_current_groups');
			var createNew = document.id('jform__createGroup1').checked;

			if (typeOf(currentGroups) !== 'null') {
				Object.each(currentGroups.options, function (opt) {
					opt.selected = true;
				});
			}

			if (task !== 'form.cancel') {
				if (!Fabrik.controller.canSaveForm()) {
					window.alert('<?php echo FText::_('COM_FABRIK_ERR_ONE_GROUP_MUST_BE_SELECTED'); ?>');
					return false;
				}

				if (typeOf(currentGroups) !== 'null' && currentGroups.options.length === 0 && createNew === false) {
					window.alert('Please select at least one group');
					return false;
				}
			}
			if (task == 'form.cancel' || document.formvalidator.isValid(document.id('adminForm'))) {
				window.fireEvent('form.save');
				Joomla.submitform(task, document.getElementById('adminForm'));
			} else {
				alert('<?php echo $this->escape(FText::_('JGLOBAL_VALIDATION_FORM_FAILED'));?>');
			}
		});
	}
</script>

<form action="<?php JRoute::_('index.php?option=com_fabrik'); ?>" method="post" name="adminForm" id="adminForm" class="form-validate">
	<div class="row main-card-columns">
		<div class="col-md-2" id="sidebar">
			<div class="nav flex-column nav-pills">
				<button class="nav-link active" id="" data-bs-toggle="pill" data-bs-target="#tab-details" type="button" role="tab" aria-controls="" aria-selected="true">
					<?php echo FText::_('COM_FABRIK_DETAILS')?>
				</button>
				<button class="nav-link" id="" data-bs-toggle="pill" data-bs-target="#tab-buttons" type="button" role="tab" aria-controls="" aria-selected="true">
					<?php echo FText::_('COM_FABRIK_BUTTONS')?>
				</button>
				<button class="nav-link" id="" data-bs-toggle="pill" data-bs-target="#tab-process" type="button" role="tab" aria-controls="" aria-selected="true">
					<?php echo FText::_('COM_FABRIK_FORM_PROCESSING')?>
				</button>
				<button class="nav-link" id="" data-bs-toggle="pill" data-bs-target="#tab-publishing" type="button" role="tab" aria-controls="" aria-selected="true">
					<?php echo FText::_('COM_FABRIK_GROUP_LABEL_PUBLISHING_DETAILS')?>
				</button>
				<button class="nav-link" id="" data-bs-toggle="pill" data-bs-target="#tab-groups" type="button" role="tab" aria-controls="" aria-selected="true">
					<?php echo FText::_('COM_FABRIK_GROUPS')?>
				</button>
				<button class="nav-link" id="" data-bs-toggle="pill" data-bs-target="#tab-layout" type="button" role="tab" aria-controls="" aria-selected="true">
					<?php echo FText::_('COM_FABRIK_LAYOUT')?>
				</button>
				<button class="nav-link" id="" data-bs-toggle="pill" data-bs-target="#tab-options" type="button" role="tab" aria-controls="" aria-selected="true">
					<?php echo FText::_('COM_FABRIK_OPTIONS')?>
				</button>
				<button class="nav-link" id="" data-bs-toggle="pill" data-bs-target="#tab-plugins" type="button" role="tab" aria-controls="" aria-selected="true">
					<?php echo FText::_('COM_FABRIK_PLUGINS')?>
				</button>
			</div>
		</div>
		<div class="col-md-10" id="config">
			<div class="tab-content">
				<?php
				echo $this->loadTemplate('details');
				echo $this->loadTemplate('buttons');
				echo $this->loadTemplate('process');
				echo $this->loadTemplate('publishing');
				echo $this->loadTemplate('groups');
				echo $this->loadTemplate('templates');
				echo $this->loadTemplate('options');
				echo $this->loadTemplate('plugins');
				?>
			</div>

			<input type="hidden" name="task" value="" />
			<?php echo HTMLHelper::_('form.token'); ?>
		</div>
	</div>
</form>
