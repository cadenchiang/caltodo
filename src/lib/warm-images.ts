/**
 * Browser-cache warming for a known set of image URLs.
 *
 * Extracted from IntegrationSettings, where the warm-up ran inside
 * `IntegrationProvider`. That provider is mounted app-wide by
 * GlobalHealthBanner, so every authenticated page — /app/inbox included —
 * eagerly downloaded four integration logos that only the settings screen
 * ever renders. A DevTools trace of /app/inbox caught it costing a 384KB
 * bcourses-logo.png fetch on a page with no integration cards on it.
 *
 * The warm-up itself is worth keeping: without it each card's `<img>` only
 * requests when that card mounts, which made the settings list visibly pop
 * in one row at a time. It just has to run where the cards actually are.
 *
 * @module lib/warm-images
 */

/**
 * Integration logos rendered by the settings integration list.
 * Kept next to the warm helper so the list and its consumer can't drift.
 */
export const INTEGRATION_LOGO_SRCS = [
  "/bcourses-logo.png",
  "/gradescope-logo.png",
  "/pensieve-logo.png",
  "/canvas-logo.png",
] as const;

/** Constructs a preloading image element. Injectable so tests need no DOM. */
export type ImageFactory = () => { src: string };

/**
 * Kick off a browser fetch for each URL so the real `<img>` renders from
 * cache instead of popping in.
 *
 * No-ops on the server, where there is no browser cache to warm. Individual
 * failures are swallowed per URL: a warm-up is best-effort, and letting one
 * bad path abort the loop would leave the rest of the list cold. The count
 * of successful starts is returned so callers (and tests) can assert on it.
 *
 * @param srcs - Image URLs to warm. An empty list is a valid no-op.
 * @param factory - Creates the preloader. Defaults to `new window.Image()`.
 * @returns Number of URLs for which a fetch was successfully started.
 * @throws Never. Errors are reported via the return count and console.warn.
 *
 * Edge cases: duplicate URLs are de-duplicated so a repeated entry does not
 * issue two requests; blank/whitespace-only entries are skipped.
 */
export function warmImages(
  srcs: readonly string[],
  factory?: ImageFactory,
): number {
  const makeImage =
    factory ??
    (typeof window !== "undefined" && typeof window.Image === "function"
      ? () => new window.Image()
      : null);

  if (!makeImage) return 0;

  let started = 0;
  for (const src of new Set(srcs)) {
    if (typeof src !== "string" || src.trim() === "") continue;
    try {
      makeImage().src = src;
      started += 1;
    } catch (err) {
      // Best-effort: one unwarmed logo just means that card pops in.
      console.warn(`[warm-images] failed to warm ${src}:`, err);
    }
  }
  return started;
}
