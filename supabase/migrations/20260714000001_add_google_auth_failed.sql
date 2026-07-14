-- Track when Google Calendar access has been revoked / the refresh token is
-- no longer valid (Google returns invalid_grant). Mirrors the existing
-- gradescope_auth_failed / canvas_token_expired flags so the settings UI can
-- surface a "reconnect" prompt instead of silently failing to sync.
--
-- Only set true on a genuine revocation (invalid_grant), never on a transient
-- Google 5xx/network error, and reset to false whenever the user reconnects.
ALTER TABLE public.integration_credentials
  ADD COLUMN IF NOT EXISTS google_auth_failed BOOLEAN NOT NULL DEFAULT false;
