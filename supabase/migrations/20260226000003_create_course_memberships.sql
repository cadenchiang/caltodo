-- Links users to courses. Auto-populated during sync.
-- Users can see their own memberships and co-member memberships
-- (i.e. other users in the same courses they belong to).

CREATE TABLE course_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One membership per (user, course)
CREATE UNIQUE INDEX idx_course_memberships_user_course ON course_memberships (user_id, course_id);

-- Index for fast lookups by course
CREATE INDEX idx_course_memberships_course ON course_memberships (course_id);

ALTER TABLE course_memberships ENABLE ROW LEVEL SECURITY;

-- Users can see memberships for courses they belong to
CREATE POLICY "memberships_select" ON course_memberships
  FOR SELECT TO authenticated
  USING (
    course_id IN (
      SELECT cm.course_id FROM course_memberships cm
      WHERE cm.user_id = auth.uid()
    )
  );

-- Users can only insert their own memberships
CREATE POLICY "memberships_insert" ON course_memberships
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
