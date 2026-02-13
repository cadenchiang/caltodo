-- Add selected_canvas_courses to integration_credentials for course filtering during sync.
-- Stores JSON array of {id, name} objects representing user-selected courses.
ALTER TABLE public.integration_credentials
  ADD COLUMN IF NOT EXISTS selected_canvas_courses JSONB DEFAULT NULL;

-- Add selected_gradescope_courses for Gradescope course filtering during sync.
ALTER TABLE public.integration_credentials
  ADD COLUMN IF NOT EXISTS selected_gradescope_courses JSONB DEFAULT NULL;

-- Add is_submitted to tasks for Canvas submission status tracking.
-- Defaults to false, safe for existing rows.
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS is_submitted BOOLEAN DEFAULT FALSE;
