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
 * Minimum connected users before silence means anything. With only a handful
 * of accounts a quiet day is ordinary; the signal needs a population.
 */
export const MIN_CONNECTED_USERS = 10;

/** Per-integration health summary. */
export interface IntegrationHealth {
  /** Integration key, e.g. "gradescope". */
  source: string;
  /** How many users have credentials for it. */
  connected: number;
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

  for (const probe of PROBES) {
    const [connected, lastSuccessAt] = await Promise.all([
      countConnected(supabase, probe.connectedColumn),
      latestSuccess(supabase, probe.successColumn),
    ]);

    const parsed = lastSuccessAt ? new Date(lastSuccessAt).getTime() : NaN;
    const hoursSinceSuccess = Number.isNaN(parsed)
      ? null
      : (now.getTime() - parsed) / (60 * 60 * 1000);

    // Never-succeeded counts as unhealthy too, but only once enough users
    // have connected that we'd expect to have seen one.
    const unhealthy =
      connected >= MIN_CONNECTED_USERS &&
      (hoursSinceSuccess === null || hoursSinceSuccess >= SILENCE_THRESHOLD_HOURS);

    results.push({
      source: probe.source,
      connected,
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
    return `- ${h.source}: ${h.connected} users connected, ${since}`;
  });

  return [
    "One or more integrations have produced no successful syncs across the",
    `entire user base for ${SILENCE_THRESHOLD_HOURS}+ hours. That is a fleet-wide`,
    "outage, not a per-user problem.",
    "",
    ...lines,
    "",
    "Check the server logs for the sync path and the Supabase Postgres logs",
    "for failing statements.",
  ].join("\n");
}
