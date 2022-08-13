CREATE TABLE IF NOT EXISTS `#__fabrik_notification` (
	`id` INT( 11 ) NOT NULL AUTO_INCREMENT PRIMARY KEY ,
	`reference` VARCHAR( 50 ) NOT NULL DEFAULT '' COMMENT 'tableid.formid.rowid reference',
	`user_id` INT( 6 ) NOT NULL DEFAULT 0 ,
	`reason` VARCHAR( 40 ) NOT NULL DEFAULT '',
	`message` TEXT NOT NULL DEFAULT '',
	`label` VARCHAR( 200 ) NOT NULL DEFAULT '',
	 UNIQUE `uniquereason` ( `user_id` , `reason` ( 20 ) , `reference` )
);
 
CREATE TABLE IF NOT EXISTS `#__fabrik_notification_event` (
	`id` INT( 11 ) NOT NULL AUTO_INCREMENT PRIMARY KEY ,
	`reference` VARCHAR( 50 ) NOT NULL DEFAULT '' COMMENT 'tableid.formid.rowid reference',
	`event` VARCHAR( 255 ) NOT NULL DEFAULT '' ,
	`user_id` INT (6) NOT NULL DEFAULT 0,
	`date_time` DATETIME NULL DEFAULT NULL 
);
 
 CREATE TABLE  IF NOT EXISTS `#__fabrik_notification_event_sent` (
	`id` INT( 6 ) NOT NULL AUTO_INCREMENT PRIMARY KEY ,
	`notification_event_id` INT( 6 ) NOT NULL DEFAULT 0 ,
	`user_id` INT( 6 ) NOT NULL DEFAULT 0 ,
	`date_sent` TIMESTAMP,
	`sent` TINYINT( 1 ) NOT NULL DEFAULT '0',
	UNIQUE `user_notified` ( `notification_event_id` , `user_id` )
);