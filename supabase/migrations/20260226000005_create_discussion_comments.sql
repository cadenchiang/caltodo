-- Comments on discussion posts, with one level of nesting via parent_id.
-- Course members can read and create; authors can update/delete their own.

CREATE TABLE discussion_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES discussion_posts (id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  parent_id UUID REFERENCES discussion_comments (id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast lookups by post (ordered by creation time)
CREATE INDEX idx_discussion_comments_post ON discussion_comments (post_id, created_at ASC);

-- Fast lookups by parent (for building reply trees)
CREATE INDEX idx_discussion_comments_parent ON discussion_comments (parent_id);

-- Fast lookups by author
CREATE INDEX idx_discussion_comments_author ON discussion_comments (author_id);

ALTER TABLE discussion_comments ENABLE ROW LEVEL SECURITY;

-- Course members can read comments on posts in their courses
CREATE POLICY "comments_select" ON discussion_comments
  FOR SELECT TO authenticated
  USING (
    post_id IN (
      SELECT dp.id FROM discussion_posts dp
      WHERE dp.course_id IN (
        SELECT cm.course_id FROM course_memberships cm
        WHERE cm.user_id = auth.uid()
      )
    )
  );

-- Course members can create comments on posts in their courses
CREATE POLICY "comments_insert" ON discussion_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND post_id IN (
      SELECT dp.id FROM discussion_posts dp
      WHERE dp.course_id IN (
        SELECT cm.course_id FROM course_memberships cm
        WHERE cm.user_id = auth.uid()
      )
    )
  );

-- Authors can update their own comments
CREATE POLICY "comments_update" ON discussion_comments
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Authors can delete their own comments
CREATE POLICY "comments_delete" ON discussion_comments
  FOR DELETE TO authenticated
  USING (author_id = auth.uid());
