-- Backfill completed_at on tasks that are complete but never got a timestamp.
--
-- Found during the 2026-07-28 audit: prod held 44 rows with
-- is_completed = true and completed_at IS NULL, spread over 17 users and
-- five months, 41 of them synced assignments.
--
-- This is not cosmetic. The nightly archive purge in cron/push-reminders
-- deletes completed tasks via `completed_at < cutoff`, so a NULL timestamp is
-- invisible to that predicate and the row is retained forever. The same rows
-- also drive the 30-day indicator in the Archive section of the UI.
--
-- updated_at is the closest available proxy for when completion happened:
-- toggling completion writes it, so it is at worst an overestimate of the
-- task's age, which fails safe (the purge waits longer rather than deleting
-- something early).
--
-- The write path that allowed this is fixed alongside in
-- PATCH /api/mobile/tasks/:taskId, which now derives completed_at from
-- is_completed instead of trusting the client to send both.
UPDATE public.tasks
   SET completed_at = updated_at
 WHERE is_completed = true
   AND completed_at IS NULL;
