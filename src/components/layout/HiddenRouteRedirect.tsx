"use client";

/**
 * Watches pathname + hidden_nav_items. When the user lands on (or
 * navigates to) a route they have hidden in Settings → Navigation,
 * redirects to the first non-hidden nav item via pickLandingPath.
 *
 * Without this, a user could still see /app/home after hiding the Board
 * (e.g. via browser history, bookmarked URL, or a stale tab). The
 * sidebar already hides the entry, but the page itself was still
 * reachable. This guards every nav route.
 */

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useHiddenNavItems } from "@/hooks/useHiddenNavItems";
import { pickLandingPath } from "@/lib/landing-path";

/** Nav hrefs we treat as "guardable." Subroutes (e.g. /app/notes/foo) also redirect. */
const GUARDED_HREFS = [
  "/app/home",
  "/app/inbox",
  "/app/calendar",
  "/app/notes",
  "/app/discussions",
] as const;

/**
 * Renders nothing. Side-effect only: redirects away from hidden routes.
 */
export default function HiddenRouteRedirect() {
  const pathname = usePathname();
  const router = useRouter();
  const { hidden } = useHiddenNavItems();

  useEffect(() => {
    if (!pathname) return;
    // Find a guarded href that this pathname is on (exact or subroute).
    const matched = GUARDED_HREFS.find(
      (href) => pathname === href || pathname.startsWith(href + "/")
    );
    if (!matched) return;
    if (!hidden.has(matched)) return;

    // Pretend metadata to compute the landing target.
    const target = pickLandingPath({ hidden_nav_items: [...hidden] });
    if (target === pathname) return;
    router.replace(target);
  }, [pathname, hidden, router]);

  return null;
}
