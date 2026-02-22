ALTER TABLE public.integration_credentials
  ADD COLUMN IF NOT EXISTS pensieve_calendar_url TEXT DEFAULT NULL;
