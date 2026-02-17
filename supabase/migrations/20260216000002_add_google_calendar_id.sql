-- Store the dedicated "caltodo" calendar ID created on the user's Google account.
ALTER TABLE public.integration_credentials
  ADD COLUMN google_calendar_id TEXT DEFAULT NULL;
