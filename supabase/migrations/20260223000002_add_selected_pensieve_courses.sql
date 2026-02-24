-- Add selected_pensieve_courses column to integration_credentials.
-- Stores user's selected Pensieve courses as JSONB array of {id, name} objects.
-- NULL means "sync all courses" (same pattern as Canvas/Gradescope).
ALTER TABLE integration_credentials
  ADD COLUMN IF NOT EXISTS selected_pensieve_courses JSONB DEFAULT NULL;
