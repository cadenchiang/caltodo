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
  "/app/discussions",
] as const;

/** Last-resort destination if every nav item has somehow been hidden. */
const FALLBACK_LANDING = "/app/inbox";

/**
 * Routes that don't exist on mobile: the widget board needs a pointer and a
 * wide canvas and is not in the mobile tab bar, so landing a phone on it
 * would strand the user (MobileRouteGuard bounces them, but redirecting up
 * front avoids the flash). Chat ships on mobile and is not listed.
 */
const DESKTOP_ONLY_HREFS = new Set<string>(["/app/home"]);

/**
 * Nav items that can serve as a landing page on every device. At least one
 * of these must stay visible: hiding all of them left mobile with nowhere to
 * land, so HiddenRouteRedirect and MobileRouteGuard bounced the user
 * between routes forever.
 */
export const LANDING_CAPABLE_HREFS: readonly string[] = NAV_HREFS_IN_ORDER.filter(
  (href) => !DESKTOP_ONLY_HREFS.has(href)
);

/** Why the last landing-capable nav item cannot be hidden. */
export const LAST_LANDING_ITEM_REASON = "At least one of Inbox, Calendar, or Chat must stay visible so there is always a page to land on.";

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

/** Nav routes (and their subroutes) the guards apply to. */
const GUARDED_HREFS = ["/app/home", "/app/inbox", "/app/calendar", "/app/discussions"] as const;

/**
 * Decides, before the page renders, whether a request for a nav route must
 * be sent elsewhere: the route is hidden in the user's nav settings, or it
 * is desktop-only and the request comes from a phone. Runs in the proxy so
 * the guarded page never paints first; the client guards remain only for
 * a viewport that changes after load.
 *
 * @param pathname - Requested path
 * @param userMetadata - The Supabase user_metadata (carries hidden_nav_items)
 * @param isMobile - Whether the request looks like a phone
 * @returns The path to redirect to, or null when the route may render
 */
export function resolveGuardedRoute(pathname: string, userMetadata: unknown, isMobile: boolean): string | null {
  const matched = GUARDED_HREFS.find((href) => pathname === href || pathname.startsWith(href + "/"));
  if (!matched) return null;
  const raw = (userMetadata as { hidden_nav_items?: unknown } | null)?.hidden_nav_items;
  const hidden = new Set(Array.isArray(raw) ? raw.filter((v): v is string => typeof v === "string") : []);
  const blocked = hidden.has(matched) || (isMobile && DESKTOP_ONLY_HREFS.has(matched));
  if (!blocked) return null;
  const target = pickLandingPath(userMetadata, { isMobile });
  return target === pathname ? null : target;
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
