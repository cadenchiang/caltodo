"use client";

import { useSyncExternalStore } from "react";

/** Subscribes to the browser's online / offline events. */
function subscribe(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

/**
 * Whether the browser reports a network connection.
 *
 * @returns navigator.onLine, true during SSR and hydration so no offline
 *          banner flashes before the client has measured
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => (typeof navigator === "undefined" ? true : navigator.onLine),
    () => true,
  );
}
