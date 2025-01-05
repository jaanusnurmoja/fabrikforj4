<?php

/**
 * @package     Joomla.Site
 * @subpackage  Layout
 *
 * @copyright   (C) 2016 Open Source Matters, Inc. <https://www.joomla.org>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\Form\Form;
use Joomla\CMS\Language\Text;

extract($displayData);

/**
 * Layout variables
 * -----------------
 * @var   Form    $tmpl             The Empty form for template
 * @var   array   $forms            Array of JForm instances for render the rows
 * @var   bool    $multiple         The multiple state for the form field
 * @var   int     $min              Count of minimum repeating in multiple mode
 * @var   int     $max              Count of maximum repeating in multiple mode
 * @var   string  $name             Name of the input field.
 * @var   string  $fieldname        The field name
 * @var   string  $fieldId          The field ID
 * @var   string  $control          The forms control
 * @var   string  $label            The field label
 * @var   string  $description      The field description
 * @var   string  $class            Classes for the container
 * @var   array   $buttons          Array of the buttons that will be rendered
 * @var   bool    $groupByFieldset  Whether group the subform fields by it`s fieldset
 */
if ($multiple) {
    // Add script
    Factory::getApplication()
        ->getDocument()
        ->getWebAssetManager()
        ->useScript('webcomponent.field-subform');
}

$class = $class ? ' ' . $class : '';

// Build heading
$table_head = '';

if (!empty($groupByFieldset)) {
    foreach ($tmpl->getFieldsets() as $k => $fieldset) {
        $table_head .= '<th scope="col">' . Text::_($fieldset->label);

        if ($fieldset->description) {
            $table_head .= '<span class="icon-info-circle" aria-hidden="true" tabindex="0"></span><div role="tooltip" id="tip-th-' . $fieldId . '-' . $k . '">' . Text::_($fieldset->description) . '</div>';
        }

        $table_head .= '</th>';
    }

    $sublayout = 'section-byfieldsets';
} else {
    foreach ($tmpl->getGroup('') as $field) {
        $table_head .= '<th scope="col" style="width:45%">' . strip_tags($field->label);

        if ($field->description) {
            $table_head .= '<span class="icon-info-circle" aria-hidden="true" tabindex="0"></span><div role="tooltip" id="tip-' . $field->id . '">' . Text::_($field->description) . '</div>';
        }

        $table_head .= '</th>';
    }

    $sublayout = 'section';

    // Label will not be shown for sections layout, so reset the margin left
    Factory::getApplication()
        ->getDocument()
        ->addStyleDeclaration('.subform-accordion-sublayout-section .controls { margin-left: 0px }');
}
?>
<div class="subform-repeatable-wrapper subform-accordion-layout subform-accordion-sublayout-<?php echo $sublayout; ?>">
	<div class="accordion accordion-flush" id="accordion-<?php echo $fieldname;?>">
    <joomla-field-subform class="subform-repeatable<?php echo $class; ?>" name="<?php echo $name; ?>"
        button-add=".group-add" button-remove=".group-remove" button-move="<?php echo empty($buttons['move']) ? '' : '.group-move' ?>"
        repeatable-element=".subform-repeatable-group" minimum="<?php echo $min; ?>" maximum="<?php echo $max; ?>">
        <?php if (!empty($buttons['add'])) : ?>
        <div class="btn-toolbar">
            <div class="btn-group">
                <button type="button" class="group-add btn btn-sm button btn-success" aria-label="<?php echo Text::_('JGLOBAL_FIELD_ADD'); ?>">
                    <span class="icon-plus icon-white" aria-hidden="true"></span>
                </button>
            </div>
        </div>
        <?php endif; ?>
 	    <?php
		    foreach ($forms as $k => $form) : ?>
		      <?php 
		        $title = (string)($dataAttributes['data-title'] ?? '');
		      	echo $this->sublayout($sublayout, [
		          'form' => $form,
		          'basegroup' => $fieldname,
		          'group' => $fieldname . $k,
		          'buttons' => $buttons,
		          'title' => $title
		      ]); ?>
		     <?php  		
		    endforeach;
	    	?>
    <?php if ($multiple) : ?>
    <template class="subform-repeatable-template-section hidden" ><?php
        echo $this->sublayout($sublayout, [
        	'form' => $tmpl, 
        	'basegroup' => $fieldname, 
        	'group' => $fieldname . 'X', 
        	'buttons' => $buttons,
		    'title' => ''
        ]);
    ?></template>
    <?php endif; ?>
    </joomla-field-subform>
		</div>
</div>
<script>
document.addEventListener('DOMContentLoaded', function() {

    // Initialize Bootstrap accordion if necessary
    var accordionElements = document.querySelectorAll('.accordion-button, .accordion-collapse');
    accordionElements.forEach(function(el) {
        try {
            if (!el.classList.contains('show')) {
                new bootstrap.Collapse(el, { toggle: false });
            }
        } catch (e) {
            console.error('Error initializing Bootstrap Collapse', e);
        }
    });
});

</script>	