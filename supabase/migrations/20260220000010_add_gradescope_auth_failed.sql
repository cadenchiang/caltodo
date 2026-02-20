-- Add flag to stop auto-sync retries when Gradescope login fails.
-- Prevents repeated failed login attempts that spam user's inbox with security emails.
ALTER TABLE public.integration_credentials
  ADD COLUMN IF NOT EXISTS gradescope_auth_failed BOOLEAN DEFAULT FALSE;
