/**
 * Optimistic-concurrency version for board layout saves.
 *
 * The version is the server row's `updated_at` as of the client's last
 * read. Every save carries it as `baseUpdatedAt`; the server compares it to
 * the row and refuses (409) a save based on an older read, so a delayed
 * retry can no longer overwrite a newer save from another tab or device.
 *
 * The client half keeps one module-level "last known version" that the
 * fetch, the save response and realtime updates all feed.
 *
 * @module board-layout-version
 */

/** Body field the client adds to a save; stripped before the row is stored. */
export const BASE_UPDATED_AT_FIELD = "baseUpdatedAt";

/** The server `updated_at` the client last saw, or null before any read. */
let knownVersion: string | null = null;

/**
 * Reads the last known server version.
 *
 * @returns The `updated_at` string, or null when nothing has been read yet
 */
export function getKnownLayoutVersion(): string | null {
  return knownVersion;
}

/**
 * Records the server version after a read, a successful save, or a
 * realtime update that was applied locally.
 *
 * @param version - The row's `updated_at`, or null to forget it
 */
export function setKnownLayoutVersion(version: string | null): void {
  knownVersion = version;
}

/**
 * Compares two timestamps as instants, so "…Z" and "…+00:00" spellings of
 * the same moment match.
 *
 * @param a - A timestamp, or nothing
 * @param b - A timestamp, or nothing
 * @returns True when both parse to the same millisecond; false when either
 *          is missing or unparseable
 */
export function isSameLayoutVersion(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  if (!a || !b) return false;
  const ma = new Date(a).getTime();
  const mb = new Date(b).getTime();
  if (Number.isNaN(ma) || Number.isNaN(mb)) return false;
  return ma === mb;
}

/**
 * Attaches the last known version to a save body.
 *
 * @param data - The layout being saved
 * @returns A copy carrying `baseUpdatedAt` (null when nothing was read yet)
 */
export function withLayoutVersion(data: object): Record<string, unknown> {
  return { ...data, [BASE_UPDATED_AT_FIELD]: knownVersion };
}

/**
 * Separates the version from the layout in a save body.
 *
 * @param body - The parsed request body
 * @returns The layout without the version field, and the version the client
 *          based the save on (null when absent or not a string)
 */
export function splitLayoutVersion(body: Record<string, unknown>): {
  layout: Record<string, unknown>;
  baseUpdatedAt: string | null;
} {
  const { [BASE_UPDATED_AT_FIELD]: raw, ...layout } = body;
  return { layout, baseUpdatedAt: typeof raw === "string" ? raw : null };
}
