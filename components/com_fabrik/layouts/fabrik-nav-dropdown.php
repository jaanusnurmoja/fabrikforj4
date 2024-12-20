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

<li role="presentation" class="dropdown">
  <button id="grouping" type="button" class="dropdown-toggle groupBy btn" data-bs-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
    <?php echo $d->icon;?>
    <?php echo $d->label; ?>
    <b class="caret"></b>
  </button>
  <ul class="dropdown-menu" aria-labelledby="togglecols">
    <?php foreach ($d->links as $link) :?>
      <li ><?php echo $link;?></li>
      <?php
    endforeach;?>
  </ul>
</li>