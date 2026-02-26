-- Create the system-wide "CalTodo Fam" global chat course.
-- Uses ON CONFLICT to safely re-run without duplicating.
INSERT INTO courses (source, external_id, name)
VALUES ('system', 'caltodo-fam', 'CalTodo Fam')
ON CONFLICT (source, external_id) DO NOTHING;
