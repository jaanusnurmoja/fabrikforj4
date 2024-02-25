<?php
/**
 * Bootstrap Details Template: Repeat group rendered as standard form
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 * @since       3.0
 */

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\Language\Text;
use Joomla\CMS\Factory;

$input = Factory::getApplication()->input;
$group = $this->group;
if (!$group->newGroup) :
	$i = 1;
	$w = new FabrikWorker;

	foreach ($group->subgroups as $subgroup) :
		$introData = array_merge($input->getArray(), array('i' => $i));
		?>
		<div class="fabrikSubGroup">

		<?php
			// Add the add/remove repeat group buttons
			if ($group->editable) : ?>
				<div class="fabrikGroupRepeater pull-right">
					<?php if ($group->canAddRepeat) :?>
					<a class="addGroup" href="#">
						<?php echo FabrikHelperHTML::image('plus', 'form', $this->tmpl, array('class' => 'fabrikTip tip-small', 'opts' => '{"trigger": "hover"}', 'title' => Text::_('COM_FABRIK_ADD_GROUP')));?>
					</a>
					<?php
					endif;
					if ($group->canDeleteRepeat) :?>
					<a class="deleteGroup" href="#">
						<?php echo FabrikHelperHTML::image('minus', 'form', $this->tmpl, array('class' => 'fabrikTip tip-small', 'opts' => '{"trigger": "hover"}', 'title' => Text::_('COM_FABRIK_DELETE_GROUP')));?>
					</a>
					<?php endif;?>
				</div>
			<?php
			endif;
			?>
			<div class="fabrikSubGroupElements">
				<?php

				// Load each group in a <ul>
				$this->elements = $subgroup;
				echo $this->loadTemplate('group');
				?>
			</div><!-- end fabrikSubGroupElements -->
		</div><!-- end fabrikSubGroup -->
		<?php
	endforeach;
endif;