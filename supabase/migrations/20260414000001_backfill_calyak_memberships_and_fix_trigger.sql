-- Backfill CalYak memberships for every existing auth.users row, and
-- repair the auto-enroll trigger that was silently broken since migration
-- 20260227000003 renamed the course external_id from 'caltodo-fam' to
-- 'caltodo-yak'. The original trigger in 20260226000020 still referenced
-- the old id, so every signup after the rename failed to enroll unless
-- the user later visited /app/discussions (the API-side fallback).

-- 1) One-time backfill: enroll every user into CalYak. Idempotent via the
--    (user_id, course_id) unique constraint.
INSERT INTO course_memberships (user_id, course_id)
SELECT u.id, c.id
FROM auth.users u
CROSS JOIN courses c
WHERE c.source = 'system' AND c.external_id = 'caltodo-yak'
ON CONFLICT (user_id, course_id) DO NOTHING;

-- 2) Reactivate any soft-deleted memberships — the user had left or was
--    removed at some point but we're bringing them back per product intent.
UPDATE course_memberships cm
SET deleted_at = NULL
FROM courses c
WHERE cm.course_id = c.id
  AND c.source = 'system'
  AND c.external_id = 'caltodo-yak'
  AND cm.deleted_at IS NOT NULL;

-- 3) Fix the trigger function to reference the renamed external_id so
--    future signups are enrolled automatically.
CREATE OR REPLACE FUNCTION auto_enroll_calfam()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO course_memberships (user_id, course_id)
  SELECT NEW.id, c.id
  FROM courses c
  WHERE c.source = 'system' AND c.external_id = 'caltodo-yak'
  ON CONFLICT (user_id, course_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
