-- Fix: add SET search_path = public to auto_enroll_calfam trigger function.
-- Without this, the function cannot resolve table names during auth.users INSERT,
-- causing "Database error saving new user" for all new signups.

CREATE OR REPLACE FUNCTION auto_enroll_calfam()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO course_memberships (user_id, course_id)
  SELECT NEW.id, c.id
  FROM courses c
  WHERE c.source = 'system' AND c.external_id = 'caltodo-fam'
  ON CONFLICT (user_id, course_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
