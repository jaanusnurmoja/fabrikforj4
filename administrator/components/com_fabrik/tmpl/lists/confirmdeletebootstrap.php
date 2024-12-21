<?php
/**
 * Admin Lists Confirm Delete Tmpl
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
use Joomla\CMS\Factory;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Router\Route;

$app = Factory::getApplication();
FabrikHtml::formvalidation();

?>
<form action="<?php Route::_('index.php?option=com_fabrik');?>" method="post" name="adminForm" id="adminForm" class="form-validate">

	<?php
$cid = $app->input->get('cid', array(), 'array');
foreach ($cid as $id): ?>
		<input type="hidden" name="cid[]" value="<?php echo $id; ?>" />
	<?php endforeach;?>

	<fieldset>
		<legend><?php echo Text::_('COM_FABRIK_DELETE_FROM'); ?></legend>
		<ul class="adminformlist">
		<?php for ($i = 0; $i < count($this->items); $i++): ?>
  			<li>
  				<?php echo $this->items[$i] ?>
  			</li>
		<?php endfor;?>
		</ul>

		<?php foreach ($this->form->getFieldset('details') as $field): ?>
			<div class="control-group">
			<?php if (!$field->hidden): ?>
				<div class="control-label">
					<?php echo $field->label; ?>
				</div>
			<?php endif;?>
				<div>
					<?php echo $field->input; ?>
				</div>
			</div>
			<?php endforeach;?>
	</fieldset>
	<input type="hidden" name="task" value="" />
  	<?php echo HTMLHelper::_('form.token');
echo HTMLHelper::_('behavior.keepalive'); ?>
</form>