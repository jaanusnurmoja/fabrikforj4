CREATE TABLE IF NOT EXISTS `#__fabrik_notification` (
	`id` INT( 11 ) NOT NULL AUTO_INCREMENT PRIMARY KEY ,
	`reference` VARCHAR( 50 ) NOT NULL DEFAULT '' COMMENT 'tableid.formid.rowid reference',
	`user_id` INT( 6 ) NOT NULL DEFAULT 0 ,
	`reason` VARCHAR( 40 ) NOT NULL DEFAULT '',
	`message` TEXT,
	`label` VARCHAR( 200 ) NOT NULL DEFAULT '',
	 UNIQUE `uniquereason` ( `user_id` , `reason` ( 20 ) , `reference` )
);
 
ALTER TABLE `#__fabrik_notification` ALTER `reference` SET DEFAULT '';
ALTER TABLE `#__fabrik_notification` ALTER `user_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_notification` ALTER `reason` SET DEFAULT '';
ALTER TABLE `#__fabrik_notification` ALTER `label` SET DEFAULT '';

CREATE TABLE IF NOT EXISTS `#__fabrik_notification_event` (
	`id` INT( 11 ) NOT NULL AUTO_INCREMENT PRIMARY KEY ,
	`reference` VARCHAR( 50 ) NOT NULL DEFAULT '' COMMENT 'tableid.formid.rowid reference',
	`event` VARCHAR( 255 ) NOT NULL DEFAULT '' ,
	`user_id` INT (6) NOT NULL DEFAULT 0,
	`date_time` DATETIME NULL DEFAULT NULL 
);

ALTER TABLE `#__fabrik_notification_event` ALTER `reference` SET DEFAULT '';
ALTER TABLE `#__fabrik_notification_event` ALTER `event` SET DEFAULT '';
ALTER TABLE `#__fabrik_notification_event` ALTER `user_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_notification_event` MODIFY `date_time` datetime NULL DEFAULT NULL;

CREATE TABLE  IF NOT EXISTS `#__fabrik_notification_event_sent` (
	`id` INT( 6 ) NOT NULL AUTO_INCREMENT PRIMARY KEY ,
	`notification_event_id` INT( 6 ) NOT NULL DEFAULT 0 ,
	`user_id` INT( 6 ) NOT NULL DEFAULT 0 ,
	`date_sent` TIMESTAMP,
	`sent` TINYINT( 1 ) NOT NULL DEFAULT '0',
	UNIQUE `user_notified` ( `notification_event_id` , `user_id` )
);

ALTER TABLE `#__fabrik_notification_event_sent` ALTER `notification_event_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_notification_event_sent` ALTER `user_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_notification_event_sent` ALTER `sent` SET DEFAULT 0;