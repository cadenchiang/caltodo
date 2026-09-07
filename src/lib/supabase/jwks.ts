/**
 * The project's JWT public keys, as fetched from
 * <SUPABASE_URL>/auth/v1/.well-known/jwks.json.
 *
 * getClaims() verifies a session's JWT against these. Without a hint, a cold
 * instance first fetches the key set over a fresh TLS connection to Supabase,
 * which is one of the round trips that make the first load after idling
 * slow. Passing them inline skips that fetch on every cold start.
 *
 * Safe to embed: these are public keys, and supabase-js only uses this hint
 * for a matching `kid`. A key it does not recognise - after a rotation - falls
 * through to the live endpoint as before, so a stale copy here degrades to
 * the old behaviour rather than failing. Refresh it when keys rotate:
 *   curl "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/.well-known/jwks.json"
 *
 * @module supabase/jwks
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/** The second argument of `auth.getClaims()`, taken from the client type. */
type GetClaimsOptions = NonNullable<Parameters<SupabaseClient["auth"]["getClaims"]>[1]>;

/** Key set as of 2026-09-07. */
export const SUPABASE_JWKS = {
  "keys": [
    {
      "alg": "ES256",
      "crv": "P-256",
      "ext": true,
      "key_ops": [
        "verify"
      ],
      "kid": "32e4fc0d-265d-42e9-a985-e0ce393d9ecc",
      "kty": "EC",
      "use": "sig",
      "x": "cKEn7EvpIRuVchbebX-FSXFrFjEeSO8-u_Fq1OX_hl4",
      "y": "GCkmhi01ldf5VRJIBaEVb1rjPmkHHmYNxuPMTZB8aAA"
    }
  ]
} as const;

/** Options to pass to `auth.getClaims()` so the hint is used. */
export const GET_CLAIMS_OPTIONS: GetClaimsOptions = {
  jwks: SUPABASE_JWKS as unknown as NonNullable<GetClaimsOptions["jwks"]>,
};
