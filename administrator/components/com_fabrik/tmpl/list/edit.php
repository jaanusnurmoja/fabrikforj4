<?php
/**
 * Admin List Edit Tmpl
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
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Router\Route;
use Joomla\CMS\Factory;

HTMLHelper::_('bootstrap.tooltip');

FabrikHtml::formvalidation(); // Why use this ?

$wa = Factory::getApplication()->getDocument()->getWebAssetManager();
$wa->useScript('keepalive');
//$wa->useScript('form.validate');
$wa->useStyle('com_fabrik.admin.fabrik');
$wa->useScript('multiselect');
$wa->useScript('com_fabrik.listform');
$wa->useScript('com_fabrik.listjoin');

?>
<form action="<?php Route::_('index.php?option=com_fabrik');?>" method="post" name="adminForm" id="adminForm" class="form-validate">
	<div class="row main-card-columns">
		<div class="col-sm-2" id="sidebar">
			<div class="nav flex-column nav-pills">
				<button class="nav-link active" id="btn-details" data-bs-toggle="pill" data-bs-target="#detailsX" type="button" role="tab" aria-controls="" aria-selected="true" style="display:block">
					<?php echo Text::_('COM_FABRIK_DETAILS') ?>
				</button>
				<button class="nav-link" id="btn-data" data-bs-toggle="pill" data-bs-target="#data" type="button" role="tab" aria-controls="" aria-selected="false">
					<?php echo Text::_('COM_FABRIK_DATA') ?>
				</button>
				<button class="nav-link" id="btn-publishing" data-bs-toggle="pill" data-bs-target="#publishing" type="button" role="tab" aria-controls="" aria-selected="false">
					<?php echo Text::_('COM_FABRIK_GROUP_LABEL_PUBLISHING_DETAILS') ?>
				</button>
				<button class="nav-link" id="btn-access" data-bs-toggle="pill" data-bs-target="#access" type="button" role="tab" aria-controls="" aria-selected="false">
					<?php echo Text::_('COM_FABRIK_GROUP_LABEL_RULES_DETAILS') ?>
				</button>
				<button class="nav-link" id="btn-plugins" data-bs-toggle="pill" data-bs-target="#tabplugins" type="button" role="tab" aria-controls="" aria-selected="false">
					<?php echo Text::_('COM_FABRIK_GROUP_LABEL_PLUGINS_DETAILS') ?>
				</button>
			</div>
		</div>
		<div class="col-sm-10" id="config">
			<div class="tab-content">
				<?php
				echo $this->loadTemplate('details');
				echo $this->loadTemplate('data');
				echo $this->loadTemplate('publishing');
				echo $this->loadTemplate('plugins');
				echo $this->loadTemplate('access');
				?>
			</div>

			<input type="hidden" name="task" value="" />
			<?php echo HTMLHelper::_('form.token'); ?>
		</div>
	</div>
</form>
