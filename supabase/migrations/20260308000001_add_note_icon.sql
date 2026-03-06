-- Add optional emoji icon column to notes table.
-- Stores a single emoji string (e.g. "📝") displayed before the note title.
ALTER TABLE public.notes ADD COLUMN icon TEXT DEFAULT NULL;
