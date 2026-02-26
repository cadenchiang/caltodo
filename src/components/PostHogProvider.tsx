"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

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
 * - Minified React error #418: Hydration mismatches, often from browser extensions
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

if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  if (key) {
    posthog.init(key, {
      api_host: "/a",
      ui_host: "https://us.posthog.com",
      person_profiles: "always",
      capture_pageview: false, // Handled by PostHogPageView for SPA navigations
      capture_pageleave: true,
      autocapture: true,
      before_send: (event) => {
        if (!event) return event;
        // Filter out known benign errors from $exception events
        if (event.event === "$exception") {
          const message =
            (event.properties?.$exception_message as string) ?? "";
          const type =
            (event.properties?.$exception_type as string) ?? "";
          const combined = `${type} ${message}`;

          for (const pattern of IGNORED_ERROR_PATTERNS) {
            if (combined.includes(pattern)) {
              return null;
            }
          }
        }
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
