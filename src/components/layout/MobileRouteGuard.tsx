"use client";

/**
 * Keeps desktop-only routes off mobile.
 *
 * Home (the drag-and-drop widget board) and Chat are built for a pointer and
 * a wide canvas; neither is in the mobile tab bar. Without a guard they were
 * still reachable on a phone via history, a bookmark, a shared link, or the
 * post-login landing path — landing the user on a surface with no way back
 * except the browser's back button.
 *
 * Redirects to Inbox, which is the mobile home. Desktop is untouched: the
 * check is a matchMedia query on the same 768px breakpoint Tailwind's `md`
 * uses, and it re-evaluates on resize/rotate so a tablet flipping to portrait
 * behaves the same as a phone.
 */

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/** Routes (and their subroutes) that are hidden on mobile. */
const DESKTOP_ONLY_HREFS = ["/app/home", "/app/discussions"] as const;

/** Where mobile users go instead. */
const MOBILE_FALLBACK = "/app/inbox";

/** Matches Tailwind's `md` breakpoint — below this the tab bar is shown. */
const MOBILE_QUERY = "(max-width: 767px)";

/**
 * Renders nothing. Side-effect only: redirects away from desktop-only routes
 * while the viewport is mobile-sized.
 */
export default function MobileRouteGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname) return;
    const onDesktopOnlyRoute = DESKTOP_ONLY_HREFS.some(
      (href) => pathname === href || pathname.startsWith(href + "/")
    );
    if (!onDesktopOnlyRoute) return;

    const mql = window.matchMedia(MOBILE_QUERY);
    const redirectIfMobile = () => {
      if (mql.matches) router.replace(MOBILE_FALLBACK);
    };

    redirectIfMobile();
    mql.addEventListener("change", redirectIfMobile);
    return () => mql.removeEventListener("change", redirectIfMobile);
  }, [pathname, router]);

  return null;
}
