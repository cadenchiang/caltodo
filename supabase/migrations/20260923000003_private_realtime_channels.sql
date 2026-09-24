-- Private Realtime channels for the chat (audit H4, C2).
--
-- Presence and typing channels were public: anyone could watch who is
-- typing in any course, and the message channel used postgres_changes,
-- which delivers the raw row (author_id included). The chat now uses
-- private topics, which Realtime authorizes against RLS on
-- realtime.messages:
--
--   room:<course_id>    presence ("N here")
--   typing:<course_id>  typing presence
--   chat:<course_id>    message broadcasts (sent by a trigger, see
--                       20260923000005, with safe columns only)
--
-- A user may join or send on a topic only for a course they are a live
-- member of (get_my_course_ids() already filters deleted_at).
--
-- Deploy order: apply this before the code that sets `private: true` on
-- the channels, or those subscriptions are refused. The code tolerates
-- the reverse only in that it fails closed (no presence, no typing).

-- realtime.messages already has row level security enabled on Supabase
-- (Realtime authorization depends on it) and the postgres role does not own
-- the table, so only the policies are created here.

-- Course id parsed out of the topic, or NULL for a topic the chat does not own.
create or replace function public.chat_topic_course_id(topic text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
declare
  prefix text := split_part(topic, ':', 1);
  rest text := substr(topic, length(prefix) + 2);
begin
  if prefix not in ('room', 'typing', 'chat') then
    return null;
  end if;
  return rest::uuid;
exception when others then
  return null;
end;
$$;

drop policy if exists "chat members can receive room events" on realtime.messages;
create policy "chat members can receive room events"
  on realtime.messages
  for select
  to authenticated
  using (
    public.chat_topic_course_id(realtime.topic()) in (select public.get_my_course_ids())
  );

drop policy if exists "chat members can send room events" on realtime.messages;
create policy "chat members can send room events"
  on realtime.messages
  for insert
  to authenticated
  with check (
    public.chat_topic_course_id(realtime.topic()) in (select public.get_my_course_ids())
    -- Message rows come from the server-side trigger, never from a client.
    and (realtime.messages.extension <> 'broadcast' or split_part(realtime.topic(), ':', 1) <> 'chat')
  );
