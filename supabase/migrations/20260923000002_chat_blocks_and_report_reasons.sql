-- Moderation: blocked users, report reasons, one report per user per message.
--
-- chat_blocks: a user hides another user's messages for themselves. The
-- filter is applied client-side (messages from a blocked user are dropped
-- from the list on this device and any other device signed in as the same
-- user, since the list is server-stored). Blocking is private: the blocked
-- user is never told and can still read the room.
--
-- message_reports gains a reason and a unique (message_id, reporter_id)
-- index so the API's dedupe is enforced under a race too.
--
-- Deploy order: apply before the code. The old code never touched these.

create table if not exists public.chat_blocks (
  user_id uuid not null references auth.users(id) on delete cascade,
  blocked_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, blocked_user_id),
  check (user_id <> blocked_user_id)
);

alter table public.chat_blocks enable row level security;

drop policy if exists "users manage their own blocks" on public.chat_blocks;
create policy "users manage their own blocks"
  on public.chat_blocks
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table public.message_reports add column if not exists reason text;

create unique index if not exists idx_message_reports_unique_reporter
  on public.message_reports (message_id, reporter_id);
