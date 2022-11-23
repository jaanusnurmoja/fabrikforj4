CREATE TABLE IF NOT EXISTS `#__fabrik_privacy` (
	`id` INT( 11 ) NOT NULL AUTO_INCREMENT PRIMARY KEY ,
	`date_time` DATETIME,
	`list_id` INT( 6 ) NOT NULL DEFAULT 0,
	`form_id` INT( 6 ) NOT NULL DEFAULT 0,
	`row_id` INT( 6 ) NOT NULL DEFAULT 0 ,
	`user_id` INT( 6 ) NOT NULL DEFAULT 0 ,
	`consent_message` TEXT,
	`update_record` TINYINT( 1 ) NOT NULL DEFAULT 0 ,
	`ip` VARCHAR( 100 ) NOT NULL DEFAULT '',
	`newsletter_engine` VARCHAR(50) NULL DEFAULT '',
	`sublist_id` INT(6) NOT NULL DEFAULT 0,
	`subid` INT(6) NOT NULL DEFAULT 0
);

ALTER TABLE `#__fabrik_privacy` MODIFY `date_time` datetime NULL DEFAULT NULL;
ALTER TABLE `#__fabrik_privacy` ALTER `list_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_privacy` ALTER `form_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_privacy` ALTER `row_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_privacy` ALTER `user_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_privacy` ALTER `update_record` SET DEFAULT 0;
ALTER TABLE `#__fabrik_privacy` ALTER `ip` SET DEFAULT '';
ALTER TABLE `#__fabrik_privacy` ALTER `newsletter_engine` SET DEFAULT '';
ALTER TABLE `#__fabrik_privacy` ALTER `sublist_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_privacy` ALTER `subid` SET DEFAULT 0;

