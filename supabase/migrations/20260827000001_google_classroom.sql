-- Google Classroom integration.
--
-- Also repairs a latent bug: sync-engine.ts has written source = 'brightspace'
-- since the Brightspace integration shipped, but the check constraint was never
-- widened to accept it, so every Brightspace upsert violated the constraint and
-- the source has zero rows in production.

ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_source_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_source_check
  CHECK (source IN ('canvas', 'gradescope', 'pensieve', 'syllabus', 'brightspace', 'classroom'));

-- Courses the user picked to sync, same shape as selected_canvas_courses:
-- [{ "id": "<classroom course id>", "name": "<course name>" }]
-- NULL means "not chosen yet, sync everything"; [] means "sync nothing".
ALTER TABLE public.integration_credentials
  ADD COLUMN IF NOT EXISTS selected_classroom_courses JSONB DEFAULT NULL;

-- Set when Google rejects the Classroom scopes, so the UI can prompt a
-- reconnect. Existing Google Calendar users authorized before Classroom
-- existed and hold tokens without the Classroom scopes.
ALTER TABLE public.integration_credentials
  ADD COLUMN IF NOT EXISTS classroom_auth_failed BOOLEAN NOT NULL DEFAULT false;

-- Whether the user wants Classroom synced at all. Google Calendar and
-- Classroom share one OAuth grant, so connecting Calendar must not silently
-- start pulling coursework.
ALTER TABLE public.integration_credentials
  ADD COLUMN IF NOT EXISTS classroom_enabled BOOLEAN NOT NULL DEFAULT false;
