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
 * preferences and Premium entitlement.
 *
 * /app/home is Pro-gated, so dropping a free user there on login lands
 * them on the lock screen — which reads as "the app is broken" on first
 * arrival. Skip it for non-Pro users so they land on the next eligible
 * nav item (inbox by default).
 *
 * @param userMetadata - The Supabase user_metadata object
 * @param isPro        - Whether the user has Pro access. Free users skip
 *                       /app/home. Defaults to false (safer fallback).
 * @returns First eligible nav href, or FALLBACK_LANDING
 */
export function pickLandingPath(userMetadata: unknown, isPro = false): string {
  const raw = (userMetadata as { hidden_nav_items?: unknown } | null)?.hidden_nav_items;
  const hidden = new Set(
    Array.isArray(raw) ? raw.filter((v): v is string => typeof v === "string") : []
  );
  for (const href of NAV_HREFS_IN_ORDER) {
    if (hidden.has(href)) continue;
    if (href === "/app/home" && !isPro) continue;
    return href;
  }
  return FALLBACK_LANDING;
}
