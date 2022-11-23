CREATE TABLE IF NOT EXISTS  `#__fabrik_thumbs` (
	`user_id` VARCHAR( 40 ) NOT NULL DEFAULT '' ,
	`listid` INT( 6 ) NOT NULL DEFAULT 0 ,
	`formid` INT( 6 ) NOT NULL DEFAULT 0 ,
	`row_id` INT( 6 ) NOT NULL DEFAULT 0 ,
	`thumb` VARCHAR( 255 ) NOT NULL DEFAULT '',
	`date_created` DATETIME NULL DEFAULT NULL,
	`element_id` INT( 6 ) NOT NULL DEFAULT 0,
	`special` VARCHAR(30) DEFAULT '',
	 PRIMARY KEY ( `user_id` , `listid` , `formid` , `row_id`, `element_id`, `special` )
);

ALTER TABLE `#__fabrik_thumbs` ALTER `user_id` SET DEFAULT '';
ALTER TABLE `#__fabrik_thumbs` ALTER `listid` SET DEFAULT 0;
ALTER TABLE `#__fabrik_thumbs` ALTER `formid` SET DEFAULT 0;
ALTER TABLE `#__fabrik_thumbs` ALTER `row_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_thumbs` ALTER `thumb` SET DEFAULT '';
ALTER TABLE `#__fabrik_thumbs` MODIFY `date_created` datetime NULL DEFAULT NULL;
ALTER TABLE `#__fabrik_thumbs` ALTER `element_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_thumbs` ALTER `special` SET DEFAULT '';