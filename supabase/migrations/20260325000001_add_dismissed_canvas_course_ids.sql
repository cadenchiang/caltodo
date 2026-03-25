-- Add column to track which new Canvas courses the user has already been prompted about
ALTER TABLE integration_credentials
ADD COLUMN IF NOT EXISTS dismissed_canvas_course_ids jsonb DEFAULT '[]'::jsonb;
