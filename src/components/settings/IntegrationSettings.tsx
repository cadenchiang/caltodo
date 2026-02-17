"use client";

import { useState, useEffect, useCallback } from "react";
import type { IntegrationCredentials } from "@/lib/types";
import CanvasSettings from "./CanvasSettings";
import GradescopeSettings from "./GradescopeSettings";
import ClassesSection from "./ClassesSection";

const CACHE_KEY = "caltodo_credentials_cache";

/**
 * Reads cached credentials from localStorage.
 * @returns Cached IntegrationCredentials or null if not found/invalid
 */
function getCachedCredentials(): IntegrationCredentials | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as IntegrationCredentials;
  } catch {
    return null;
  }
}

/**
 * Writes credentials to localStorage cache.
 * @param creds - The credentials to cache
 */
function setCachedCredentials(creds: IntegrationCredentials): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(creds));
  } catch {
    /* ignore quota errors */
  }
}

/**
 * Container for Canvas and Gradescope integration settings.
 * Initializes with loading=true on both server and client to avoid
 * hydration mismatch. useEffect on mount hydrates from localStorage
 * cache, then fetches fresh data from API in the background.
 */
export default function IntegrationSettings() {
  const [credentials, setCredentials] = useState<IntegrationCredentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  /**
   * Fetches integration credentials from the API.
   * Updates both state and localStorage cache on success.
   *
   * @param cached - Whether a cache hit was used for initial render
   */
  const fetchCredentials = useCallback(async (cached: boolean) => {
    try {
      const res = await fetch("/api/credentials");
      if (res.ok) {
        const data: IntegrationCredentials = await res.json();
        setCredentials(data);
        setCachedCredentials(data);
      } else if (!cached) {
        setFetchError("Failed to load credentials");
      }
    } catch {
      if (!cached) {
        setFetchError("Failed to load credentials");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = getCachedCredentials();
    if (cached) {
      setCredentials(cached);
      setLoading(false);
    }
    fetchCredentials(!!cached);
  }, [fetchCredentials]);

  /**
   * Handles credential updates from child components (Save).
   * Updates both state and localStorage cache.
   */
  function handleUpdate(updated: IntegrationCredentials) {
    setCredentials(updated);
    setCachedCredentials(updated);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-subtle-foreground text-sm">
        Loading settings...
      </div>
    );
  }

  if (fetchError || !credentials) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-500 text-sm p-3 rounded-xl">
        {fetchError || "Failed to load credentials"}
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-8">
      <CanvasSettings credentials={credentials} onUpdate={handleUpdate} />
      <GradescopeSettings credentials={credentials} onUpdate={handleUpdate} />
      <ClassesSection credentials={credentials} onUpdate={handleUpdate} />
    </div>
  );
}
