"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import type { IntegrationCredentials } from "@/lib/types";
import CanvasSettings from "./CanvasSettings";
import GradescopeSettings from "./GradescopeSettings";

const CACHE_KEY = "toodoo_credentials_cache";

/**
 * Reads cached credentials from localStorage.
 * @returns Cached IntegrationCredentials or null if not found/invalid
 */
function getCachedCredentials(): IntegrationCredentials | null {
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
 * Uses localStorage cache for instant render (stale-while-revalidate).
 * Fetches fresh data from API in the background.
 */
export default function IntegrationSettings() {
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState<IntegrationCredentials | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const hasCacheRef = useRef(false);

  /** Hydrate from localStorage before first paint. */
  useLayoutEffect(() => {
    const cached = getCachedCredentials();
    if (cached) {
      setCredentials(cached);
      setLoading(false);
      hasCacheRef.current = true;
    }
  }, []);

  /**
   * Fetches integration credentials from the API.
   * Skips loading spinner if cache was used.
   */
  const fetchCredentials = useCallback(async () => {
    if (!hasCacheRef.current) {
      setLoading(true);
    }
    try {
      const res = await fetch("/api/credentials");
      if (res.ok) {
        const data: IntegrationCredentials = await res.json();
        setCredentials(data);
        setCachedCredentials(data);
      } else {
        if (!hasCacheRef.current) {
          setFetchError("Failed to load credentials");
        }
      }
    } catch {
      if (!hasCacheRef.current) {
        setFetchError("Failed to load credentials");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredentials();
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
      <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
        Loading settings...
      </div>
    );
  }

  if (fetchError || !credentials) {
    return (
      <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl">
        {fetchError || "Failed to load credentials"}
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-8">
      <CanvasSettings credentials={credentials} onUpdate={handleUpdate} />
      <GradescopeSettings credentials={credentials} onUpdate={handleUpdate} />
    </div>
  );
}
