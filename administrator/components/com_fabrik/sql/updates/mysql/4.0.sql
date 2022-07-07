ALTER TABLE `#__fabrik_groups` ALTER modified SET DEFAULT NULL
ALTER TABLE `#__fabrik_groups` ALTER modified_by SET DEFAULT 0
ALTER TABLE `#__fabrik_groups` ALTER checked_out SET DEFAULT 0
ALTER TABLE `#__fabrik_groups` ALTER checked_out_time SET DEFAULT NULL

ALTER TABLE `#__fabrik_lists` ALTER form_id SET DEFAULT 0
ALTER TABLE `#__fabrik_lists` ALTER modified SET DEFAULT NULL
ALTER TABLE `#__fabrik_lists` ALTER modified_by SET DEFAULT 0
ALTER TABLE `#__fabrik_lists` ALTER checked_out SET DEFAULT 0
ALTER TABLE `#__fabrik_lists` ALTER checked_out_time SET DEFAULT NULL
ALTER TABLE `#__fabrik_lists` ALTER hits SET DEFAULT 0

ALTER TABLE `#__fabrik_forms` ALTER modified SET DEFAULT NULL
ALTER TABLE `#__fabrik_forms` ALTER modified_by SET DEFAULT 0
ALTER TABLE `#__fabrik_forms` ALTER checked_out SET DEFAULT 0
ALTER TABLE `#__fabrik_forms` ALTER checked_out_time SET DEFAULT NULL
ALTER TABLE `#__fabrik_forms` ALTER reset_button_label SET DEFAULT ""

ALTER TABLE `#__fabrik_elements` ALTER modified SET DEFAULT NULL
ALTER TABLE `#__fabrik_elements` ALTER modified_by SET DEFAULT 0
ALTER TABLE `#__fabrik_elements` ALTER checked_out SET DEFAULT 0
ALTER TABLE `#__fabrik_elements` ALTER checked_out_time SET DEFAULT NULL
ALTER TABLE `#__fabrik_elements` ALTER width SET DEFAULT 0
ALTER TABLE `#__fabrik_elements` ALTER parent_id SET DEFAULT 0

ALTER TABLE `#__fabrik_joins` ALTER list_id SET DEFAULT 0
ALTER TABLE `#__fabrik_joins` ALTER element_id SET DEFAULT 0
ALTER TABLE `#__fabrik_joins` ALTER group_id SET DEFAULT 0
ALTER TABLE `#__fabrik_joins` ALTER join_from_table SET DEFAULT ''
ALTER TABLE `#__fabrik_joins` ALTER table_join SET DEFAULT ''
ALTER TABLE `#__fabrik_joins` ALTER table_key SET DEFAULT ''
ALTER TABLE `#__fabrik_joins` ALTER table_join_key SET DEFAULT ''
ALTER TABLE `#__fabrik_joins` ALTER join_type SET DEFAULT ''
ALTER TABLE `#__fabrik_joins` ALTER params SET DEFAULT ''