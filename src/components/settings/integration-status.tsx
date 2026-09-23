/**
 * The one status badge for integration card headers.
 *
 * "Connected" is decorative and can hide on narrow screens; "Needs
 * reconnecting" is the reason a user opened settings, so it never hides. On
 * narrow screens it collapses to a short danger badge whose accessible name
 * is still the full wording.
 */

import Badge from "@/components/ui/Badge";

/** The one wording for a broken connection, everywhere it appears. */
export const NEEDS_RECONNECT_LABEL = "Needs reconnecting";

/** Short form of NEEDS_RECONNECT_LABEL for narrow screens. */
export const NEEDS_RECONNECT_SHORT = "Reconnect";

/** Wording for a healthy connection. */
export const CONNECTED_LABEL = "Connected";

interface StatusBadgeProps {
  /** True when the connection has failed authentication or lost scope. */
  needsReconnect: boolean;
}

/**
 * Renders the header status for a connected integration.
 *
 * @param needsReconnect - Paints the danger badge instead of the success one
 * @returns A Badge; the danger form is always visible, the success form only
 *          from the sm breakpoint up
 */
export function StatusBadge({ needsReconnect }: StatusBadgeProps) {
  if (needsReconnect) {
    return (
      <>
        <Badge variant="danger" className="hidden sm:inline-flex shrink-0">
          {NEEDS_RECONNECT_LABEL}
        </Badge>
        <Badge variant="danger" className="sm:hidden shrink-0" aria-label={NEEDS_RECONNECT_LABEL}>
          {NEEDS_RECONNECT_SHORT}
        </Badge>
      </>
    );
  }
  return (
    <Badge variant="success" className="hidden sm:inline-flex shrink-0">
      {CONNECTED_LABEL}
    </Badge>
  );
}
