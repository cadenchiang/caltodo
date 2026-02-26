-- Use a SECURITY DEFINER function to break RLS recursion.
-- The function runs as the table owner (bypasses RLS), so the policy
-- can reference course_memberships without infinite recursion.

CREATE OR REPLACE FUNCTION get_my_course_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT course_id FROM course_memberships WHERE user_id = auth.uid();
$$;

-- Replace the own-only policy with one that also shows co-members
DROP POLICY IF EXISTS "memberships_select_own" ON course_memberships;

CREATE POLICY "memberships_select" ON course_memberships
  FOR SELECT TO authenticated
  USING (course_id IN (SELECT get_my_course_ids()));
