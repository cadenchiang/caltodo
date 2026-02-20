"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { usePostHog } from "posthog-js/react";

/**
 * Captures a PostHog `$pageview` event on every client-side navigation.
 * Next.js App Router performs SPA navigations that don't trigger the
 * browser's native pageview, so this component listens to pathname and
 * search-param changes and fires the event manually.
 *
 * Must be rendered inside <PostHogProvider> and wrapped in <Suspense>
 * because useSearchParams() requires it in App Router.
 */
function PostHogPageViewInner(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      const search = searchParams.toString();
      if (search) {
        url += "?" + search;
      }
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}

/**
 * Suspense-wrapped pageview tracker for use in the root layout.
 * The Suspense boundary is required because useSearchParams() suspends
 * during static rendering in Next.js App Router.
 */
export default function PostHogPageView(): React.ReactElement {
  return (
    <Suspense fallback={null}>
      <PostHogPageViewInner />
    </Suspense>
  );
}
