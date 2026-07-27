/**
 * Gradescope login-cooldown claim.
 *
 * Gradescope authenticates with a password, not a token, and its anti-abuse
 * system reacts to frequent programmatic logins by locking the account and
 * sending password-reset emails — which kills sync for the rest of the
 * semester. So before an auto-sync logs in, it must CLAIM a cooldown window:
 * advance last_gradescope_synced_at only if it is null or older than the
 * cooldown, and skip the sync entirely if another sync (another tab, another
 * device, the on-focus handler) claimed it first.
 *
 * The claim gates the whole integration, which makes its failure mode the
 * thing to design around. On 2026-07-27 the single conditional-UPDATE that
 * implemented it started erroring in production with "column
 * integration_credentials.last_gradescope_synced_at does not exist" — for a
 * column that demonstrably exists and had been written through 2026-07-21.
 * One broken query took Gradescope sync down for every user, silently, for
 * five days.
 *
 * This module therefore tries three mechanisms in order of preference and
 * only gives up if all of them fail:
 *
 *   1. claim_gradescope_sync() RPC — atomic, plain SQL, no client-side filter
 *      serialization in the path. The preferred route.
 *   2. The original PostgREST conditional UPDATE — still atomic, used when
 *      the function is not deployed yet (so this file is safe to ship ahead
 *      of its migration).
 *   3. Read-then-write — read the timestamp, compare in JS, then write it.
 *      NOT atomic: two syncs racing inside the same few milliseconds can both
 *      claim. That race is exactly what mechanism 1 exists to prevent, so
 *      this is strictly a last resort, reported as `degraded` for the caller
 *      to log loudly. It still enforces the cooldown itself, which is the
 *      part that protects the account; the window it leaves open is
 *      milliseconds wide versus the total outage it replaces.
 *
 * @module gradescope-cooldown
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

/** Outcome of attempting to claim a cooldown window. */
export interface ClaimResult {
  /** True when this caller owns the window and may log in to Gradescope. */
  claimed: boolean;
  /**
   * True when the claim succeeded only via the non-atomic fallback, so a
   * concurrent sync could in principle have claimed the same window.
   */
  degraded: boolean;
  /**
   * Set when NO mechanism worked. The caller should treat this as a sync
   * error; `claimed` is false, so no login is attempted.
   */
  error?: string;
}

/**
 * Claims a Gradescope login cooldown window for a user.
 *
 * @param supabase - Supabase client (user-scoped; RLS applies)
 * @param userId - The user whose window is being claimed
 * @param cooldownMs - Minimum gap between login attempts, in milliseconds
 * @returns Whether the window was claimed, and how
 */
export async function claimGradescopeCooldown(
  supabase: SupabaseClient,
  userId: string,
  cooldownMs: number
): Promise<ClaimResult> {
  const cooldownSeconds = Math.round(cooldownMs / 1000);

  // 1. Atomic claim inside the database. Wrapped in try/catch, not just a
  // rejection handler: .rpc() can also throw synchronously (an older client,
  // a transport failure), and every one of those cases means "this mechanism
  // is unavailable", not "the sync failed".
  let rpcError: string | null = null;
  try {
    const rpc = await supabase.rpc("claim_gradescope_sync", {
      p_user_id: userId,
      p_cooldown_seconds: cooldownSeconds,
    });
    if (!rpc.error) {
      return { claimed: rpc.data === true, degraded: false };
    }
    rpcError = rpc.error.message;
  } catch (err) {
    rpcError = err instanceof Error ? err.message : String(err);
  }

  logger.warn("gradescope cooldown: RPC claim unavailable, falling back", {
    userId,
    error: rpcError,
  });

  // 2. The original conditional UPDATE. Still atomic.
  const cutoff = new Date(Date.now() - cooldownMs).toISOString();
  const conditional = await supabase
    .from("integration_credentials")
    .update({ last_gradescope_synced_at: new Date().toISOString() })
    .eq("user_id", userId)
    .or(`last_gradescope_synced_at.is.null,last_gradescope_synced_at.lt.${cutoff}`)
    .select("user_id");

  if (!conditional.error) {
    return { claimed: (conditional.data?.length ?? 0) > 0, degraded: false };
  }

  logger.error("gradescope cooldown: conditional claim failed, degrading", {
    userId,
    error: conditional.error.message,
  });

  // 3. Read-then-write. Non-atomic, but keeps the integration alive.
  const read = await supabase
    .from("integration_credentials")
    .select("last_gradescope_synced_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (read.error) {
    return {
      claimed: false,
      degraded: true,
      error: `Could not claim the Gradescope sync window: ${read.error.message}`,
    };
  }

  const last = read.data?.last_gradescope_synced_at
    ? new Date(read.data.last_gradescope_synced_at as string).getTime()
    : null;
  if (last !== null && !Number.isNaN(last) && Date.now() - last < cooldownMs) {
    return { claimed: false, degraded: true };
  }

  // Write before logging in, so a failed login still holds the cooldown and
  // we never hammer Gradescope on repeated failures.
  const write = await supabase
    .from("integration_credentials")
    .update({ last_gradescope_synced_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (write.error) {
    return {
      claimed: false,
      degraded: true,
      error: `Could not claim the Gradescope sync window: ${write.error.message}`,
    };
  }

  return { claimed: true, degraded: true };
}
