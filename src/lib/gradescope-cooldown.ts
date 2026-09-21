/**
 * Gradescope login-cooldown claim.
 *
 * Gradescope authenticates with a password, not a token, and its anti-abuse
 * system reacts to frequent programmatic logins by locking the account and
 * sending password-reset emails, which kills sync for the rest of the
 * semester. So before an auto-sync logs in, it must CLAIM a cooldown window:
 * advance gradescope_claim_at only if it is null or older than the cooldown,
 * and skip the sync entirely if another sync (another tab, another device,
 * the on-focus handler) claimed it first.
 *
 * The claim is deliberately a separate column from last_gradescope_synced_at.
 * When the two were one column, a failed login held the window for 30
 * minutes (a student who fixed their password saw "up to date" instead of a
 * sync) and the fleet health check, which reads last_gradescope_synced_at as
 * proof of success, could not see a login outage. Now the claim is taken
 * before the login, released again when the login itself fails, and
 * last_gradescope_synced_at is written only after a successful fetch.
 *
 * The claim gates the whole integration, which makes its failure mode the
 * thing to design around. On 2026-07-27 the single conditional-UPDATE that
 * implemented it started erroring in production with "column
 * integration_credentials.last_gradescope_synced_at does not exist", for a
 * column that demonstrably exists and had been written through 2026-07-21.
 * One broken query took Gradescope sync down for every user, silently, for
 * five days.
 *
 * This module therefore tries three mechanisms in order of preference and
 * only gives up if all of them fail:
 *
 *   1. claim_gradescope_sync() RPC: atomic, plain SQL, no client-side filter
 *      serialization in the path. The preferred route.
 *   2. The original PostgREST conditional UPDATE: still atomic, used when
 *      the function is not deployed yet (so this file is safe to ship ahead
 *      of its migration).
 *   3. Read-then-write: read the timestamp, compare in JS, then write it.
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

/** Column holding the cooldown claim (the last login attempt). */
export const CLAIM_COLUMN = "gradescope_claim_at";
/** Column holding the last successful fetch; never written by a claim. */
export const SUCCESS_COLUMN = "last_gradescope_synced_at";

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
    .update({ [CLAIM_COLUMN]: new Date().toISOString() })
    .eq("user_id", userId)
    .or(`${CLAIM_COLUMN}.is.null,${CLAIM_COLUMN}.lt.${cutoff}`)
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
    .select(CLAIM_COLUMN)
    .eq("user_id", userId)
    .maybeSingle();

  if (read.error) {
    return {
      claimed: false,
      degraded: true,
      error: `Could not claim the Gradescope sync window: ${read.error.message}`,
    };
  }

  const stored = (read.data as Record<string, unknown> | null)?.[CLAIM_COLUMN];
  const last = typeof stored === "string" ? new Date(stored).getTime() : null;
  if (last !== null && !Number.isNaN(last) && Date.now() - last < cooldownMs) {
    return { claimed: false, degraded: true };
  }

  // Write before logging in, so a concurrent sync sees the window as held
  // and we never run two logins at once.
  const write = await supabase
    .from("integration_credentials")
    .update({ [CLAIM_COLUMN]: new Date().toISOString() })
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

/**
 * Releases a claimed cooldown window after the login itself failed.
 *
 * Holding the window after a bad-password login served nothing: the auth
 * failure flag already stops auto-syncs from retrying, and the held window
 * only blocked the sync the student runs right after fixing the password.
 *
 * @param supabase - Supabase client (user-scoped; RLS applies)
 * @param userId - The user whose window is being released
 * @returns True when the claim was cleared; false when the write failed
 *          (logged, so the caller need not report it again)
 */
export async function releaseGradescopeCooldown(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("integration_credentials")
    .update({ [CLAIM_COLUMN]: null })
    .eq("user_id", userId);

  if (error) {
    logger.error("gradescope cooldown: release failed", {
      userId,
      cause: error.message,
      impact: "the failed login holds the cooldown; the next auto-sync waits out the window",
    });
    return false;
  }

  logger.info("gradescope cooldown: released after login failure", { userId });
  return true;
}
