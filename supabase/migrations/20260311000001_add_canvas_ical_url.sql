-- Add canvas_ical_url column for iCal feed-based Canvas sync.
-- Users who set this URL will sync via iCal instead of API token.
ALTER TABLE integration_credentials
  ADD COLUMN IF NOT EXISTS canvas_ical_url TEXT DEFAULT NULL;
