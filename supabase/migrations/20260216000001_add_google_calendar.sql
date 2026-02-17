-- Add Google Calendar OAuth token storage to integration_credentials
-- and google_event_id to tasks for two-way event mapping.

ALTER TABLE public.integration_credentials
  ADD COLUMN google_access_token_encrypted TEXT DEFAULT NULL,
  ADD COLUMN google_refresh_token_encrypted TEXT DEFAULT NULL,
  ADD COLUMN google_token_expires_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE public.tasks
  ADD COLUMN google_event_id TEXT DEFAULT NULL;

CREATE INDEX idx_tasks_google_event_id ON public.tasks(google_event_id)
  WHERE google_event_id IS NOT NULL;
