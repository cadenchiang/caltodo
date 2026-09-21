-- Records when the last Google Calendar push-channel registration failed for
-- a user. The daily gcal-sync cron orders by this column (nulls first) so a
-- user whose watch keeps failing no longer sorts first every run and starves
-- everyone behind them within the cron's time budget (audit M12). Cleared on
-- the next successful registration.

alter table public.integration_credentials
  add column if not exists gcal_watch_failed_at timestamptz;

comment on column public.integration_credentials.gcal_watch_failed_at is
  'When the last events.watch registration failed; null once one succeeds. Cron backoff ordering.';
