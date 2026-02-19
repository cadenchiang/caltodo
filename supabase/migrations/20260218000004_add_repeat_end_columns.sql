-- Add repeat end condition columns to tasks table.
-- repeat_end_date: stop spawning after this date (YYYY-MM-DD format, nullable)
-- repeat_end_count: stop spawning after this many total occurrences (nullable)
-- At most one end condition can be set at a time.

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS repeat_end_date TEXT DEFAULT NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS repeat_end_count INT DEFAULT NULL;

-- End count must be positive if set.
ALTER TABLE public.tasks ADD CONSTRAINT chk_repeat_end_count_positive
  CHECK (repeat_end_count IS NULL OR repeat_end_count > 0);

-- Only one end condition can be active at a time.
ALTER TABLE public.tasks ADD CONSTRAINT chk_repeat_end_exclusive
  CHECK (NOT (repeat_end_date IS NOT NULL AND repeat_end_count IS NOT NULL));
