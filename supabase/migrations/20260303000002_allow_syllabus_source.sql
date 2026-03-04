-- Add 'syllabus' to the tasks source CHECK constraint
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_source_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_source_check
  CHECK (source IN ('canvas', 'gradescope', 'pensieve', 'syllabus'));
