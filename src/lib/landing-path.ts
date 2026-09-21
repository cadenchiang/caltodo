/**
 * Determines a user's post-login landing path based on which sidebar
 * nav items they have hidden.
 *
 * Pure / dependency-free so both the proxy and node-runtime
 * route handlers can import it.
 *
 * @module landing-path
 */

/**
 * Order matches the sidebar's NAV_ITEMS order. The first href the user
 * has NOT hidden becomes their landing page.
 */
const NAV_HREFS_IN_ORDER = [
  // "/app/home" is withdrawn while the board is reworked; see NAV_ITEMS.
  "/app/inbox",
  "/app/calendar",
] as const;

/** Last-resort destination if every nav item has somehow been hidden. */
const FALLBACK_LANDING = "/app/inbox";

/**
 * Routes that don't exist on mobile: the widget board needs a pointer and a
 * wide canvas. It is not in the mobile tab bar, so landing a phone on it
 * would strand the user (MobileRouteGuard bounces them, but redirecting up
 * front avoids the flash).
 */
const DESKTOP_ONLY_HREFS = new Set<string>(["/app/home"]);

/**
 * Nav items that can serve as a landing page on every device. At least one
 * of these must stay visible: hiding both would leave the user with nowhere
 * to land, so HiddenRouteRedirect would have no valid target.
 */
export const LANDING_CAPABLE_HREFS: readonly string[] = NAV_HREFS_IN_ORDER.filter(
  (href) => !DESKTOP_ONLY_HREFS.has(href)
);

/** Why the last landing-capable nav item cannot be hidden. */
export const LAST_LANDING_ITEM_REASON = "At least one of Inbox or Calendar must stay visible so there is always a page to land on.";

/**
 * Whether hiding a nav item would leave the user with no landing page.
 *
 * @param href - The nav item about to be hidden
 * @param hidden - The hrefs currently hidden
 * @returns allowed=false, with a reason, when `href` is the last visible
 *          landing-capable item; allowed=true otherwise
 * @remarks Hiding a desktop-only item is always allowed, and so is hiding
 *          something already hidden (a no-op).
 */
export function canHideNavItem(href: string, hidden: ReadonlySet<string>): { allowed: boolean; reason?: string } {
  if (!LANDING_CAPABLE_HREFS.includes(href) || hidden.has(href)) return { allowed: true };
  const othersVisible = LANDING_CAPABLE_HREFS.some((h) => h !== href && !hidden.has(h));
  return othersVisible ? { allowed: true } : { allowed: false, reason: LAST_LANDING_ITEM_REASON };
}

/**
 * Picks the post-login landing path, respecting the user's hidden nav
 * preferences. Every feature is free, so the first non-hidden nav item
 * wins with no entitlement gating.
 *
 * @param userMetadata - The Supabase user_metadata object
 * @param opts.isMobile - When true, skips desktop-only routes (Board)
 * @returns First eligible nav href, or FALLBACK_LANDING
 * @remarks On mobile the result is never a desktop-only route, even when
 *          every mobile-capable item is hidden: the fallback (Inbox) is
 *          returned instead, and the caller treats "already there" as done.
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
