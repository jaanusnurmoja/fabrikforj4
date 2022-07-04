<?php
/**
 * Admin Element Edit Tmpl
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

JText::script('COM_FABRIK_SUBOPTS_VALUES_ERROR');
?>

<script type="text/javascript">

	Joomla.submitbutton = function(task) {
		requirejs(['fab/fabrik'], function (Fabrik) {
			if (task !== 'element.cancel' && !Fabrik.controller.canSaveForm()) {
				window.alert('Please wait - still loading');
				return false;
			}
			if (task == 'element.cancel' || document.formvalidator.isValid(document.id('adminForm'))) {
				window.fireEvent('form.save');
				Joomla.submitform(task, document.getElementById('adminForm'));
			} else {
				window.alert('<?php echo $this->escape(FText::_('JGLOBAL_VALIDATION_FORM_FAILED'));?>');
			}
		});
	}
</script>

<form action="<?php JRoute::_('index.php?option=com_fabrik'); ?>" method="post" name="adminForm" id="adminForm" class="form-validate">
	<div class="row main-card-columns">
		<div class="col-md-12">
			<?php if ($this->item->parent_id != 0)
			{?>
				<div id="system-message" class="alert alert-notice">
					<strong><?php echo FText::_('COM_FABRIK_ELEMENT_PROPERTIES_LINKED_TO') ?>: <?php echo $this->parent->label ?></strong>

					<p><a href="#" id="swapToParent" class="element_<?php echo $this->parent->id ?>"><span class="icon-pencil"></span>
					<?php echo FText::_('COM_FABRIK_EDIT') . ' ' . $this->parent->label ?></a></p>

					<label><?php echo FText::_('COM_FABRIK_OR')?> <span class="icon-magnet"></span>
					<input id="unlink" name="unlink" id="unlinkFromParent" type="checkbox"> <?php echo FText::_('COM_FABRIK_UNLINK') ?>
					</label>
				</div>
				<?php
			}?>
		</div>
		<div class="col-md-2" id="sidebar">
			<div class="nav flex-column nav-pills">
				<button class="nav-link active" id="" data-bs-toggle="pill" data-bs-target="#tab-details" type="button" role="tab" aria-controls="" aria-selected="true">
					<?php echo FText::_('COM_FABRIK_DETAILS')?>
				</button>
				<button class="nav-link" id="" data-bs-toggle="pill" data-bs-target="#tab-publishing" type="button" role="tab" aria-controls="" aria-selected="true">
					<?php echo FText::_('COM_FABRIK_PUBLISHING')?>
				</button>
				<button class="nav-link" id="" data-bs-toggle="pill" data-bs-target="#tab-access" type="button" role="tab" aria-controls="" aria-selected="true">
					<?php echo FText::_('COM_FABRIK_GROUP_LABEL_RULES_DETAILS')?>
				</button>
				<button class="nav-link" id="" data-bs-toggle="pill" data-bs-target="#tab-listview" type="button" role="tab" aria-controls="" aria-selected="true">
					<?php echo FText::_('COM_FABRIK_LIST_VIEW_SETTINGS')?>
				</button>
				<button class="nav-link" id="" data-bs-toggle="pill" data-bs-target="#tab-validations" type="button" role="tab" aria-controls="" aria-selected="true">
					<?php echo FText::_('COM_FABRIK_VALIDATIONS')?>
				</button>
				<button class="nav-link" id="" data-bs-toggle="pill" data-bs-target="#tab-javascript" type="button" role="tab" aria-controls="" aria-selected="true">
					<?php echo FText::_('COM_FABRIK_JAVASCRIPT')?>
				</button>
			</div>
		</div>
		<div class="col-md-10" id="config">
			<div class="span10 tab-content">
				<?php
				echo $this->loadTemplate('details');
				echo $this->loadTemplate('publishing');
				echo $this->loadTemplate('access');
				echo $this->loadTemplate('listview');
				echo $this->loadTemplate('validations');
				echo $this->loadTemplate('javascript');
				?>
			</div>

			<input type="hidden" name="task" value="" />
			<input type="hidden" name="redirectto" value="" />
			<?php echo HTMLHelper::_('form.token'); ?>
		</div>
	</div>
</form>
