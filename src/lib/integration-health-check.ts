/**
 * Fleet-wide integration health check.
 *
 * The per-user alerting in integration-alerts.ts answers "did THIS sync
 * fail?". It cannot answer "has this integration been dead for everyone since
 * Tuesday?" — and that is the failure that actually hurt: on 2026-07-21 the
 * Gradescope cooldown claim started erroring, every auto-sync stopped, and
 * nobody noticed for five days. The per-user emails were throttled to one per
 * (user, source, error) per 6h and read like isolated blips.
 *
 * This module looks at the aggregate instead: for each integration, how long
 * has it been since ANY user synced successfully, measured against how many
 * users have it connected. A connected integration that has produced zero
 * successful syncs across the whole user base for a day is broken, whatever
 * the individual error messages say.
 *
 * @module integration-health-check
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/** How long an integration may go fleet-wide silent before it's suspicious. */
export const SILENCE_THRESHOLD_HOURS = 24;

/**
 * Minimum users who ACTUALLY RAN a sync in the window before silence means
 * anything.
 *
 * Counting connected users instead was the obvious first cut and it is wrong:
 * checked against prod on 2026-07-27, Gradescope had 224 connected accounts
 * but only 4 users opened the app all day, 2 of them with Gradescope. Over
 * summer that gap is the norm, so a connected-user threshold would have fired
 * every single morning regardless of health — and an alert that cries wolf
 * daily is worse than no alert, because it trains you to ignore the one that
 * matters. Zero successes only means something when syncs were attempted.
 */
export const MIN_ACTIVE_USERS = 3;

/** Per-integration health summary. */
export interface IntegrationHealth {
  /** Integration key, e.g. "gradescope". */
  source: string;
  /** How many users have credentials for it. */
  connected: number;
  /** How many of those actually ran a sync inside the window. */
  active: number;
  /** Most recent successful sync across all users, or null if never. */
  lastSuccessAt: string | null;
  /** Hours since that success; null when it has never succeeded. */
  hoursSinceSuccess: number | null;
  /** True when this looks fleet-wide broken. */
  unhealthy: boolean;
}

/**
 * Describes how to measure one integration: which column proves a user has
 * connected it, and which column records a successful sync.
 */
interface Probe {
  source: string;
  /** Column that is non-null when the integration is connected. */
  connectedColumn: string;
  /** Column holding the last successful sync timestamp. */
  successColumn: string;
}

/**
 * Gradescope is the only integration with a dedicated success timestamp
 * today. Canvas/Pensieve/Brightspace record failure flags but not a last-ok
 * time, so they cannot be measured this way yet — adding a
 * last_<source>_synced_at column would extend this check to them for free.
 */
const PROBES: Probe[] = [
  {
    source: "gradescope",
    connectedColumn: "gradescope_email",
    successColumn: "last_gradescope_synced_at",
  },
];

/**
 * Counts rows matching a non-null filter without transferring them.
 *
 * @param supabase - Admin Supabase client
 * @param column - Column that must be non-null
 * @returns Row count, or 0 when the query fails
 */
async function countConnected(supabase: SupabaseClient, column: string): Promise<number> {
  const { count, error } = await supabase
    .from("integration_credentials")
    .select("user_id", { count: "exact", head: true })
    .not(column, "is", null);
  return error ? 0 : (count ?? 0);
}

/**
 * Counts users who have the integration connected AND ran a sync inside the
 * window. This is the denominator that makes "zero successes" meaningful.
 *
 * @param supabase - Admin Supabase client
 * @param column - Column that is non-null when the integration is connected
 * @param since - Start of the window
 * @returns Row count, or 0 when the query fails
 */
async function countActive(
  supabase: SupabaseClient,
  column: string,
  since: Date
): Promise<number> {
  const { count, error } = await supabase
    .from("integration_credentials")
    .select("user_id", { count: "exact", head: true })
    .not(column, "is", null)
    .gte("last_synced_at", since.toISOString());
  return error ? 0 : (count ?? 0);
}

/**
 * Reads the most recent successful sync timestamp across all users.
 *
 * @param supabase - Admin Supabase client
 * @param column - Timestamp column to take the max of
 * @returns ISO timestamp, or null when no user has ever succeeded
 */
async function latestSuccess(
  supabase: SupabaseClient,
  column: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("integration_credentials")
    .select(column)
    .not(column, "is", null)
    .order(column, { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  const value = (data as unknown as Record<string, unknown>)[column];
  return typeof value === "string" ? value : null;
}

/**
 * Evaluates every probe and returns a health summary per integration.
 *
 * @param supabase - Admin Supabase client (bypasses RLS to see all users)
 * @param now - Current time; injectable for tests
 * @returns One entry per probed integration
 */
export async function checkIntegrationHealth(
  supabase: SupabaseClient,
  now: Date = new Date()
): Promise<IntegrationHealth[]> {
  const results: IntegrationHealth[] = [];

  const windowStart = new Date(now.getTime() - SILENCE_THRESHOLD_HOURS * 60 * 60 * 1000);

  for (const probe of PROBES) {
    const [connected, active, lastSuccessAt] = await Promise.all([
      countConnected(supabase, probe.connectedColumn),
      countActive(supabase, probe.connectedColumn, windowStart),
      latestSuccess(supabase, probe.successColumn),
    ]);

    const parsed = lastSuccessAt ? new Date(lastSuccessAt).getTime() : NaN;
    const hoursSinceSuccess = Number.isNaN(parsed)
      ? null
      : (now.getTime() - parsed) / (60 * 60 * 1000);

    // Enough users tried, and not one of them succeeded. Never-succeeded
    // counts as unhealthy too, under the same "somebody actually tried" gate.
    const unhealthy =
      active >= MIN_ACTIVE_USERS &&
      (hoursSinceSuccess === null || hoursSinceSuccess >= SILENCE_THRESHOLD_HOURS);

    results.push({
      source: probe.source,
      connected,
      active,
      lastSuccessAt,
      hoursSinceSuccess,
      unhealthy,
    });
  }

  return results;
}

/**
 * Renders an alert email body for the unhealthy integrations.
 *
 * @param unhealthy - Entries whose `unhealthy` flag is set
 * @returns Plain-text email body
 */
export function formatHealthAlert(unhealthy: IntegrationHealth[]): string {
  const lines = unhealthy.map((h) => {
    const since =
      h.hoursSinceSuccess === null
        ? "never succeeded"
        : `${h.hoursSinceSuccess.toFixed(1)}h since the last success (${h.lastSuccessAt})`;
    return `- ${h.source}: ${h.active} of ${h.connected} connected users ran a sync, ${since}`;
  });

  return [
    `${MIN_ACTIVE_USERS}+ users ran a sync in the last ${SILENCE_THRESHOLD_HOURS}h and not one`,
    "of them synced this integration successfully. That is a fleet-wide",
    "outage, not a per-user problem.",
    "",
    ...lines,
    "",
    "Check the server logs for the sync path and the Supabase Postgres logs",
    "for failing statements.",
  ].join("\n");
}
