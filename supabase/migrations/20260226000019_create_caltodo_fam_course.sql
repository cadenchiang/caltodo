-- Create the system-wide "calfam" global chat course.
-- Uses ON CONFLICT to safely re-run without duplicating.
INSERT INTO courses (source, external_id, name)
VALUES ('system', 'caltodo-fam', 'calfam')
ON CONFLICT (source, external_id) DO UPDATE SET name = EXCLUDED.name;
