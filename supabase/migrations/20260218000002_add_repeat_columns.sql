-- Add repeat columns to tasks table for recurring task support.
-- repeat_interval: how many units between recurrences (e.g. 2 for "every 2 weeks")
-- repeat_unit: the unit of time ("day", "week", or "month")
-- Both must be set together or both null.

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS repeat_interval INT DEFAULT NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS repeat_unit TEXT DEFAULT NULL;

-- Ensure both columns are either set or null together, and values are valid.
ALTER TABLE public.tasks ADD CONSTRAINT chk_repeat_both_or_none
  CHECK (
    (repeat_interval IS NULL AND repeat_unit IS NULL)
    OR (repeat_interval IS NOT NULL AND repeat_unit IS NOT NULL)
  );

ALTER TABLE public.tasks ADD CONSTRAINT chk_repeat_interval_positive
  CHECK (repeat_interval IS NULL OR repeat_interval > 0);

ALTER TABLE public.tasks ADD CONSTRAINT chk_repeat_unit_valid
  CHECK (repeat_unit IS NULL OR repeat_unit IN ('day', 'week', 'month'));
