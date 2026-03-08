-- Allow authenticated users to create new course folders (source = 'system').
-- Also allow updates (e.g. renaming) on courses the user has membership in.

CREATE POLICY "courses_insert" ON courses
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "courses_update" ON courses
  FOR UPDATE TO authenticated
  USING (
    id IN (
      SELECT cm.course_id FROM course_memberships cm
      WHERE cm.user_id = auth.uid()
    )
  )
  WITH CHECK (true);
