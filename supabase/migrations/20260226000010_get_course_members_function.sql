-- Returns members of a course with their profile info.
-- Only accessible if the calling user is also in the course.

CREATE OR REPLACE FUNCTION get_course_members(p_course_id UUID)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  user_avatar TEXT,
  joined_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    cm.user_id,
    u.raw_user_meta_data->>'full_name' AS user_name,
    u.raw_user_meta_data->>'avatar_url' AS user_avatar,
    cm.joined_at
  FROM course_memberships cm
  JOIN auth.users u ON u.id = cm.user_id
  WHERE cm.course_id = p_course_id
    AND EXISTS (
      SELECT 1 FROM course_memberships my_mem
      WHERE my_mem.user_id = auth.uid()
        AND my_mem.course_id = p_course_id
    )
  ORDER BY cm.joined_at;
$$;

-- Must DROP then CREATE because return type changed (added member_count, member_avatars)
DROP FUNCTION IF EXISTS get_user_boards();

CREATE FUNCTION get_user_boards()
RETURNS TABLE (
  course_id UUID,
  course_source TEXT,
  course_external_id TEXT,
  course_name TEXT,
  course_created_at TIMESTAMPTZ,
  post_count BIGINT,
  member_count BIGINT,
  member_avatars JSONB
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
    COALESCE(pc.cnt, 0) AS post_count,
    COALESCE(mc.cnt, 0) AS member_count,
    COALESCE(mc.avatars, '[]'::jsonb) AS member_avatars
  FROM course_memberships cm
  JOIN courses c ON c.id = cm.course_id
  LEFT JOIN (
    SELECT course_id, COUNT(*) AS cnt
    FROM discussion_posts
    GROUP BY course_id
  ) pc ON pc.course_id = c.id
  LEFT JOIN (
    SELECT
      cm2.course_id,
      COUNT(*) AS cnt,
      jsonb_agg(
        jsonb_build_object(
          'name', u.raw_user_meta_data->>'full_name',
          'avatar', u.raw_user_meta_data->>'avatar_url'
        )
        ORDER BY cm2.joined_at
      ) FILTER (WHERE cm2.rn <= 5) AS avatars
    FROM (
      SELECT *, ROW_NUMBER() OVER (PARTITION BY course_id ORDER BY joined_at) AS rn
      FROM course_memberships
    ) cm2
    JOIN auth.users u ON u.id = cm2.user_id
    GROUP BY cm2.course_id
  ) mc ON mc.course_id = c.id
  WHERE cm.user_id = auth.uid()
  ORDER BY c.name;
$$;
