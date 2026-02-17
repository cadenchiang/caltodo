-- Create contact_messages table for storing user contact form submissions.
-- Messages are viewable in the Supabase dashboard.
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  email text,
  message text not null,
  created_at timestamptz not null default now()
);

-- RLS: users can only insert their own messages
alter table public.contact_messages enable row level security;

create policy "Users can insert own contact messages"
  on public.contact_messages
  for insert
  with check (auth.uid() = user_id);

-- Index for admin viewing
create index idx_contact_messages_created_at on public.contact_messages(created_at desc);
