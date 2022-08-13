CREATE TABLE IF NOT EXISTS `#__fabrik_comments` (
	`id` INT( 11 ) NOT NULL AUTO_INCREMENT PRIMARY KEY ,
	`user_id` INT( 11 ) NOT NULL DEFAULT 0 ,
	`ipaddress` CHAR( 14 ) NOT NULL DEFAULT '' ,
	`reply_to` INT( 11 ) NOT NULL DEFAULT 0 ,
	`comment` MEDIUMTEXT NOT NULL DEFAULT '' ,
	`approved` TINYINT( 1 ) NOT NULL DEFAULT 0 ,
	`time_date` TIMESTAMP,
	`url` varchar( 255 ) NOT NULL DEFAULT '' ,
	`name` VARCHAR( 150 ) NOT NULL DEFAULT '' ,
	`email` VARCHAR( 100 ) NOT NULL DEFAULT '' ,
	`formid` INT( 6 ) NOT NULL DEFAULT 0,
	`row_id` INT( 6 ) NOT NULL DEFAULT 0,
	`rating` CHAR(2) NOT NULL DEFAULT '',
	`annonymous` TINYINT(1) NOT NULL DEFAULT 0,
	`notify` TINYINT(1) NOT NULL DEFAULT 0,
	`diggs` INT( 6 ) NOT NULL DEFAULT 0
);