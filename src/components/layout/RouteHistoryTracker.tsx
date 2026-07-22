"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordAppRoute } from "@/lib/settings-return";

/**
 * Renders nothing. Records the current app route (path + query) on every
 * navigation so the Settings back button can return the user to where they
 * actually were, instead of hardcoding the inbox. Settings/onboarding routes
 * are ignored by recordAppRoute so they never overwrite a real origin.
 */
export default function RouteHistoryTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    recordAppRoute(window.location.pathname + window.location.search);
  }, [pathname]);

  return null;
}
