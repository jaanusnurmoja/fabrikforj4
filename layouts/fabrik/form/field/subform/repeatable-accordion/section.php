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

if (function_exists('getTableNamefromid') === false) {
	function getTableNamefromid($id) {
		if (empty($id)) return '';
		$db = Factory::getContainer()->get('DatabaseDriver');
		$query = $db->getQuery(true);
		$query 
			->select("label")
			->from("#__fabrik_lists")
			->where("id=$id");
		$db->setQuery($query);
		return $db->loadResult();
	}
}

/**
 * Layout variables
 * -----------------
 * @var   Form    $form       The form instance for render the section
 * @var   string  $basegroup  The base group name
 * @var   string  $group      Current group name
 * @var   array   $buttons    Array of the buttons that will be rendered
 */
?>

<div class="accordion-item subform-repeatable-group" data-base-name="<?php echo $basegroup; ?>" data-group="<?php echo $group; ?>">
	<h2 class="accordion-header d-flex justify-content-between align-items-center">
    	<button
			class="accordion-button flex-grow-1"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#accordion-<?= $group; ?>"
			aria-expanded="false"
			aria-controls="accordion-<?= $group; ?>"
    		><?= $form->getValue($title); ?>
		</button>
       	<?php if (!empty($buttons)) : ?>
	        <div class="accordion-buttons d-flex align-items-center header-buttons">
         		<div class="btn-group">
            		<?php if (!empty($buttons['add'])) : ?>
              		<button
	                type="button"
	                class="group-add btn btn-sm btn-success"
	                aria-label="<?php echo Text::_('JGLOBAL_FIELD_ADD'); ?>"
	              	>
	                <span class="icon-plus icon-white" aria-hidden="true"></span>
	              	</button>
			        <?php endif; ?>
			        <?php if (!empty($buttons['remove'])) : ?>
			            <button
		                type="button"
		                class="group-remove btn btn-sm btn-danger"
		                aria-label="<?php echo Text::_('JGLOBAL_FIELD_REMOVE'); ?>"
		              	>
		                	<span class="icon-minus icon-white" aria-hidden="true"></span>
		              	</button>
		            <?php endif; ?>
		            <?php if (!empty($buttons['move'])) : ?>
              			<button
			                type="button"
			                class="group-move btn btn-sm btn-primary"
			                aria-label="<?php echo Text::_('JGLOBAL_FIELD_MOVE'); ?>"
			            >
                			<span class="icon-arrows-alt icon-white" aria-hidden="true"></span>
              			</button>
              			<button
			                type="button"
			                class="group-move-up btn btn-sm"
			                aria-label="<?php echo Text::_('JGLOBAL_FIELD_MOVE_UP'); ?>"
			            >
			                <span class="icon-chevron-up" aria-hidden="true"></span>
			            </button>
			            <button
			                type="button"
			                class="group-move-down btn btn-sm"
			                aria-label="<?php echo Text::_('JGLOBAL_FIELD_MOVE_DOWN'); ?>"
			            >
			                <span class="icon-chevron-down" aria-hidden="true"></span>
			            </button>
		            <?php endif; ?>
          		</div>
      		</div>
        <?php endif; ?>
	</h2>
  	<div id="accordion-<?= $group; ?>" class="accordion-collapse collapse" data-bs-parent="#accordion-<?= $basegroup; ?>">
   	<div class="accordion-body">
	<?php foreach ($form->getGroup('') as $field) : ?>
		<?php echo $field->renderField(); ?>
	<?php endforeach; ?>
    </div>
</div>

</div>