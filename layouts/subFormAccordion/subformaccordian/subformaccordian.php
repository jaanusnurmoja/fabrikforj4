<?php
defined('_JEXEC') or die;
echo 'Custom layout loaded successfully!';
exit; // This will stop further execution for debugging.
$accordionId = 'accordion-' . $this->id;
?>

<div class="accordion" id="<?php echo $accordionId; ?>">
    <?php foreach ($this->value as $key => $instance) : ?>
        <?php
        $instanceId = $accordionId . '-item-' . $key;
        ?>
        <div class="accordion-item">
            <h2 class="accordion-header" id="<?php echo $instanceId; ?>-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#<?php echo $instanceId; ?>-body" aria-expanded="false" aria-controls="<?php echo $instanceId; ?>-body">
                    <?php echo !empty($instance['title']) ? htmlspecialchars($instance['title'], ENT_QUOTES, 'UTF-8') : 'Accordion Item ' . ($key + 1); ?>
                </button>
            </h2>
            <div id="<?php echo $instanceId; ?>-body" class="accordion-collapse collapse" aria-labelledby="<?php echo $instanceId; ?>-header" data-bs-parent="#<?php echo $accordionId; ?>">
                <div class="accordion-body">
                    <?php echo $this->renderRepeatableSubformRow($key, $instance); ?>
                </div>
            </div>
        </div>
    <?php endforeach; ?>
</div>
