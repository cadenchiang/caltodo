-- Track when a user manually edits the due_date / due_time of a synced task
-- so the sync engine doesn't overwrite their changes on the next sync.
--
-- Cause: Gradescope/Canvas/etc. syncs upsert assignments with the original
-- scraped due date, clobbering any manual edits the user made in caltodo.
-- Context: reported bug — manual date edits reset to scraped date on resync.
-- Impact: user-edited due dates are now preserved across syncs.

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS due_date_manually_edited_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS due_time_manually_edited_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN public.tasks.due_date_manually_edited_at IS
  'Set when user manually edits due_date. Sync engine skips overwriting due_date when this is non-null.';

COMMENT ON COLUMN public.tasks.due_time_manually_edited_at IS
  'Set when user manually edits due_time. Sync engine skips overwriting due_time when this is non-null.';
