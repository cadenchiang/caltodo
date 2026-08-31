/**
 * Route classification for analytics.
 *
 * PostHog used to drop every event fired outside `/app/*` so that anonymous
 * landing-page sessions could not skew retention. That worked, but it also
 * meant the marketing site produced no data at all: no bounce rate, no
 * landing-to-signup conversion, and no way to measure the SEO pages. Events
 * are now captured everywhere and tagged with the surface they came from, so
 * retention can filter to `surface = "app"` without losing the funnel above it.
 */

/** Which half of the product an event came from. */
export type AnalyticsSurface = "app" | "marketing";

/**
 * Classifies a pathname as the authenticated app or the public marketing site.
 *
 * Matches `/app` exactly and anything beneath it. A bare prefix test would also
 * claim unrelated routes such as `/apple-pie`, so the boundary is explicit.
 *
 * @param pathname - URL path, with or without a trailing slash. Query strings
 *                   and hashes must already be stripped.
 * @returns "app" for the authenticated product, "marketing" for everything
 *          else, including the empty string and malformed input.
 */
export function surfaceForPath(pathname: string): AnalyticsSurface {
  if (!pathname) return "marketing";
  if (pathname === "/app") return "app";
  return pathname.startsWith("/app/") ? "app" : "marketing";
}

/**
 * Classifies the browser's current location.
 *
 * @returns The current surface, defaulting to "marketing" when `window` is
 *          unavailable or throws (SSR, sandboxed iframes).
 */
export function currentSurface(): AnalyticsSurface {
  try {
    return surfaceForPath(window.location.pathname);
  } catch {
    return "marketing";
  }
}
