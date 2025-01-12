<?php
/**
 * Admin list Tmpl
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 * @since       3.0
 */

// No direct access
defined('_JEXEC') or die('Restricted access');

$style = '';
if ($this->field->type == "Subform" && strpos($this->field->layout, 'repeatable-accordion') !== false && $this->field->getAttribute('width') == "full") {
    $style = ' style="display: block;"';
}
?>
<div class="control-group"<?php echo $style; ?>>
<?php if (!$this->field->hidden) :?>
	<div class="control-label">
		<?php echo $this->field->label; ?>
	</div>
<?php endif; ?>
<?php // Removed style="width:75%" ?>
	<div>
		<?php echo $this->field->input; ?>
	</div>
</div>