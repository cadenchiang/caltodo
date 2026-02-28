-- Enroll all existing users into the "calfam" global group chat.
-- Uses ON CONFLICT to skip users already enrolled.
INSERT INTO course_memberships (user_id, course_id)
SELECT u.id, c.id
FROM auth.users u
CROSS JOIN courses c
WHERE c.source = 'system' AND c.external_id = 'caltodo-fam'
ON CONFLICT (user_id, course_id) DO NOTHING;

-- Auto-enroll future users via a trigger on auth.users insert.
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

-- Drop if exists to make migration re-runnable.
DROP TRIGGER IF EXISTS trg_auto_enroll_calfam ON auth.users;

CREATE TRIGGER trg_auto_enroll_calfam
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_enroll_calfam();
