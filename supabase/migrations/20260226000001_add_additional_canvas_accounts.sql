-- Add JSONB column for storing additional Canvas accounts beyond the primary bCourses integration.
-- Each entry contains: id, label, base_url, token, token_created_at, selected_courses.
ALTER TABLE integration_credentials
  ADD COLUMN IF NOT EXISTS additional_canvas_accounts jsonb NOT NULL DEFAULT '[]'::jsonb;
