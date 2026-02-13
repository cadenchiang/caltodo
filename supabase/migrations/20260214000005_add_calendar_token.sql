-- Add calendar_token column to integration_credentials for iCal feed authentication.
-- The token allows unauthenticated GET requests to the feed endpoint (e.g., from Google Calendar).
-- A unique partial index ensures no two users share the same token.

ALTER TABLE public.integration_credentials
  ADD COLUMN calendar_token TEXT;

CREATE UNIQUE INDEX idx_integration_credentials_calendar_token
  ON public.integration_credentials (calendar_token)
  WHERE calendar_token IS NOT NULL;
