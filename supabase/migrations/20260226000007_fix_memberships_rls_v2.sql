-- The co-members policy still caused recursion because it references
-- course_memberships inside its own USING clause via EXISTS.
-- Simplify: users can only see their own memberships via RLS.
-- Co-member lookups will use the admin client when needed.

DROP POLICY IF EXISTS "memberships_select_comembers" ON course_memberships;
