-- Adds a soft-delete column for synced tasks.
-- When a user dismisses a synced task, dismissed_at is set instead of hard-deleting,
-- so the sync engine's upsert won't resurrect it.
ALTER TABLE public.tasks ADD COLUMN dismissed_at timestamptz DEFAULT NULL;
