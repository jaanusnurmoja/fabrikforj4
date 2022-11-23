CREATE TABLE IF NOT EXISTS  `#__fabrik_ratings` (
	`user_id` VARCHAR( 40 ) NOT NULL DEFAULT '' ,
	`listid` INT( 6 ) NOT NULL DEFAULT 0 ,
	`formid` INT( 6 ) NOT NULL DEFAULT 0 ,
	`row_id` INT( 6 ) NOT NULL DEFAULT 0 ,
	`rating` INT( 6 ) NOT NULL DEFAULT 0,
	`date_created` DATETIME NULL DEFAULT NULL,
	`element_id` INT( 6 ) NOT NULL DEFAULT 0,
	 PRIMARY KEY ( `user_id` , `listid` , `formid` , `row_id`, `element_id` )
);

ALTER TABLE `#__fabrik_ratings` ALTER `user_id` SET DEFAULT '';
ALTER TABLE `#__fabrik_ratings` ALTER `listid` SET DEFAULT 0;
ALTER TABLE `#__fabrik_ratings` ALTER `formid` SET DEFAULT 0;
ALTER TABLE `#__fabrik_ratings` ALTER `row_id` SET DEFAULT 0;
ALTER TABLE `#__fabrik_ratings` ALTER `rating` SET DEFAULT 0;
ALTER TABLE `#__fabrik_ratings` MODIFY `date_created` datetime NULL DEFAULT NULL;
ALTER TABLE `#__fabrik_ratings` ALTER `element_id` SET DEFAULT 0;