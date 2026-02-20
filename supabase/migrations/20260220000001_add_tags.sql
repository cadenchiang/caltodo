-- Add tags array to tasks for user-assigned course/label tagging.
-- Non-destructive: nullable column with empty array default. No drops or renames.
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
