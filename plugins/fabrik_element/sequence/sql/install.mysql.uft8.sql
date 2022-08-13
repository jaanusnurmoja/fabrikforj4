CREATE TABLE IF NOT EXISTS  `#__fabrik_sequences` (
	`table_name` VARCHAR( 64 ) NOT NULL DEFAULT '',
	`affix` VARCHAR( 32 ) NOT NULL DEFAULT '',
	`sequence` INT( 6 ) NOT NULL DEFAULT 0,
	`date_created` DATETIME NULL DEFAULT NULL,
	`element_id` INT( 6 ) NOT NULL DEFAULT 0,
	 PRIMARY KEY ( `table_name` , `affix`, `sequence`, `element_id` )
);