/**
 * Normalises and vets a link typed onto a task.
 *
 * The value ends up in an `href`, so this is the boundary that decides what
 * is allowed to get there. Only http and https survive: a `javascript:` or
 * `data:` URL in a link the user clicks is script execution, not navigation.
 *
 * @module task-link
 */

/** Schemes a task link may use. Everything else is refused. */
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/** Longest link accepted, keeping the column and the UI within reason. */
const MAX_LENGTH = 2000;

/**
 * Characters that never appear inside a URL.
 *
 * Whitespace and C0/C1 controls are how a blocked scheme gets smuggled past a
 * check: `java\nscript:alert(1)` is parsed as `javascript:` by some consumers
 * but reads as an unknown scheme to a naive one. Refusing them outright is
 * cheaper than reasoning about who strips what.
 */
const FORBIDDEN_CHARS = /[\s\u0000-\u001F\u007F-\u009F]/;

/**
 * Turns typed text into a link, or reports that it is not one.
 *
 * @param input - Raw text from the link field
 * @returns The normalised absolute URL, or null when it cannot be one
 * @remarks A bare host is the common case ("bcourses.berkeley.edu/..."), so
 *          text with no scheme is tried as https rather than rejected. A
 *          scheme that is present and not http(s) is refused outright rather
 *          than having https prepended, which would turn `javascript:alert(1)`
 *          into a link to a host named "javascript".
 */
export function normaliseTaskLink(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > MAX_LENGTH) return null;
  if (FORBIDDEN_CHARS.test(trimmed)) return null;

  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed);
  const candidate = hasScheme ? trimmed : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) return null;
  // A URL with no host is not somewhere to go, e.g. "https:///path".
  if (!url.hostname) return null;
  // A host with no dot is a typo far more often than an intranet name, and
  // turning "notes" into https://notes helps nobody.
  if (!url.hostname.includes(".") && url.hostname !== "localhost") return null;

  return url.toString();
}

/**
 * Shortens a link for display.
 *
 * @param url - An absolute URL
 * @returns Host and path, without the scheme or a trailing slash
 * @remarks The row is one line beside an icon, and "https://" at the front of
 *          every link costs eight characters that say nothing. Falls back to
 *          the input when it cannot be parsed, so a stored value from before
 *          this existed still renders.
 */
export function displayTaskLink(url: string): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname === "/" ? "" : parsed.pathname;
    return `${parsed.host}${path}${parsed.search}`.replace(/\/$/, "");
  } catch {
    return url;
  }
}
