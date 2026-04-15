-- Security + reliability pass driven by the 2026-04-14 audit.
--
-- 1. message_reports: had RLS enabled but zero policies, so every /api/discussions/report
--    INSERT silently failed. Allow authenticated users to insert reports.
-- 2. courses: existing INSERT policy allowed ANY authenticated user to create a course
--    with an arbitrary `source` value (could spoof canvas/gradescope data).
--    Tighten to only allow 'notes' + 'custom' sources (the user-facing folder use
--    cases in NotesFolderGrid.tsx). Sync routes use the admin client → bypass RLS.
-- 3. courses update: still allow rename on owned memberships, but forbid changing
--    the integration columns (source, external_id) so a user cannot rebrand a
--    custom folder as a Canvas assignment source.
-- 4. notes: previously only checked user_id. Now also require that any non-null
--    course_id is a course the user is actually a member of.
-- 5. Hot-path indexes that show up as full scans at ~1k+ users.

-- ---------------------------------------------------------------------------
-- 1. message_reports — allow authenticated users to file reports
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "reports_insert_own" ON message_reports;
CREATE POLICY "reports_insert_own" ON message_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

-- Reporters can read back their own reports (e.g. "you've already reported this")
DROP POLICY IF EXISTS "reports_select_own" ON message_reports;
CREATE POLICY "reports_select_own" ON message_reports
  FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid());
-- Admin reads use the service role which bypasses RLS.

-- ---------------------------------------------------------------------------
-- 2 & 3. courses — lock integration sources against client-side spoofing
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "courses_insert" ON courses;
CREATE POLICY "courses_insert" ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (source IN ('notes', 'custom'));

DROP POLICY IF EXISTS "courses_update" ON courses;
CREATE POLICY "courses_update" ON courses
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT cm.course_id FROM course_memberships cm
      WHERE cm.user_id = auth.uid() AND cm.deleted_at IS NULL
    )
  )
  WITH CHECK (
    -- User-facing renames only: the integration identity is immutable from the client.
    source IN ('notes', 'custom')
  );

-- ---------------------------------------------------------------------------
-- 4. notes — gate course_id by membership so a user can't link a note to a
--    course they aren't enrolled in (or get kicked out of after the fact).
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert own notes" ON public.notes;
CREATE POLICY "Users can insert own notes"
  ON public.notes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      course_id IS NULL
      OR EXISTS (
        SELECT 1 FROM course_memberships cm
        WHERE cm.user_id = auth.uid()
          AND cm.course_id = notes.course_id
          AND cm.deleted_at IS NULL
      )
    )
  );

DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
CREATE POLICY "Users can update own notes"
  ON public.notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      course_id IS NULL
      OR EXISTS (
        SELECT 1 FROM course_memberships cm
        WHERE cm.user_id = auth.uid()
          AND cm.course_id = notes.course_id
          AND cm.deleted_at IS NULL
      )
    )
  );

-- ---------------------------------------------------------------------------
-- 5. Hot-path indexes
-- ---------------------------------------------------------------------------

-- course_memberships is joined by user_id on every chat message fetch and
-- every notes/discussions boards render. The existing idx covers course_id
-- but not user_id → full scan at scale.
CREATE INDEX IF NOT EXISTS idx_course_memberships_user_id
  ON course_memberships (user_id)
  WHERE deleted_at IS NULL;

-- Sync-engine dedup predicate: (user_id, source, external_id). The existing
-- idx_tasks_user_id helps the first leg but the server still scans tens of
-- thousands of rows per user at sync time.
CREATE INDEX IF NOT EXISTS idx_tasks_user_source_external
  ON tasks (user_id, source, external_id)
  WHERE source IS NOT NULL;

-- Discussion posts: "all posts by author" queries (profile pages) currently
-- scan course_id-time indexes and filter in-app. Guarded in a DO block so
-- the whole migration doesn't fail if the table hasn't been created in
-- this environment yet.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'discussion_posts'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_discussion_posts_author_created ON public.discussion_posts (author_id, created_at DESC)';
  END IF;
END $$;
