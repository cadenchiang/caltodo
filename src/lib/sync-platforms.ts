/**
 * Parsing the optional platform filter a sync request can carry.
 *
 * The filter used to be a literal set in the route that stopped at
 * Brightspace, so a post-setup sync for Blackboard or Classroom was filtered
 * down to nothing and hit the "sync nothing" short circuit: the integration
 * connected and never synced, with no error anywhere (audit H10). The set now
 * derives from the engine's own platform list so a new platform cannot be
 * left out again.
 */

import type { SyncPlatform } from "@/lib/sync-engine";
import type { SyncResult, SyncSourceResult } from "@/lib/types";

/** Every platform the sync engine knows how to run. */
export const SYNC_PLATFORMS: readonly SyncPlatform[] = [
  "canvas",
  "gradescope",
  "pensieve",
  "brightspace",
  "blackboard",
  "classroom",
];

const VALID = new Set<string>(SYNC_PLATFORMS);

/** Outcome of reading the `platforms` field off a request body. */
export type PlatformFilter =
  /** No filter was sent: sync everything. */
  | { kind: "all" }
  /** A filter was sent but named nothing valid: sync nothing. */
  | { kind: "none" }
  /** A filter naming at least one known platform. */
  | { kind: "some"; platforms: SyncPlatform[] };

/**
 * Reads the platform filter from a request body.
 *
 * @param raw - The body's `platforms` value, of any shape.
 * @returns "all" when absent, "none" when present but empty or entirely
 *          unknown, else the known platforms in request order.
 * @remarks An explicit filter that names nothing valid must not fall through
 *          to a full sync: the engine treats an empty list as "all", and a
 *          full sync includes a Gradescope login the caller never asked for.
 */
export function parsePlatformFilter(raw: unknown): PlatformFilter {
  if (!Array.isArray(raw)) return { kind: "all" };
  const platforms = raw.filter((p): p is SyncPlatform => typeof p === "string" && VALID.has(p));
  if (platforms.length === 0) return { kind: "none" };
  return { kind: "some", platforms };
}

/**
 * A sync result in which nothing ran.
 *
 * @param lastSyncedAt - ISO timestamp to report.
 * @returns One empty entry per platform, so clients reading any source's
 *          `errors` never hit an undefined key.
 */
export function emptySyncResult(lastSyncedAt: string): SyncResult {
  const empty = (): SyncSourceResult => ({ synced: 0, errors: [] });
  return {
    canvas: empty(),
    gradescope: empty(),
    pensieve: empty(),
    brightspace: empty(),
    blackboard: empty(),
    classroom: empty(),
    last_synced_at: lastSyncedAt,
  };
}
