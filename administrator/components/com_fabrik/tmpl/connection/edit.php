<?php
/**
 * Admin Connection Tmpl
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

HTMLHelper::addIncludePath(JPATH_COMPONENT . '/helpers/html');
HTMLHelper::_('bootstrap.tooltip');
FabrikHtml::formvalidation();
HTMLHelper::_('behavior.keepalive');

?>
<form action="<?php Route::_('index.php?option=com_fabrik');?>" method="post" name="adminForm" id="adminForm" class="form-validate">

	<div class="row">
		<?php if ($this->item->host != ""): ?>
			<li>
				<label><?php echo Text::_('COM_FABRIK_ENTER_PASSWORD_OR_LEAVE_AS_IS'); ?></label>
			</li>
		<?php endif;?>
		<fieldset>
	    	<legend>
	    		<?php echo Text::_('COM_FABRIK_DETAILS'); ?>
	    	</legend>
			<?php foreach ($this->form->getFieldset('details') as $this->field):
	echo $this->loadTemplate('control_group');
endforeach;
?>
		</fieldset>
	</div>

	<input type="hidden" name="task" value="" />
	<?php echo HTMLHelper::_('form.token'); ?>
</form>
