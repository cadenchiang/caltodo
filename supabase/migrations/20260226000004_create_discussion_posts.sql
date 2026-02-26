-- Reddit/EdStem-style discussion posts within a course board.
-- Course members can read and create; authors can update/delete their own.

CREATE TABLE discussion_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast lookups by course (ordered by pinned first, then newest)
CREATE INDEX idx_discussion_posts_course ON discussion_posts (course_id, is_pinned DESC, created_at DESC);

-- Fast lookups by author
CREATE INDEX idx_discussion_posts_author ON discussion_posts (author_id);

ALTER TABLE discussion_posts ENABLE ROW LEVEL SECURITY;

-- Course members can read posts in their courses
CREATE POLICY "posts_select" ON discussion_posts
  FOR SELECT TO authenticated
  USING (
    course_id IN (
      SELECT cm.course_id FROM course_memberships cm
      WHERE cm.user_id = auth.uid()
    )
  );

-- Course members can create posts in their courses
CREATE POLICY "posts_insert" ON discussion_posts
  FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND course_id IN (
      SELECT cm.course_id FROM course_memberships cm
      WHERE cm.user_id = auth.uid()
    )
  );

-- Authors can update their own posts
CREATE POLICY "posts_update" ON discussion_posts
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Authors can delete their own posts
CREATE POLICY "posts_delete" ON discussion_posts
  FOR DELETE TO authenticated
  USING (author_id = auth.uid());
