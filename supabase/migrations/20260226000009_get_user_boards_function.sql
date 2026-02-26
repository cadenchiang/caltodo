-- Single-query function that returns all boards for the current user.
-- Replaces 3+ sequential queries with one fast call.

CREATE OR REPLACE FUNCTION get_user_boards()
RETURNS TABLE (
  course_id UUID,
  course_source TEXT,
  course_external_id TEXT,
  course_name TEXT,
  course_created_at TIMESTAMPTZ,
  post_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id AS course_id,
    c.source AS course_source,
    c.external_id AS course_external_id,
    c.name AS course_name,
    c.created_at AS course_created_at,
    COALESCE(pc.cnt, 0) AS post_count
  FROM course_memberships cm
  JOIN courses c ON c.id = cm.course_id
  LEFT JOIN (
    SELECT course_id, COUNT(*) AS cnt
    FROM discussion_posts
    GROUP BY course_id
  ) pc ON pc.course_id = c.id
  WHERE cm.user_id = auth.uid()
  ORDER BY c.name;
$$;
