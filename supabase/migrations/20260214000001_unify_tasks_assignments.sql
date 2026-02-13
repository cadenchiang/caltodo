-- Migration: Unify tasks and assignments into a single table.
-- Adds assignment-related columns to the tasks table so synced
-- assignments from Canvas/Gradescope live alongside manual tasks.

ALTER TABLE public.tasks
  ADD COLUMN source TEXT DEFAULT NULL CHECK (source IN ('canvas', 'gradescope')),
  ADD COLUMN external_id TEXT DEFAULT NULL,
  ADD COLUMN course_name TEXT DEFAULT NULL,
  ADD COLUMN source_url TEXT DEFAULT NULL,
  ADD COLUMN points_possible NUMERIC DEFAULT NULL;

-- Prevent duplicate synced assignments per user+source combination.
-- Only applies to rows where source is not null (manual tasks are unaffected).
CREATE UNIQUE INDEX idx_tasks_source_dedup
  ON public.tasks(user_id, source, external_id) WHERE source IS NOT NULL;
