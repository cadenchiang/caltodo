/**
 * The one way a calendar-feed URL is fetched.
 *
 * Every feed client (Canvas iCal, Pensieve, Brightspace, Blackboard) used to
 * call fetch() itself with the default redirect policy. The SSRF allowlist
 * only ever checked the URL the user submitted, so a feed that answered with
 * a redirect could send the fetch anywhere, allowlist or not (audit L6).
 * Redirects are now never followed: a 3xx is reported as a failure asking
 * for the final URL, which is also the honest answer for a feed whose
 * provider moved it.
 *
 * The per-request timeout is short enough that one slow feed cannot eat the
 * sync function's whole budget (audit M7).
 */

import { logger } from "@/lib/logger";

/** Per-request timeout for one feed fetch. */
export const FEED_FETCH_TIMEOUT_MS = 8_000;

/** How one provider's fetch names itself in errors. */
export interface FeedFetchOptions {
  /** Provider name for logs and the redirect message, e.g. "Canvas". */
  name: string;
  /** Prefix of the non-OK error, kept per provider for existing matchers. */
  failurePrefix: string;
  /** Error thrown when the body is not an iCal calendar. */
  notCalendarMessage: string;
  /** Overrides the default timeout; tests only. */
  timeoutMs?: number;
}

/**
 * Fetches a calendar feed and returns its iCal text.
 *
 * @param url - The feed URL, already validated by the caller's allowlist.
 * @param options - Provider naming for errors.
 * @returns The raw iCal body.
 * @throws When the feed redirects (any 3xx), answers non-2xx, times out, or
 *         returns a body without BEGIN:VCALENDAR (a login page, typically).
 */
export async function fetchFeedCalendar(url: string, options: FeedFetchOptions): Promise<string> {
  const res = await fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(options.timeoutMs ?? FEED_FETCH_TIMEOUT_MS),
  });

  // Node returns the 3xx itself under redirect: "manual"; a browser-style
  // runtime returns an opaque redirect with status 0. Treat both as one.
  if ((res.status >= 300 && res.status < 400) || res.type === "opaqueredirect") {
    logger.warn("fetchFeedCalendar: feed redirected, not following", {
      provider: options.name,
      status: res.status,
      cause: "the allowlist validated the submitted URL, not the redirect target",
      impact: "feed not synced; user is asked for the final URL",
    });
    throw new Error(`${options.name} feed URL redirected; paste the final URL into Settings.`);
  }

  if (!res.ok) {
    throw new Error(`${options.failurePrefix}: ${res.status}`);
  }

  const icsText = await res.text();
  // A reset/private feed often returns HTTP 200 with an HTML login page
  // instead of iCal. Without this guard the parser finds no events and the
  // sync silently reports success with 0 assignments.
  if (!/BEGIN:VCALENDAR/i.test(icsText)) {
    throw new Error(options.notCalendarMessage);
  }
  return icsText;
}
