CREATE TABLE IF NOT EXISTS `#__fabrik_change_log_fields` (
    `id` INT( 11 ) NOT NULL AUTO_INCREMENT PRIMARY KEY ,
    `parent_id` INT( 11 ) NOT NULL DEFAULT 0,
    `user_id` INT( 11 ) NOT NULL DEFAULT 0 ,
    `time_date` DATETIME NULL DEFAULT NULL ,
    `form_id` INT( 11 ) NOT NULL DEFAULT 0,
    `list_id` INT( 11 ) NOT NULL DEFAULT 0,
    `element_id` INT( 11 ) NOT NULL DEFAULT 0,
    `row_id` INT( 11 ) NOT NULL DEFAULT 0,
    `join_id` INT( 11 ) DEFAULT 0,
    `pk_id` INT( 11 ) NOT NULL DEFAULT 0,
    `table_name` VARCHAR( 256 ) NOT NULL DEFAULT '',
    `field_name` VARCHAR( 256 ) NOT NULL DEFAULT '',
    `log_type_id` INT( 11 ) NOT NULL DEFAULT 0,
    `orig_value` TEXT,
    `new_value` TEXT
);

ALTER TABLE `#__fabrik_change_log_fields` ALTER `parent_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_change_log_fields` ALTER `user_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_change_log_fields` MODIFY `time_date` datetime NULL DEFAULT NULL;
ALTER TABLE `#__fabrik_change_log_fields` ALTER `form_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_change_log_fields` ALTER `list_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_change_log_fields` ALTER `element_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_change_log_fields` ALTER `row_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_change_log_fields` ALTER `join_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_change_log_fields` ALTER `pk_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_change_log_fields` ALTER `table_name` SET DEFAULT '';
ALTER TABLE `#__fabrik_change_log_fields` ALTER `field_name` SET DEFAULT '';
ALTER TABLE `#__fabrik_change_log_fields` ALTER `log_type_id` SET DEFAULT 0;

CREATE TABLE IF NOT EXISTS `#__fabrik_change_log` (
    `id` INT( 11 ) NOT NULL AUTO_INCREMENT PRIMARY KEY ,
    `user_id` INT( 11 ) NOT NULL DEFAULT 0 ,
    `ip_address` CHAR( 14 ) NOT NULL DEFAULT '' ,
    `referrer` TEXT,
    `time_date` DATETIME NULL DEFAULT NULL ,
    `form_id` INT( 11 ) NOT NULL DEFAULT 0,
    `list_id` INT( 11 ) NOT NULL DEFAULT 0,
    `row_id` INT( 11 ) NOT NULL DEFAULT 0,
    `join_id` INT( 11 ) DEFAULT 0,
    `log_type_id` INT( 11 ) NOT NULL DEFAULT 0,
    `parent_id` INT( 11 ) NOT NULL DEFAULT 0
);

ALTER TABLE `#__fabrik_change_log` ALTER `user_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_change_log` ALTER `ip_address` SET DEFAULT '';
ALTER TABLE `#__fabrik_change_log` MODIFY `time_date` datetime NULL DEFAULT NULL;
ALTER TABLE `#__fabrik_change_log` ALTER `form_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_change_log` ALTER `list_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_change_log` ALTER `row_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_change_log` ALTER `join_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_change_log` ALTER `log_type_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_change_log` ALTER `parent_id` SET DEFAULT 0;

CREATE TABLE IF NOT EXISTS `#__fabrik_change_log_types` (
     `id` INT( 11 ) NOT NULL AUTO_INCREMENT PRIMARY KEY ,
    `type` VARCHAR( 32 ) NOT NULL DEFAULT ''
);

ALTER TABLE `#__fabrik_change_log_types` ALTER `type` SET DEFAULT '';