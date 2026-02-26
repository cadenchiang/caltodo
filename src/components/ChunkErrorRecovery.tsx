"use client";

import { useEffect } from "react";

/**
 * Global handler for ChunkLoadError caused by stale deployments.
 * When a JS chunk fails to load (old deployment hash no longer on CDN),
 * auto-reloads the page once. Uses sessionStorage to prevent reload loops.
 *
 * Renders nothing — purely a side-effect component.
 */
export default function ChunkErrorRecovery() {
  useEffect(() => {
    const RELOAD_KEY = "caltodo_chunk_reload";

    function handleError(event: ErrorEvent) {
      const error = event.error;
      if (
        error?.name === "ChunkLoadError" ||
        error?.message?.includes("Loading chunk") ||
        error?.message?.includes("Failed to load chunk")
      ) {
        const lastReload = sessionStorage.getItem(RELOAD_KEY);
        const now = Date.now();

        // Only auto-reload once per 60 seconds to prevent loops
        if (!lastReload || now - parseInt(lastReload, 10) > 60_000) {
          sessionStorage.setItem(RELOAD_KEY, String(now));
          window.location.reload();
        }
      }
    }

    function handleRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      if (
        reason?.name === "ChunkLoadError" ||
        reason?.message?.includes("Loading chunk") ||
        reason?.message?.includes("Failed to load chunk")
      ) {
        const lastReload = sessionStorage.getItem(RELOAD_KEY);
        const now = Date.now();

        if (!lastReload || now - parseInt(lastReload, 10) > 60_000) {
          sessionStorage.setItem(RELOAD_KEY, String(now));
          window.location.reload();
        }
      }
    }

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
