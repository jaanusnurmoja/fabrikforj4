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

CREATE TABLE IF NOT EXISTS `#__fabrik_change_log_types` (
     `id` INT( 11 ) NOT NULL AUTO_INCREMENT PRIMARY KEY ,
    `type` VARCHAR( 32 ) NOT NULL DEFAULT ''
);

INSERT IGNORE INTO `#__fabrik_change_log_types` (id, type)
VALUES
(1, 'Add Row'),
(2, 'Edit Row'),
(3, 'Delete Row'),
(4, 'Submit Form'),
(5, 'Load Form'),
(6, 'Delete Row'),
(7, 'Add Joined Row'),
(8, 'Delete Joined Row'),
(9, 'Field Value Change'),
(10, 'Edit Joined Row'),
(11, 'Load Details')