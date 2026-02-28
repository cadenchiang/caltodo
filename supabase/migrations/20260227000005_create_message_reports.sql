-- Stores message report snapshots so reported content survives unsend/deletion.
-- Each row captures the full message body at report time plus reporter metadata.

create table if not exists message_reports (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  author_id uuid not null,
  course_id uuid not null,
  message_body text not null,
  created_at timestamptz not null default now()
);

-- Fast lookup by message (check if a message has been reported before deletion).
create index idx_message_reports_message_id on message_reports(message_id);

-- Fast lookup by reporter (rate-limit enforcement, audit).
create index idx_message_reports_reporter_id on message_reports(reporter_id);

-- RLS: only service role can read/write (admin-only table).
alter table message_reports enable row level security;
