/**
 * Determines a user's post-login landing path based on which sidebar
 * nav items they have hidden.
 *
 * Pure / dependency-free so both edge runtime middleware and node-runtime
 * route handlers can import it.
 *
 * @module landing-path
 */

/**
 * Order matches the sidebar's NAV_ITEMS order. The first href the user
 * has NOT hidden becomes their landing page.
 */
const NAV_HREFS_IN_ORDER = [
  "/app/home",
  "/app/inbox",
  "/app/calendar",
  "/app/notes",
  "/app/discussions",
] as const;

/** Last-resort destination if every nav item has somehow been hidden. */
const FALLBACK_LANDING = "/app/inbox";

/**
 * Picks the post-login landing path, respecting the user's hidden nav
 * preferences stored in auth.user_metadata.hidden_nav_items.
 *
 * @param userMetadata - The Supabase user_metadata object
 * @returns First non-hidden nav href, or FALLBACK_LANDING
 */
export function pickLandingPath(userMetadata: unknown): string {
  const raw = (userMetadata as { hidden_nav_items?: unknown } | null)?.hidden_nav_items;
  const hidden = new Set(
    Array.isArray(raw) ? raw.filter((v): v is string => typeof v === "string") : []
  );
  for (const href of NAV_HREFS_IN_ORDER) {
    if (!hidden.has(href)) return href;
  }
  return FALLBACK_LANDING;
}
