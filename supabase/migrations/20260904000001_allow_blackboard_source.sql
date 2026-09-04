-- Allow source = 'blackboard' on tasks.
--
-- Blackboard shipped on 2026-08-31 (20260831000003) and sync-engine.ts has
-- written source = 'blackboard' ever since, but the check constraint was never
-- widened to accept it. Every Blackboard upsert therefore violated the
-- constraint, which surfaced only as "1 of 1 blackboard upsert batches failed"
-- in the sync-failure alert email, and the source has zero rows in production.
--
-- This is the second time: 20260827000001 repaired the identical omission for
-- 'brightspace'. sync-engine-sources.test.ts now pins this list against the
-- sources upsertAssignments accepts so a third one cannot ship.

ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_source_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_source_check
  CHECK (source IN ('canvas', 'gradescope', 'pensieve', 'syllabus', 'brightspace', 'classroom', 'blackboard'));
