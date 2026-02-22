-- Add snoozed_until column for temporary task hiding (snooze).
-- NULL means visible; a future timestamp means hidden until that time.
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS snoozed_until TIMESTAMPTZ DEFAULT NULL;
