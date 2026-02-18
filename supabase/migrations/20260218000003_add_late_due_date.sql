-- Add late_due_date column to tasks table.
-- Stores the late submission deadline as "YYYY-MM-DD" text (Gradescope only).
-- NULL means no late due date or not applicable.
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS late_due_date TEXT DEFAULT NULL;
