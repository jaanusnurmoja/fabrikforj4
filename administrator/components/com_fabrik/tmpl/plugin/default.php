<?php
defined('_JEXEC') or die;

if (!isset($this->form)) {
    echo '<p>Error: Form data is not available.</p>';
    return;
}
?>
	<fieldset>
		<?php
		foreach ($this->form->getFieldset() as $this->field) :
			echo $this->loadTemplate('control_group');
		endforeach; ?>
	</fieldset>
 