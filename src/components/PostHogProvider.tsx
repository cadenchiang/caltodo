"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { currentSurface } from "@/lib/analytics-surface";

/**
 * Initialize PostHog synchronously at module level (not in useEffect).
 * This ensures PostHog is ready before any component renders or fires events,
 * eliminating the race condition where events were dropped before init completed.
 *
 * Only runs in the browser (typeof window check) and in production.
 */
/**
 * Error messages that are benign and should not be reported to PostHog.
 * - NEXT_REDIRECT: Next.js internal mechanism, not a real error
 * - AbortError: Fetch requests cancelled during navigation
 * - Script error: Cross-origin scripts with no useful info
 * - Minified React error #418/#423: Hydration mismatches, often from browser extensions
 * - ChunkLoadError: Handled by ChunkErrorRecovery with auto-reload
 * - unexpected response: Transient network issues
 */
const IGNORED_ERROR_PATTERNS = [
  "NEXT_REDIRECT",
  "AbortError",
  "signal is aborted without reason",
  "Script error",
  "Minified React error #418",
  "Minified React error #423",
  "ChunkLoadError",
  "Loading chunk",
  "Failed to load chunk",
  "An unexpected response was received from the server",
];

/**
 * Checks whether an exception event matches any ignored error pattern.
 * Inspects both legacy top-level properties ($exception_message, $exception_type)
 * and the newer $exception_list array format used by PostHog SDK v1.100+.
 *
 * @param properties - The event properties from a PostHog $exception event
 * @returns true if the error matches a known benign pattern and should be dropped
 */
function isIgnoredException(
  properties: Record<string, unknown> | undefined,
): boolean {
  if (!properties) return false;

  // Check top-level $exception_message + $exception_type (legacy format)
  const message = (properties.$exception_message as string) ?? "";
  const type = (properties.$exception_type as string) ?? "";
  const combined = `${type} ${message}`;

  for (const pattern of IGNORED_ERROR_PATTERNS) {
    if (combined.includes(pattern)) return true;
  }

  // Check $exception_list entries (PostHog SDK v1.100+ exception autocapture)
  const exceptionList = properties.$exception_list;
  if (Array.isArray(exceptionList)) {
    for (const entry of exceptionList) {
      const entryType = (entry?.type as string) ?? "";
      const entryValue = (entry?.value as string) ?? "";
      const entryCombined = `${entryType} ${entryValue}`;

      for (const pattern of IGNORED_ERROR_PATTERNS) {
        if (entryCombined.includes(pattern)) return true;
      }
    }
  }

  return false;
}

if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  if (key) {
    posthog.init(key, {
      api_host: "/a",
      ui_host: "https://us.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false, // Handled by PostHogPageView for SPA navigations
      capture_pageleave: true,
      autocapture: true,
      // PostHog lazy-loads a separate bundle per optional feature. A
      // DevTools trace of /app/inbox caught surveys.js (100KB, 424ms) and
      // dead-clicks-autocapture.js downloading between 511ms and 1028ms —
      // exactly the window in which /api/credentials and the Supabase task
      // query are competing for bandwidth to paint the user's task list.
      //
      // Neither feature is used: there are no surveys defined and nothing
      // reads dead-click data. Exception autocapture and performance
      // capture stay on — `before_send` actively filters $exception events
      // (see isIgnoredException), and web vitals is how we watch this page.
      disable_surveys: true,
      capture_dead_clicks: false,
      before_send: (event) => {
        if (!event) return event;

        // Filter out known benign errors from $exception events
        if (event.event === "$exception" && isIgnoredException(event.properties)) {
          return null;
        }

        // Tag every event with the half of the product it came from. This
        // replaces an outright drop of all non-/app events: that kept
        // retention clean but left the marketing site, and therefore bounce
        // rate and landing-to-signup conversion, completely unmeasurable.
        // Filter to `surface = "app"` for usage and retention metrics.
        // Anonymous visitors still create no person profiles, because
        // person_profiles is "identified_only" above.
        event.properties = { ...event.properties, surface: currentSurface() };
        return event;
      },
    });
  }
}

/**
 * Wraps children in PostHogProvider for access via usePostHog() hook.
 * PostHog is already initialized at module load time above.
 *
 * @param children - React children to wrap with PostHog context
 */
export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}
