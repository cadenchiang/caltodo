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
  "/app/discussions",
] as const;

/** Last-resort destination if every nav item has somehow been hidden. */
const FALLBACK_LANDING = "/app/inbox";

/**
 * Routes that don't exist on mobile: the widget board needs a pointer and a
 * wide canvas, and Chat is desktop-only too. Neither is in the mobile tab
 * bar, so landing a phone on one would strand the user (MobileRouteGuard
 * bounces them, but redirecting up front avoids the flash).
 */
const DESKTOP_ONLY_HREFS = new Set<string>(["/app/home", "/app/discussions"]);

/**
 * Picks the post-login landing path, respecting the user's hidden nav
 * preferences. Every feature is free, so the first non-hidden nav item
 * wins with no entitlement gating.
 *
 * @param userMetadata - The Supabase user_metadata object
 * @param opts.isMobile - When true, skips desktop-only routes (Board, Chat)
 * @returns First eligible nav href, or FALLBACK_LANDING
 */
export function pickLandingPath(
  userMetadata: unknown,
  opts: { isMobile?: boolean } = {}
): string {
  const raw = (userMetadata as { hidden_nav_items?: unknown } | null)?.hidden_nav_items;
  const hidden = new Set(
    Array.isArray(raw) ? raw.filter((v): v is string => typeof v === "string") : []
  );
  for (const href of NAV_HREFS_IN_ORDER) {
    if (hidden.has(href)) continue;
    if (opts.isMobile && DESKTOP_ONLY_HREFS.has(href)) continue;
    return href;
  }
  return FALLBACK_LANDING;
}

/**
 * Best-effort mobile detection for server-side redirects, where there is no
 * viewport to measure. Prefers the `sec-ch-ua-mobile` client hint (sent by
 * Chromium browsers) and falls back to a user-agent sniff for Safari/iOS.
 *
 * Only used to pick a landing route — MobileRouteGuard re-checks with a real
 * media query on the client, so a wrong guess self-corrects.
 *
 * @param headers - The incoming request headers
 * @returns true when the request most likely came from a phone
 */
export function isMobileRequest(headers: Headers): boolean {
  if (headers.get("sec-ch-ua-mobile") === "?1") return true;
  const ua = headers.get("user-agent") ?? "";
  // iPad reports a desktop-class UA on modern iPadOS and gets the wide
  // layout, so it is deliberately not matched here.
  return /iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua);
}
