-- Persistent failure flags for the calendar-feed integrations that previously
-- had none: Pensieve, Brightspace, and the Canvas iCal-feed path. Before this,
-- a broken feed (e.g. Pensieve returning 404, or an iCal URL that was reset)
-- was only surfaced in the in-session sync result — so it vanished on reload,
-- never showed on a cold load, and never reflected a failure that happened on a
-- background/cron sync or another device. These flags let the in-app health
-- banner read the broken state straight from the DB, exactly like
-- canvas_auth_failed / gradescope_auth_failed / google_auth_failed already do.
--
-- Set when the corresponding feed fetch throws, cleared on a successful sync or
-- when the user saves a new URL. Non-destructive additive columns.
ALTER TABLE public.integration_credentials
  ADD COLUMN IF NOT EXISTS pensieve_auth_failed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS brightspace_auth_failed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS canvas_ical_failed BOOLEAN NOT NULL DEFAULT false;
