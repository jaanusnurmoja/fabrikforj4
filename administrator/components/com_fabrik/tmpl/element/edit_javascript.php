<?php
/**
 * Admin Element Edit - Javascript Tmpl
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 * @since       3.0
 */

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\Language\Text;
use Joomla\CMS\Form\FormHelper;

FormHelper::addFieldPrefix('Fabrik\Component\Fabrik\Administrator\Field'); 

?>
<div class="tab-pane" id="tab-javascript">
	<fieldset>
		<legend><?php echo Text::_('COM_FABRIK_JAVASCRIPT'); ?></legend>
		<?php
		foreach ($this->form->getFieldset('js_actions') as $this->field) :
			echo $this->loadTemplate('control_group');
		endforeach; ?>
	</fieldset>
</div>