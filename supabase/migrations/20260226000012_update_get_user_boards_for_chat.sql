-- Update get_user_boards() to return chat message stats instead of post counts.
-- Returns message_count, last_message_body, last_message_author, last_message_at
-- so board cards can show a chat preview. Ordered by most recent activity.

DROP FUNCTION IF EXISTS get_user_boards();

CREATE OR REPLACE FUNCTION get_user_boards()
RETURNS TABLE (
  course_id UUID,
  course_source TEXT,
  course_external_id TEXT,
  course_name TEXT,
  course_created_at TIMESTAMPTZ,
  message_count BIGINT,
  last_message_body TEXT,
  last_message_author TEXT,
  last_message_at TIMESTAMPTZ,
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
    COALESCE(mc.cnt, 0) AS message_count,
    lm.body AS last_message_body,
    lm.author_name AS last_message_author,
    lm.created_at AS last_message_at,
    COALESCE(mem.cnt, 0) AS member_count,
    COALESCE(mem.avatars, '[]'::jsonb) AS member_avatars
  FROM course_memberships cm
  JOIN courses c ON c.id = cm.course_id
  -- Message count per course
  LEFT JOIN (
    SELECT course_id, COUNT(*) AS cnt
    FROM chat_messages
    GROUP BY course_id
  ) mc ON mc.course_id = c.id
  -- Latest message per course (DISTINCT ON picks the newest)
  LEFT JOIN LATERAL (
    SELECT body, author_name, created_at
    FROM chat_messages
    WHERE course_id = c.id
    ORDER BY created_at DESC
    LIMIT 1
  ) lm ON true
  -- Member count and avatar previews
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*) AS cnt,
      jsonb_agg(
        jsonb_build_object('name', p.raw_user_meta_data->>'full_name', 'avatar', p.raw_user_meta_data->>'avatar_url')
        ORDER BY cmem.joined_at
      ) FILTER (WHERE rn <= 5) AS avatars
    FROM (
      SELECT cmem2.user_id, cmem2.joined_at,
             ROW_NUMBER() OVER (ORDER BY cmem2.joined_at) AS rn
      FROM course_memberships cmem2
      WHERE cmem2.course_id = c.id
    ) sub
    JOIN course_memberships cmem ON cmem.user_id = sub.user_id AND cmem.course_id = c.id
    JOIN auth.users p ON p.id = sub.user_id
  ) mem ON true
  WHERE cm.user_id = auth.uid()
  ORDER BY lm.created_at DESC NULLS LAST, c.name;
$$;
