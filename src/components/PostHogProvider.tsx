"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

/**
 * Initializes PostHog analytics on the client side.
 * Enables autocapture (all clicks, pageviews, inputs) and session recording.
 * Wraps children in PostHogProvider for access via hooks throughout the app.
 *
 * @param children - React children to wrap with PostHog context
 */
export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Skip PostHog entirely in development to avoid "Failed to fetch" errors
    if (process.env.NODE_ENV === "development") return;

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (!key || !host) {
      console.warn(
        "[PostHog] Missing NEXT_PUBLIC_POSTHOG_KEY or NEXT_PUBLIC_POSTHOG_HOST — analytics disabled",
      );
      return;
    }

    posthog.init(key, {
      api_host: "/a",
      ui_host: "https://us.posthog.com",
      person_profiles: "always",
      capture_pageview: false, // Handled by PostHogPageView component for SPA navigations
      capture_pageleave: true,
      autocapture: true,
      loaded: (ph) => {
        if (process.env.NODE_ENV !== "production") return;
        console.log("[PostHog] Initialized successfully, distinct_id:", ph.get_distinct_id());
      },
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
