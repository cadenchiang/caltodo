-- Allow 'pensieve' as a valid source in the tasks table.
-- The original CHECK constraint only permitted 'canvas' and 'gradescope'.
-- This caused Pensieve assignment upserts to fail silently.

ALTER TABLE public.tasks
  DROP CONSTRAINT IF EXISTS tasks_source_check;

ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_source_check CHECK (source IN ('canvas', 'gradescope', 'pensieve'));
