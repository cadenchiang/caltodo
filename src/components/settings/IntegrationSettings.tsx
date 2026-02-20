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
/** Default empty credentials used for instant render before API responds. */
const EMPTY_CREDENTIALS: IntegrationCredentials = {
  canvas_token: null,
  canvas_base_url: "",
  gradescope_email: null,
  has_gradescope_password: false,
  last_synced_at: null,
  selected_canvas_courses: null,
  selected_gradescope_courses: null,
  has_google_calendar: false,
  google_calendar_id: null,
  google_email: null,
  google_photo_url: null,
  canvas_token_created_at: null,
};

export default function IntegrationSettings() {
  const [credentials, setCredentials] = useState<IntegrationCredentials>(
    () => getCachedCredentials() ?? EMPTY_CREDENTIALS
  );

  /**
   * Fetches integration credentials from the API.
   * Updates both state and localStorage cache on success.
   */
  const fetchCredentials = useCallback(async () => {
    try {
      const res = await fetch("/api/credentials");
      if (res.ok) {
        const data: IntegrationCredentials = await res.json();
        setCredentials(data);
        setCachedCredentials(data);
      }
    } catch {
      /* silently fail — cached or empty state is already shown */
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

  return (
    <div className="max-w-xl space-y-8">
      <CanvasSettings credentials={credentials} onUpdate={handleUpdate} />
      <GradescopeSettings credentials={credentials} onUpdate={handleUpdate} />
      <ClassesSection credentials={credentials} onUpdate={handleUpdate} />
    </div>
  );
}
