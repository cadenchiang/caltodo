-- Adds columns for Google Calendar incremental sync and push notification channels.
-- gcal_sync_token: nextSyncToken from last events.list() for delta fetching
-- gcal_channel_*: push notification channel metadata for webhook-based sync
-- gcal_last_full_sync_at: timestamp of last full sync for periodic fallback
-- gcal_events_updated_at: updated by webhook to signal client-side revalidation

ALTER TABLE public.integration_credentials
  ADD COLUMN IF NOT EXISTS gcal_sync_token TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS gcal_last_full_sync_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS gcal_channel_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS gcal_channel_resource_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS gcal_channel_expiration TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS gcal_events_updated_at TIMESTAMPTZ DEFAULT NULL;
