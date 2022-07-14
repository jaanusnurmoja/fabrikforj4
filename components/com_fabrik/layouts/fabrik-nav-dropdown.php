<?php
/**
 * Layout: Bootstrap dropdown
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2015 fabrikar.com - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 * @since       3.3.3
 */

// No direct access
defined('_JEXEC') or die('Restricted access');
$d = $displayData;

?>

<div class="dropdown">
  <button class="btn btn-secondary btn-sm dropdown-toggle" type="button"  data-bs-toggle="dropdown" aria-expanded="false">
    <?php echo $d->label;?>
  </button>
  <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
    <?php foreach ($d->links as $link) :?>
			<li class="dropdown-item "><?php echo $link;?></li>
			<?php
		endforeach;?>
  </ul>
</div>


