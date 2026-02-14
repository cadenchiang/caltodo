-- Add due_time column to tasks table.
-- Stores time as "HH:MM" (24-hour) for sortability.
-- Display layer formats to 12-hour (e.g. "11:59 PM").
ALTER TABLE public.tasks ADD COLUMN due_time TEXT DEFAULT NULL;
