-- One room per class (D4): backfill memberships into the primary course row.
--
-- The sync stores one courses row per (source, external_id), so a class a
-- student sees on Canvas and Gradescope is two rows that share a canonical
-- name. The chat now treats rows with the same normalized name as one room
-- and uses the oldest row (then the lowest id) as that room, for every
-- viewer. Members of the sibling rows need a membership in the primary row
-- or they cannot read or post in the room.
--
-- This inserts the missing memberships. It never moves or deletes messages
-- and never touches existing rows: a member who hid the primary (deleted_at
-- set) stays hidden, and a member who already has the row is left alone.
-- System courses (CalYak) are excluded; they are never merged.
--
-- Deploy order: safe to run before or after the code that groups rooms.
-- The boards route and course-enrollment.ts enroll on demand as well, so a
-- delay only means a member is added at their next boards request.

with grouped as (
  select
    c.id,
    lower(regexp_replace(btrim(c.name), '\s+', ' ', 'g')) as room_key,
    row_number() over (
      partition by lower(regexp_replace(btrim(c.name), '\s+', ' ', 'g'))
      order by c.created_at asc, c.id asc
    ) as rn
  from public.courses c
  where c.source <> 'system'
),
primaries as (
  select room_key, id as primary_id from grouped where rn = 1
),
siblings as (
  select g.id as sibling_id, p.primary_id
  from grouped g
  join primaries p on p.room_key = g.room_key
  where g.id <> p.primary_id
),
missing as (
  select distinct cm.user_id, s.primary_id as course_id
  from public.course_memberships cm
  join siblings s on s.sibling_id = cm.course_id
  where cm.deleted_at is null
    and not exists (
      select 1 from public.course_memberships existing
      where existing.user_id = cm.user_id
        and existing.course_id = s.primary_id
    )
)
insert into public.course_memberships (user_id, course_id)
select user_id, course_id from missing
on conflict (user_id, course_id) do nothing;
