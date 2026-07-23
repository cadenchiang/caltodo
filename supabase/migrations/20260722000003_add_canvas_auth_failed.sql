-- Persistent flag for a genuine Canvas auth failure (the API returned 401 /
-- invalid token), as opposed to the time-based canvas_token_expired heuristic
-- (which only fires after the ~120-day lifespan and can't catch a token that
-- was revoked or regenerated early). Set when a token sync 401s, cleared on a
-- successful token sync or when the user saves a new token. Mirrors
-- gradescope_auth_failed / google_auth_failed. Non-destructive additive column.
ALTER TABLE public.integration_credentials
  ADD COLUMN IF NOT EXISTS canvas_auth_failed BOOLEAN NOT NULL DEFAULT false;
