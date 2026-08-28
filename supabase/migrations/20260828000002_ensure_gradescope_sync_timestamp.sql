-- Forward-fix for environments that are missing the Gradescope cooldown column.
-- Safe to run multiple times.
ALTER TABLE public.integration_credentials
  ADD COLUMN IF NOT EXISTS last_gradescope_synced_at TIMESTAMPTZ;
