-- Separate the Gradescope cooldown claim from the last-success timestamp.
--
-- claim_gradescope_sync() advanced last_gradescope_synced_at BEFORE logging
-- in, so the column meant "last login attempt", not "last successful sync":
--   * a failed login held the 30-minute cooldown, so a student who fixed
--     their password saw "All tasks are up to date" for half an hour
--     (audit H9), and
--   * the fleet health check reads last_gradescope_synced_at as proof of a
--     successful sync, so a fleet-wide login outage looked healthy as long
--     as syncs kept being attempted (audit M8).
--
-- The claim now lives in gradescope_claim_at. last_gradescope_synced_at is
-- written only after a successful fetch (see sync-engine.ts), and the claim
-- is released (set back to NULL) when the login itself fails so the next
-- sync can retry with corrected credentials. Non-login failures keep the
-- claim, preserving the anti-abuse intent for auto-syncs.

ALTER TABLE public.integration_credentials
  ADD COLUMN IF NOT EXISTS gradescope_claim_at TIMESTAMPTZ;

-- Seed the claim from the old combined column so existing users do not all
-- log in at once the moment this deploys.
UPDATE public.integration_credentials
   SET gradescope_claim_at = last_gradescope_synced_at
 WHERE gradescope_claim_at IS NULL
   AND last_gradescope_synced_at IS NOT NULL;

-- Same contract as 20260727000001 (SECURITY INVOKER so RLS still scopes the
-- update to the caller's own row), but on the claim column.
CREATE OR REPLACE FUNCTION public.claim_gradescope_sync(
  p_user_id uuid,
  p_cooldown_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_claimed boolean;
BEGIN
  UPDATE public.integration_credentials
     SET gradescope_claim_at = now()
   WHERE user_id = p_user_id
     AND (
       gradescope_claim_at IS NULL
       OR gradescope_claim_at < now() - make_interval(secs => p_cooldown_seconds)
     )
  RETURNING true INTO v_claimed;

  -- No row matched: another sync holds the window, or we are still cooling
  -- down. RETURNING leaves v_claimed NULL in that case.
  RETURN coalesce(v_claimed, false);
END;
$$;

REVOKE ALL ON FUNCTION public.claim_gradescope_sync(uuid, integer) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.claim_gradescope_sync(uuid, integer) TO authenticated, service_role;
