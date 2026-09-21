"use client";

/**
 * Subscribes a component to a CSS media query.
 *
 * SSR-safe: the server (and the first client render, which must match it)
 * sees `serverDefault`; the real match lands in the render right after
 * hydration. Callers that must not flash the wrong layout in that one frame
 * keep a CSS breakpoint on the container as well.
 *
 * @module useMediaQuery
 */

import { useCallback, useSyncExternalStore } from "react";

/** Tailwind's `md` breakpoint: below it the app shows the mobile layout. */
export const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

/**
 * Whether `query` currently matches.
 *
 * @param query - A media query string, e.g. "(max-width: 767px)"
 * @param serverDefault - Value reported on the server and during hydration
 * @returns True while the query matches; re-renders on change
 */
export function useMediaQuery(query: string, serverDefault = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return serverDefault;
    return window.matchMedia(query).matches;
  }, [query, serverDefault]);
  const getServerSnapshot = useCallback(() => serverDefault, [serverDefault]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Whether the viewport is mobile-sized (below Tailwind's `md`).
 *
 * @returns True below 768px; false on the server and during hydration
 */
export function useIsMobile(): boolean {
  return useMediaQuery(MOBILE_MEDIA_QUERY, false);
}
