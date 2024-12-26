<?php

defined('JPATH_BASE') or die;
use Fabrik\Library\Fabrik\FabrikHtml;

$d = $displayData;
?>
<div class="btn-group">
    <button <?php echo $d->commentdata;?> data-fabrik-thumb-formid="<?php echo $d->formId;?>"
        data-fabrik-thumb="up" class="btn btn-small thumb-up<?php echo $d->upActiveClass;?>">
        <?php echo FabrikHtml::image('thumbs-up', 'list', $d->tmpl); ?>
    <span class="thumb-count"><?php echo $d->countUp;?>
    </span>
    </button>
    <?php
    if ($d->showDown) :
        ?>
        <button <?php echo $d->commentdata;?> data-fabrik-thumb-formid="<?php echo $d->formId;?>"
            data-fabrik-thumb="down" class="btn btn-small thumb-down<?php echo $d->downActiveClass;?>">
            <?php echo FabrikHtml::image('thumbs-down', 'list', $d->tmpl); ?>
            <span class="thumb-count"><?php echo $d->countDown;?></span>
        </button>
    <?php
    endif;
    ?>
</div>
