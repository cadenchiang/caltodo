-- Add sort_order column for manual drag-to-reorder.
-- NULL = auto-sort by due_date (default behavior).
-- Integer value = manual position (lower values appear first).
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT NULL;
