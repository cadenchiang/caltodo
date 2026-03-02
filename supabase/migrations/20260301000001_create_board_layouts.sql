-- Board layouts table: stores per-user dashboard layout as JSONB.
-- One row per user, upserted on conflict (same pattern as integration_credentials).

create table if not exists board_layouts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  layout  jsonb        not null default '{}',
  updated_at timestamptz not null default now()
);

alter table board_layouts enable row level security;

create policy "Users can view own board layout"
  on board_layouts for select using (auth.uid() = user_id);

create policy "Users can insert own board layout"
  on board_layouts for insert with check (auth.uid() = user_id);

create policy "Users can update own board layout"
  on board_layouts for update using (auth.uid() = user_id);
