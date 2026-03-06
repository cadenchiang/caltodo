-- Add custom_colors and custom_images columns for user-saved appearance options.
alter table notes_folder_settings
  add column if not exists custom_colors jsonb not null default '[]';
alter table notes_folder_settings
  add column if not exists custom_images jsonb not null default '[]';
