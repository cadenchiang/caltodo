-- Track when Gradescope was last synced to enforce a 30-minute cooldown
-- between login attempts. Gradescope uses password-based auth (not tokens),
-- so frequent logins trigger their security system to send password reset emails.
ALTER TABLE public.integration_credentials
  ADD COLUMN IF NOT EXISTS last_gradescope_synced_at TIMESTAMPTZ;
