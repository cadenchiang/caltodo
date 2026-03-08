-- Per-user folder settings (icon, description, appearance) for Notes.
-- One row per user, JSONB blob keyed by folder ID.
create table if not exists notes_folder_settings (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  settings   jsonb        not null default '{}',
  updated_at timestamptz  not null default now()
);

-- RLS
alter table notes_folder_settings enable row level security;

create policy "Users can read own folder settings"
  on notes_folder_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own folder settings"
  on notes_folder_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own folder settings"
  on notes_folder_settings for update
  using (auth.uid() = user_id);

-- Auto-update timestamp
create trigger set_notes_folder_settings_updated_at
  before update on notes_folder_settings
  for each row execute function handle_updated_at();
