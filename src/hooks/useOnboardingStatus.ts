"use client";

import { useState, useEffect, useCallback } from "react";

/** SessionStorage key for caching onboarding status. */
const CACHE_KEY = "caltodo_onboarding_status";

/** Module-level cache so multiple consumers don't re-fetch in the same session. */
let moduleCached: boolean | null = null;

/**
 * Reads cached onboarding status from sessionStorage.
 *
 * @returns cached boolean or null if not present / expired
 */
function readCache(): boolean | null {
  if (moduleCached !== null) return moduleCached;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    // Cache valid for 5 minutes
    if (Date.now() - entry.timestamp > 5 * 60_000) return null;
    return entry.completed as boolean;
  } catch {
    return null;
  }
}

/**
 * Writes onboarding status to both module cache and sessionStorage.
 *
 * @param completed - Whether onboarding has been completed
 */
function writeCache(completed: boolean): void {
  moduleCached = completed;
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ completed, timestamp: Date.now() })
    );
  } catch {
    /* non-critical */
  }
}

/**
 * Hook that exposes whether the current user has completed onboarding.
 * Uses module-level + sessionStorage caching so multiple consumers
 * (Sidebar, MobileTabBar, CalChat pages) don't re-fetch.
 * Listens for `onboarding-status-change` custom event so status
 * updates instantly after onboarding completes.
 *
 * @returns { hasCompletedOnboarding, loading, refresh }
 */
export function useOnboardingStatus(): {
  hasCompletedOnboarding: boolean;
  loading: boolean;
  refresh: () => void;
} {
  const cached = readCache();
  const [completed, setCompleted] = useState<boolean>(cached ?? true);
  const [loading, setLoading] = useState(cached === null);

  const fetchStatus = useCallback(() => {
    setLoading(true);
    fetch("/api/credentials")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const value = !!data.has_completed_onboarding;
        writeCache(value);
        setCompleted(value);
      })
      .catch(() => {
        /* non-critical */
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch on mount if no cache
  useEffect(() => {
    if (cached === null) {
      fetchStatus();
    }
  }, [cached, fetchStatus]);

  // Listen for custom event dispatched after onboarding completion
  useEffect(() => {
    function handleChange(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.completed !== undefined) {
        const value = !!detail.completed;
        writeCache(value);
        setCompleted(value);
      }
    }
    window.addEventListener("onboarding-status-change", handleChange);
    return () =>
      window.removeEventListener("onboarding-status-change", handleChange);
  }, []);

  return { hasCompletedOnboarding: completed, loading, refresh: fetchStatus };
}
