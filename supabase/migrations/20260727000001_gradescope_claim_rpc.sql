-- Move the Gradescope cooldown claim into the database.
--
-- The claim was a PostgREST conditional UPDATE built client-side:
--   .update({last_gradescope_synced_at: now}).eq(user_id).or(is.null,lt.cutoff)
-- On 2026-07-27 that call started failing in production with
-- `column integration_credentials.last_gradescope_synced_at does not exist`
-- even though the column is present and had been written continuously
-- through 2026-07-21. The claim gates the whole integration, so every
-- Gradescope auto-sync stopped for every user while the column sat there
-- perfectly readable.
--
-- Whatever the trigger was (PostgREST request shaping / schema-cache state),
-- expressing the claim as plain SQL inside the database removes that layer
-- from the hot path entirely: one statement, atomic by construction, no
-- client-side filter serialization to get wrong.
--
-- SECURITY INVOKER (the default, stated explicitly) so the caller's RLS still
-- applies: `authenticated` can only claim its own row via the
-- "Users can update own credentials" policy, and passing someone else's id
-- matches nothing. search_path is pinned per the convention established in
-- 20260220000002_fix_handle_updated_at_search_path.sql.
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
     SET last_gradescope_synced_at = now()
   WHERE user_id = p_user_id
     AND (
       last_gradescope_synced_at IS NULL
       OR last_gradescope_synced_at < now() - make_interval(secs => p_cooldown_seconds)
     )
  RETURNING true INTO v_claimed;

  -- No row matched: another sync holds the window, or we are still cooling
  -- down. RETURNING leaves v_claimed NULL in that case.
  RETURN coalesce(v_claimed, false);
END;
$$;

REVOKE ALL ON FUNCTION public.claim_gradescope_sync(uuid, integer) FROM public;
GRANT EXECUTE ON FUNCTION public.claim_gradescope_sync(uuid, integer) TO authenticated, service_role;
