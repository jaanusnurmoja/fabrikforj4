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

use Fabrikar\Library\Fabrik\FabrikHtml;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Factory;

$wa = Factory::getApplication()->getDocument()->getWebAssetManager();
$wa->useScript('keepalive');
//$wa->useScript('form.validate');
$wa->useStyle('fabrikadmin');
//$wa->useScript('multiselect');
$wa->useScript('swaplist');

HTMLHelper::_('bootstrap.tooltip');
FabrikHtml::formvalidation();
?>

<form action="<?php JRoute::_('index.php?option=com_fabrik');?>" method="post" name="adminForm" id="adminForm" class="form-validate">

	<ul class="nav nav-tabs" id="Fab_Form_Nav" role="tablist">
	  <li class="nav-item" role="">
		<button class="nav-link active" id="details-tab" data-bs-toggle="tab" data-bs-target="#tab-details" type="button" role="tab" aria-controls="" aria-selected="true">
			<?php echo Text::_('COM_FABRIK_DETAILS'); ?>
		</button>
	  </li>
	  <li class="nav-item" role="">
		<button class="nav-link" id="buttons-tab" data-bs-toggle="tab" data-bs-target="#tab-buttons" type="button" role="tab" aria-controls="" aria-selected="false">
			<?php echo Text::_('COM_FABRIK_BUTTONS') ?>
		</button>
	  </li>
	  <li class="nav-item" role="">
		<button class="nav-link" id="process-tab" data-bs-toggle="tab" data-bs-target="#tab-process" type="button" role="tab" aria-controls="" aria-selected="false">
			<?php echo Text::_('COM_FABRIK_FORM_PROCESSING') ?>
		</button>
	  </li>
	  <li class="nav-item" role="">
		<button class="nav-link" id="publishing-tab" data-bs-toggle="tab" data-bs-target="#tab-publishing" type="button" role="tab" aria-controls="" aria-selected="false">
			<?php echo Text::_('COM_FABRIK_GROUP_LABEL_PUBLISHING_DETAILS') ?>
		</button>
	  </li>
	  <li class="nav-item" role="">
		<button class="nav-link" id="groups-tab" data-bs-toggle="tab" data-bs-target="#tab-groups" type="button" role="tab" aria-controls="" aria-selected="false">
			<?php echo Text::_('COM_FABRIK_GROUPS') ?>
		</button>
	  </li>
	  <li class="nav-item" role="">
		<button class="nav-link" id="layout-tab" data-bs-toggle="tab" data-bs-target="#tab-layout" type="button" role="tab" aria-controls="" aria-selected="false">
			<?php echo Text::_('COM_FABRIK_LAYOUT') ?>
		</button>
	  </li>
	  <li class="nav-item" role="">
		<button class="nav-link" id="options-tab" data-bs-toggle="tab" data-bs-target="#tab-options" type="button" role="tab" aria-controls="" aria-selected="false">
			<?php echo Text::_('COM_FABRIK_OPTIONS') ?>
		</button>
		<li class="nav-item" role="">
		<button class="nav-link" id="plugins-tab" data-bs-toggle="tab" data-bs-target="#tab-plugins" type="button" role="tab" aria-controls="" aria-selected="false">
			<?php echo Text::_('COM_FABRIK_PLUGINS') ?>
		</button>
	  </li>
	  </li>
	</ul>

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
</form>
