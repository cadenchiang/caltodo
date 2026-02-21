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
if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (key && host) {
    posthog.init(key, {
      api_host: "/a",
      ui_host: "https://us.posthog.com",
      person_profiles: "always",
      capture_pageview: false, // Handled by PostHogPageView for SPA navigations
      capture_pageleave: true,
      autocapture: true,
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
