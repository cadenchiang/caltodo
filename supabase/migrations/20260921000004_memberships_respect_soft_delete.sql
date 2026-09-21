-- Make every membership read path honour course_memberships.deleted_at.
--
-- 20260308000003 added soft delete to course_memberships, and the newer
-- policies (20260415000001) and the discussion page already treat a row
-- with deleted_at set as "not a member". The three functions that gate the
-- chat itself never did: get_my_course_ids() (the basis of the chat_messages
-- and course_memberships RLS policies), get_user_boards() (the sidebar
-- list) and get_course_members() (the member list) all counted soft-deleted
-- rows. That did not matter while /api/discussions/leave hard-deleted, but a
-- hard delete left nothing to stop the next sync re-enrolling the user
-- (audit H12). Leave now soft-deletes, so these must filter.
--
-- Bodies are otherwise identical to 20260226000008 and 20260226000021.

CREATE OR REPLACE FUNCTION get_my_course_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT course_id FROM course_memberships
  WHERE user_id = auth.uid() AND deleted_at IS NULL;
$$;

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
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      split_part(u.email, '@', 1)
    ) AS user_name,
    u.raw_user_meta_data->>'avatar_url' AS user_avatar,
    cm.joined_at
  FROM course_memberships cm
  JOIN auth.users u ON u.id = cm.user_id
  WHERE cm.course_id = p_course_id
    AND cm.deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM course_memberships my_mem
      WHERE my_mem.user_id = auth.uid()
        AND my_mem.course_id = p_course_id
        AND my_mem.deleted_at IS NULL
    )
  ORDER BY cm.joined_at;
$$;

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
  LEFT JOIN (
    SELECT course_id, COUNT(*) AS cnt
    FROM chat_messages
    GROUP BY course_id
  ) mc ON mc.course_id = c.id
  LEFT JOIN LATERAL (
    SELECT body, author_name, created_at
    FROM chat_messages
    WHERE course_id = c.id
    ORDER BY created_at DESC
    LIMIT 1
  ) lm ON true
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*) AS cnt,
      jsonb_agg(
        jsonb_build_object(
          'name', COALESCE(p.raw_user_meta_data->>'full_name', p.raw_user_meta_data->>'name', split_part(p.email, '@', 1)),
          'avatar', p.raw_user_meta_data->>'avatar_url'
        )
        ORDER BY cmem.joined_at
      ) FILTER (WHERE rn <= 5) AS avatars
    FROM (
      SELECT cmem2.user_id, cmem2.joined_at,
             ROW_NUMBER() OVER (ORDER BY cmem2.joined_at) AS rn
      FROM course_memberships cmem2
      WHERE cmem2.course_id = c.id
        AND cmem2.deleted_at IS NULL
    ) sub
    JOIN course_memberships cmem
      ON cmem.user_id = sub.user_id
     AND cmem.course_id = c.id
     AND cmem.deleted_at IS NULL
    JOIN auth.users p ON p.id = sub.user_id
  ) mem ON true
  WHERE cm.user_id = auth.uid()
    AND cm.deleted_at IS NULL
  ORDER BY lm.created_at DESC NULLS LAST, c.name;
$$;
