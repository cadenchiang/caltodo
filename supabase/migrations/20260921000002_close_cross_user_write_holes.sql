-- Closes the cross-user write holes found in the 2026-09-21 audit. Every one
-- of these was reachable with any signed-in account through PostgREST,
-- bypassing the API routes that do check ownership. Immutable-column rules
-- are enforced with BEFORE triggers rather than WITH CHECK subqueries, so
-- the intent is readable and does not depend on snapshot subtleties.
-- Service-role (server) writes are exempt: the routes that use it validate
-- ownership themselves.

-- Shared guard: true for end-user PostgREST roles, false for the server.
create or replace function public.is_end_user_role()
returns boolean
language sql
stable
set search_path = ''
as $$
  select current_user in ('authenticated', 'anon');
$$;

-------------------------------------------------------------------------------
-- C1. courses: any member could rewrite source/external_id of a shared
--     course (including the global CalYak system course). Renames stay
--     allowed; the integration identity is now actually immutable.
-------------------------------------------------------------------------------
create or replace function public.courses_guard_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if public.is_end_user_role() then
    if new.source is distinct from old.source
       or new.external_id is distinct from old.external_id then
      raise exception 'course source and external_id are immutable'
        using errcode = 'insufficient_privilege';
    end if;
    -- The system course is not renameable by members either.
    if old.source = 'system' then
      raise exception 'system courses cannot be edited'
        using errcode = 'insufficient_privilege';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists courses_guard_identity on public.courses;
create trigger courses_guard_identity
  before update on public.courses
  for each row execute function public.courses_guard_identity();

-------------------------------------------------------------------------------
-- C3. chat_messages: a member could move a message into a course they are
--     not in (UPDATE had no course constraint) and could insert any
--     author_name/author_avatar (impersonation). The name and avatar now
--     come from the caller's own JWT, exactly as the API derives them, and
--     course_id/author_id/reply_to_id are frozen after insert.
-------------------------------------------------------------------------------
create or replace function public.chat_messages_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  claims jsonb;
begin
  if not public.is_end_user_role() then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.course_id is distinct from old.course_id
       or new.author_id is distinct from old.author_id
       or new.reply_to_id is distinct from old.reply_to_id then
      raise exception 'message course, author and reply target are immutable'
        using errcode = 'insufficient_privilege';
    end if;
    -- Anonymity is decided at send time; it cannot be toggled afterwards.
    if (new.author_name is null) <> (old.author_name is null) then
      raise exception 'message anonymity cannot be changed'
        using errcode = 'insufficient_privilege';
    end if;
    return new;
  end if;

  -- INSERT: a named message carries the sender's own profile, never a
  -- client-supplied one. NULL author_name means anonymous and is kept.
  if new.author_name is not null then
    claims := coalesce(auth.jwt() -> 'user_metadata', '{}'::jsonb);
    new.author_name := coalesce(
      claims ->> 'full_name',
      claims ->> 'name',
      split_part(coalesce(auth.jwt() ->> 'email', ''), '@', 1)
    );
    new.author_avatar := claims ->> 'avatar_url';
  else
    new.author_avatar := null;
  end if;

  -- A reply must target a message in the same course.
  if new.reply_to_id is not null and not exists (
    select 1 from public.chat_messages m
    where m.id = new.reply_to_id and m.course_id = new.course_id
  ) then
    raise exception 'reply target is not in this course'
      using errcode = 'foreign_key_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists chat_messages_guard on public.chat_messages;
create trigger chat_messages_guard
  before insert or update on public.chat_messages
  for each row execute function public.chat_messages_guard();

-------------------------------------------------------------------------------
-- C4. friendships: the receiver could rewrite requester_id to any user and
--     set status = 'accepted', forging a friendship and exposing that user's
--     email through /api/friends. Only status may change.
-------------------------------------------------------------------------------
create or replace function public.friendships_guard_parties()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if public.is_end_user_role() then
    if new.requester_id is distinct from old.requester_id
       or new.receiver_id is distinct from old.receiver_id then
      raise exception 'friendship parties are immutable'
        using errcode = 'insufficient_privilege';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists friendships_guard_parties on public.friendships;
create trigger friendships_guard_parties
  before update on public.friendships
  for each row execute function public.friendships_guard_parties();

-------------------------------------------------------------------------------
-- C5. task_shares: INSERT never checked the shared task belongs to the
--     inviter, and the invitee could repoint source_task_id at any task.
--     The API routes then copied whatever the row pointed at.
-------------------------------------------------------------------------------
drop policy if exists "Inviter can create shares" on public.task_shares;
create policy "Inviter can create shares"
  on public.task_shares
  for insert
  with check (
    auth.uid() = inviter_id
    and exists (
      select 1 from public.tasks t
      where t.id = source_task_id and t.user_id = auth.uid()
    )
  );

create or replace function public.task_shares_guard_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if public.is_end_user_role() then
    if new.source_task_id is distinct from old.source_task_id
       or new.inviter_id is distinct from old.inviter_id
       or new.invitee_id is distinct from old.invitee_id then
      raise exception 'share task and parties are immutable'
        using errcode = 'insufficient_privilege';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists task_shares_guard_identity on public.task_shares;
create trigger task_shares_guard_identity
  before update on public.task_shares
  for each row execute function public.task_shares_guard_identity();
