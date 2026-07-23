-- Distinguish a USER-initiated dismissal/deletion from an AUTO dismissal
-- (dismissMissingTasks marks a synced task gone when it disappears from the
-- source). Both set dismissed_at, so the sync upsert (which clears dismissed_at
-- to revive tasks still present on the source) was resurrecting tasks the user
-- had deliberately deleted while they were still live on Canvas/Gradescope.
--
-- With this flag, the upsert only revives AUTO-dismissed rows and leaves
-- user-deleted rows dismissed. Non-destructive additive column.
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS dismissed_by_user BOOLEAN NOT NULL DEFAULT false;

-- Backfill: any currently-dismissed task predates the flag. Treat existing
-- dismissals as user-initiated so we don't resurrect anything a user hid.
UPDATE public.tasks
  SET dismissed_by_user = true
  WHERE dismissed_at IS NOT NULL AND dismissed_by_user = false;
