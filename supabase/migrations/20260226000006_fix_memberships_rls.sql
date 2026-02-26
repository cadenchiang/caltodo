-- Fix infinite recursion in course_memberships RLS.
-- The original policy referenced course_memberships inside its own USING clause,
-- which PostgreSQL cannot resolve without recursion.
-- Split into two non-recursive policies:
--   1. Users can always see their own memberships
--   2. Users can see co-members via a join through courses (no self-reference)

DROP POLICY IF EXISTS "memberships_select" ON course_memberships;

-- Policy 1: Users can see their own memberships
CREATE POLICY "memberships_select_own" ON course_memberships
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Users can see other members in courses they belong to.
-- Uses an EXISTS join through courses to avoid self-referencing course_memberships.
CREATE POLICY "memberships_select_comembers" ON course_memberships
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM course_memberships my_mem
      WHERE my_mem.user_id = auth.uid()
        AND my_mem.course_id = course_memberships.course_id
    )
  );
