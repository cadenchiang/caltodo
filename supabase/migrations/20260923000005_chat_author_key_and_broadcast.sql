-- Server-side author keys, client nonces, and safe realtime (audit C2).
--
-- Anonymous messages were de-anonymizable three ways: the SELECT policy
-- exposed author_id, postgres_changes delivered the raw row, and the
-- obfuscation was an unkeyed hash shipped to the browser. This migration:
--
--   1. adds chat_messages.author_key, a keyed HMAC of (author_id, course_id)
--      that clients group by instead of author_id, and backfills it;
--   2. adds chat_messages.client_nonce so the optimistic bubble is matched
--      to the server row by nonce instead of by author;
--   3. revokes SELECT on author_id from end-user roles (column privilege)
--      so a browser `select *` fails instead of leaking;
--   4. replaces postgres_changes with a trigger that broadcasts only safe
--      columns on the private topic chat:<course_id>;
--   5. recomputes author_key inside the guard trigger for end-user inserts
--      so a direct PostgREST insert cannot forge a key.
--
-- SECRET: the API computes keys with CHAT_AUTHOR_SECRET (Node HMAC-SHA256,
-- hex). The database uses the setting app.settings.chat_author_secret.
-- Set both to the same value BEFORE applying this migration:
--   alter database postgres set app.settings.chat_author_secret = '<value>';
-- Without it, both sides fall back to the documented development default
-- and old messages get keys the production API does not produce (the same
-- anonymous author then shows as two numbers across the migration).
--
-- Deploy order: apply this migration first, then deploy the code. The old
-- code keeps working on the new schema (it never selected author_key and
-- author_id stays readable through the service role); the new code fails
-- on the old schema (author_key does not exist).

create extension if not exists pgcrypto with schema extensions;

-- 1 + 5. Key function shared by the backfill and the guard trigger.
create or replace function public.chat_author_key(p_author_id uuid, p_course_id uuid)
returns text
language sql
stable
set search_path = ''
as $$
  select encode(
    extensions.hmac(
      convert_to(p_author_id::text || ':' || p_course_id::text, 'utf8'),
      convert_to(coalesce(nullif(current_setting('app.settings.chat_author_secret', true), ''), 'caltodo-dev-chat-author-secret'), 'utf8'),
      'sha256'
    ),
    'hex'
  );
$$;

alter table public.chat_messages add column if not exists author_key text;
alter table public.chat_messages add column if not exists client_nonce text;

update public.chat_messages
set author_key = public.chat_author_key(author_id, course_id)
where author_key is null;

alter table public.chat_messages alter column author_key set not null;
create index if not exists idx_chat_messages_author_key on public.chat_messages (course_id, author_key);

-- 5. Guard: end-user inserts get their key computed here, never trusted.
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
       or new.reply_to_id is distinct from old.reply_to_id
       or new.author_key is distinct from old.author_key then
      raise exception 'message course, author and reply target are immutable'
        using errcode = 'insufficient_privilege';
    end if;
    if (new.author_name is null) <> (old.author_name is null) then
      raise exception 'message anonymity cannot be changed'
        using errcode = 'insufficient_privilege';
    end if;
    return new;
  end if;

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

  new.author_key := public.chat_author_key(new.author_id, new.course_id);

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

-- 3. Column privilege: end users may read every column except author_id.
revoke select on public.chat_messages from authenticated, anon;
grant select (id, course_id, author_key, author_name, author_avatar, body, created_at, updated_at, reply_to_id, client_nonce)
  on public.chat_messages to authenticated;

-- 4. Safe realtime: broadcast on the private room topic with safe columns.
create or replace function public.chat_messages_broadcast()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform realtime.send(
      jsonb_build_object(
        'id', new.id,
        'course_id', new.course_id,
        'author_key', new.author_key,
        'author_name', new.author_name,
        'author_avatar', new.author_avatar,
        'body', new.body,
        'created_at', new.created_at,
        'updated_at', new.updated_at,
        'reply_to_id', new.reply_to_id,
        'client_nonce', new.client_nonce
      ),
      'message_inserted',
      'chat:' || new.course_id::text,
      true
    );
    return new;
  end if;

  perform realtime.send(
    jsonb_build_object('id', old.id, 'course_id', old.course_id),
    'message_deleted',
    'chat:' || old.course_id::text,
    true
  );
  return old;
end;
$$;

drop trigger if exists chat_messages_broadcast on public.chat_messages;
create trigger chat_messages_broadcast
  after insert or delete on public.chat_messages
  for each row execute function public.chat_messages_broadcast();

-- postgres_changes on this table delivered author_id; nothing subscribes now.
alter publication supabase_realtime drop table public.chat_messages;
