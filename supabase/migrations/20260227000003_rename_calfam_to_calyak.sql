-- Rename the system "calfam" course to "calyak"
UPDATE courses
SET name = 'calyak', external_id = 'caltodo-yak'
WHERE source = 'system' AND external_id = 'caltodo-fam';
