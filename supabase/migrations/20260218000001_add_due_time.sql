-- Add due_time column to tasks table.
-- Stores time as "HH:MM" text (e.g. "23:59"). NULL means no specific time.
-- IF NOT EXISTS makes this safe to run even if the column was added manually.
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS due_time TEXT DEFAULT NULL;
