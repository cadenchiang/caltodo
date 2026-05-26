"use client";

import { useState, useEffect, useCallback } from "react";
import type { DismissedModals } from "@/lib/types";

/**
 * Maps server-side modal keys to their corresponding localStorage keys.
 * Maintains backward compatibility with existing localStorage dismiss state.
 */
const KEY_MAP: Record<keyof DismissedModals, string> = {
  sync_welcome: "caltodo_sync_dismissed",
  gcal_announce: "caltodo_gcal_announce_seen",
  calchat_welcome: "calchat_welcome_accepted",
  pensieve_announced: "caltodo_pensieve_announced",
  calchat_announcement: "calchat_announcement_seen",
};

/** Module-level cache so multiple hook consumers share state without re-fetching. */
let cachedModals: DismissedModals | null = null;

/** Whether the module-level fetch has already been initiated this session. */
let fetchInitiated = false;

/**
 * Reads dismissed modal state from localStorage as a fast initial source.
 *
 * @returns DismissedModals populated from localStorage keys
 */
function readLocalStorage(): DismissedModals {
  const result: DismissedModals = {};
  try {
    for (const [key, lsKey] of Object.entries(KEY_MAP)) {
      if (localStorage.getItem(lsKey) === "true") {
        result[key as keyof DismissedModals] = true;
      }
    }
  } catch {
    /* non-critical */
  }
  return result;
}

/**
 * Syncs server-side dismissed state to localStorage for fast subsequent reads.
 *
 * @param modals - The current dismissed modals state
 */
function syncToLocalStorage(modals: DismissedModals): void {
  try {
    for (const [key, lsKey] of Object.entries(KEY_MAP)) {
      if (modals[key as keyof DismissedModals]) {
        localStorage.setItem(lsKey, "true");
      }
    }
  } catch {
    /* non-critical */
  }
}

/**
 * Hook providing server-backed modal dismiss state with localStorage fallback.
 *
 * - Reads localStorage on mount for instant availability (no flash).
 * - Fetches server truth from /api/credentials (one fetch per session via module cache).
 * - Optimistically updates local state + localStorage on dismiss, then persists to server.
 * - Listens for "caltodo-reset-modals" event (fired by Redo Setup) to clear state.
 *
 * @returns isDismissed(key), dismiss(key), dismissAll(), loaded
 */
export function useDismissedModals() {
  const [modals, setModals] = useState<DismissedModals>(() => cachedModals ?? readLocalStorage());
  const [loaded, setLoaded] = useState(cachedModals !== null);

  // Fetch server state once per session
  useEffect(() => {
    if (cachedModals !== null) {
      setModals(cachedModals);
      setLoaded(true);
      return;
    }
    if (fetchInitiated) return;
    fetchInitiated = true;

    const localModals = readLocalStorage();

    fetch("/api/credentials")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const serverModals: DismissedModals = data.dismissed_modals ?? {};
        // Merge: server wins, but also include any localStorage-only dismissals
        const merged = { ...localModals, ...serverModals };
        cachedModals = merged;
        setModals(merged);
        syncToLocalStorage(merged);
        setLoaded(true);
      })
      .catch(() => {
        // On fetch failure, treat localStorage as source of truth
        cachedModals = localModals;
        setLoaded(true);
      });
  }, []);

  /**
   * Checks if a specific modal has been dismissed.
   *
   * @param key - The modal identifier from DismissedModals
   * @returns true if the modal has been dismissed
   */
  const isDismissed = useCallback(
    (key: keyof DismissedModals): boolean => {
      return !!modals[key];
    },
    [modals]
  );

  /**
   * Marks a modal as dismissed. Updates local state + localStorage immediately,
   * then persists the full state to the server (fire-and-forget).
   *
   * @param key - The modal identifier to dismiss
   */
  const dismiss = useCallback(
    (key: keyof DismissedModals) => {
      const updated = { ...modals, [key]: true };
      setModals(updated);
      cachedModals = updated;

      // Write to localStorage immediately for fast subsequent reads
      const lsKey = KEY_MAP[key];
      if (lsKey) {
        try { localStorage.setItem(lsKey, "true"); } catch { /* non-critical */ }
      }

      // Persist full state to server (fire-and-forget)
      fetch("/api/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dismissed_modals: updated }),
      }).catch(() => { /* non-critical */ });
    },
    [modals]
  );

  /**
   * Marks all modals as dismissed. Used after onboarding completion.
   */
  const dismissAll = useCallback(() => {
    const all: DismissedModals = {
      sync_welcome: true,
      gcal_announce: true,
      calchat_welcome: true,
      pensieve_announced: true,
      calchat_announcement: true,
    };
    setModals(all);
    cachedModals = all;
    syncToLocalStorage(all);

    fetch("/api/credentials", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dismissed_modals: all }),
    }).catch(() => { /* non-critical */ });
  }, []);

  // Listen for reset event (Redo Setup in AdvancedSection)
  useEffect(() => {
    function handleReset() {
      cachedModals = null;
      fetchInitiated = false;
      setModals({});
      // Clear localStorage dismiss keys
      try {
        for (const lsKey of Object.values(KEY_MAP)) {
          localStorage.removeItem(lsKey);
        }
      } catch { /* non-critical */ }
    }
    window.addEventListener("caltodo-reset-modals", handleReset);
    return () => window.removeEventListener("caltodo-reset-modals", handleReset);
  }, []);

  return { isDismissed, dismiss, dismissAll, loaded };
}
