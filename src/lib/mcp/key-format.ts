/**
 * Human phrasing for MCP key timestamps.
 *
 * Extracted from McpSettings when the key list became its own component and
 * both needed the same wording. Pure functions of a timestamp and the clock,
 * so they are unit-testable without rendering anything.
 *
 * @module mcp/key-format
 */

/** Below this many minutes, an age reads as "just now". */
const JUST_NOW_MINUTES = 1;

/** Beyond this many days, an age is shown as a date instead of a count. */
const AGE_DATE_CUTOFF_DAYS = 30;

/** Beyond this many days, an expiry is shown as a date instead of a count. */
const EXPIRY_DATE_CUTOFF_DAYS = 45;

/**
 * Formats a timestamp as a short relative age.
 *
 * @param iso - ISO timestamp, or null when the event never happened
 * @param fallback - Text to show when iso is null
 * @returns Something like "2h ago", "3d ago", or a date for older stamps
 * @remarks A timestamp in the future yields "just now" rather than a negative
 *          count, which is what a clock skew between server and browser looks
 *          like on a key that was used a moment ago.
 */
export function timeAgo(iso: string | null, fallback: string): string {
  if (!iso) return fallback;

  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < JUST_NOW_MINUTES) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < AGE_DATE_CUTOFF_DAYS) return `${days}d ago`;

  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Describes when a key stops working.
 *
 * @param iso - Expiry timestamp, or null when it never expires
 * @returns A short phrase for the key list
 */
export function expiryLabel(iso: string | null): string {
  if (!iso) return "never expires";
  const ms = Date.parse(iso) - Date.now();
  if (ms <= 0) return "expired";
  const days = Math.ceil(ms / 86_400_000);
  if (days === 1) return "expires tomorrow";
  if (days < EXPIRY_DATE_CUTOFF_DAYS) return `expires in ${days}d`;
  return `expires ${new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

/**
 * The one line under a key's name: when it was last used, and when it lapses.
 *
 * @param lastUsedAt - When the key last authenticated a request, or null
 * @param expiresAt - When the key stops working, or null when it never does
 * @returns A phrase like "used 1h ago · never expires"
 */
export function keyUsageLine(lastUsedAt: string | null, expiresAt: string | null): string {
  return `used ${timeAgo(lastUsedAt, "never")} · ${expiryLabel(expiresAt)}`;
}
