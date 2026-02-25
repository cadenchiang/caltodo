"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { IntegrationCredentials } from "@/lib/types";
import { useTaskContext } from "@/contexts/TaskContext";
import CanvasSettings from "./CanvasSettings";
import GradescopeSettings from "./GradescopeSettings";
import PensieveSettings from "./PensieveSettings";
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

/** Default empty credentials used for instant render before API responds. */
const EMPTY_CREDENTIALS: IntegrationCredentials = {
  canvas_token: null,
  canvas_base_url: "",
  canvas_token_expired: false,
  gradescope_email: null,
  has_gradescope_password: false,
  gradescope_auth_failed: false,
  last_synced_at: null,
  selected_canvas_courses: null,
  selected_gradescope_courses: null,
  selected_pensieve_courses: null,
  has_google_calendar: false,
  google_calendar_id: null,
  google_email: null,
  google_photo_url: null,
  canvas_token_created_at: null,
  is_founding_member: false,
  pensieve_calendar_url: null,
};

/** Shared context so IntegrationSettings and IntegrationClasses use the same credentials state. */
const CredentialsContext = createContext<{
  credentials: IntegrationCredentials;
  loading: boolean;
  handleUpdate: (updated: IntegrationCredentials) => void;
  refresh: () => Promise<void>;
} | null>(null);

/**
 * Hook for consuming the shared credentials context.
 * @returns The credentials context value including refresh function
 * @throws If used outside IntegrationProvider
 */
export function useCredentials() {
  const ctx = useContext(CredentialsContext);
  if (!ctx) throw new Error("useCredentials must be inside IntegrationProvider");
  return ctx;
}

/**
 * Provider that fetches and caches integration credentials.
 * Wrap both IntegrationSettings and IntegrationClasses in this provider
 * so they share the same credential state.
 *
 * @param children - Child components that consume credentials context
 */
export function IntegrationProvider({ children }: { children: React.ReactNode }) {
  const cached = getCachedCredentials();
  const [credentials, setCredentials] = useState<IntegrationCredentials>(
    () => cached ?? EMPTY_CREDENTIALS
  );
  const [loading, setLoading] = useState(!cached);

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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  function handleUpdate(updated: IntegrationCredentials) {
    setCredentials(updated);
    setCachedCredentials(updated);
  }

  return (
    <CredentialsContext.Provider value={{ credentials, loading, handleUpdate, refresh: fetchCredentials }}>
      {children}
    </CredentialsContext.Provider>
  );
}

/**
 * Integration card list (bCourses, Gradescope, Pensieve).
 * Must be rendered inside an IntegrationProvider.
 */
export default function IntegrationSettings() {
  const ctx = useContext(CredentialsContext);
  const { syncing, lastSyncedAt, syncResult } = useTaskContext();

  if (!ctx) throw new Error("IntegrationSettings must be inside IntegrationProvider");
  const { credentials, loading, handleUpdate } = ctx;

  return (
    <div className="space-y-3">
      <CanvasSettings
        credentials={credentials}
        onUpdate={handleUpdate}
        syncing={syncing}
        lastSyncedAt={lastSyncedAt}
        syncedCount={syncResult?.canvas.synced}
        loading={loading}
      />
      <GradescopeSettings
        credentials={credentials}
        onUpdate={handleUpdate}
        syncing={syncing}
        lastSyncedAt={lastSyncedAt}
        syncedCount={syncResult?.gradescope.synced}
        loading={loading}
      />
      <PensieveSettings
        credentials={credentials}
        onUpdate={handleUpdate}
        syncing={syncing}
        lastSyncedAt={lastSyncedAt}
        syncedCount={syncResult?.pensieve.synced}
        loading={loading}
      />
    </div>
  );
}

/**
 * Classes section showing selected courses as chips with edit modal.
 * Must be rendered inside an IntegrationProvider.
 */
export function IntegrationClasses() {
  const ctx = useContext(CredentialsContext);
  if (!ctx) throw new Error("IntegrationClasses must be inside IntegrationProvider");
  const { credentials, handleUpdate } = ctx;

  return <ClassesSection credentials={credentials} onUpdate={handleUpdate} />;
}
