"use client";

import { createContext, useContext, useState, useEffect, useLayoutEffect, useCallback } from "react";
import type { IntegrationCredentials } from "@/lib/types";
import { useTaskContext } from "@/contexts/TaskContext";
import CanvasSettings from "./CanvasSettings";
import CanvasGenericCard from "./CanvasGenericCard";
import GradescopeSettings from "./GradescopeSettings";
import PensieveSettings from "./PensieveSettings";
import AdditionalCanvasCard from "./AdditionalCanvasCard";
import ClassesSection from "./ClassesSection";

const CACHE_KEY = "caltodo_credentials_cache";

/**
 * `useLayoutEffect` runs synchronously after commit but before the browser
 * paints, so cached state appears on the first frame (no flash). On the
 * server it's a no-op — we fall back to `useEffect` to avoid the SSR
 * warning.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
  canvas_ical_url: null,
  canvas_token_expired: false,
  gradescope_email: null,
  has_gradescope_password: false,
  gradescope_auth_failed: false,
  last_synced_at: null,
  selected_canvas_courses: null,
  selected_gradescope_courses: null,
  selected_pensieve_courses: null,
  dismissed_canvas_course_ids: [],
  has_google_calendar: false,
  google_auth_failed: false,
  google_calendar_id: null,
  google_email: null,
  google_photo_url: null,
  canvas_token_created_at: null,
  is_founding_member: false,
  pensieve_calendar_url: null,
  brightspace_calendar_url: null,
  additional_canvas_accounts: [],
  has_completed_onboarding: false,
  email_digest_enabled: true,
  email_digest_hour: 15,
  email_digest_address: null,
  dismissed_modals: {},
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
  // Always start with EMPTY_CREDENTIALS to avoid hydration mismatch
  // (localStorage is unavailable during SSR). Cache is restored in useEffect.
  const [credentials, setCredentials] = useState<IntegrationCredentials>(EMPTY_CREDENTIALS);
  const [loading, setLoading] = useState(true);

  const fetchCredentials = useCallback(async () => {
    setLoading(true);
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

  // Hydrate cached credentials synchronously before first paint so fields
  // like the connected account email appear instantly rather than flashing
  // blank for a frame.
  useIsomorphicLayoutEffect(() => {
    const cached = getCachedCredentials();
    if (cached) setCredentials(cached);
  }, []);

  useEffect(() => {
    // Refresh from the server in the background. The cached paint above
    // already gave the user something to look at.
    fetchCredentials();
  }, [fetchCredentials]);

  // Warm the browser cache for every integration logo as soon as the
  // provider mounts. Without this, each card's <img> request fires only
  // when the card itself mounts, which produced a visibly staggered
  // "popping in" effect across the integration list.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const logos = [
      "/bcourses-logo.png",
      "/gradescope-logo.png",
      "/pensieve-logo.png",
      "/canvas-logo.png",
    ];
    for (const src of logos) {
      const img = new window.Image();
      img.src = src;
    }
  }, []);

  // Re-fetch credentials whenever something signals that integration
  // state may have changed: a sync completion, the GCal OAuth callback,
  // the page regaining focus after returning from OAuth, or storage
  // updates from a sibling tab. These signals make the connected pill
  // flip from "Connect" to "Connected" within ~one tick of the change
  // landing on the server instead of waiting for the next manual refresh.
  useEffect(() => {
    const refresh = () => fetchCredentials();
    const handleFocus = () => fetchCredentials();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CACHE_KEY || e.key === null) fetchCredentials();
    };
    window.addEventListener("credentials-changed", refresh);
    window.addEventListener("gcal-status-change", refresh);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("credentials-changed", refresh);
      window.removeEventListener("gcal-status-change", refresh);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
    };
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
  const { credentials, handleUpdate } = ctx;

  return (
    <div className="space-y-3">
      <CanvasSettings
        credentials={credentials}
        onUpdate={handleUpdate}
        syncing={syncing}
        lastSyncedAt={lastSyncedAt}
        syncedCount={syncResult?.canvas.synced}
      />
      {/* Additional Canvas accounts */}
      {(credentials.additional_canvas_accounts ?? []).map((account) => (
        <AdditionalCanvasCard
          key={account.id}
          account={account}
          credentials={credentials}
          onUpdate={handleUpdate}
        />
      ))}
      <GradescopeSettings
        credentials={credentials}
        onUpdate={handleUpdate}
        syncing={syncing}
        lastSyncedAt={lastSyncedAt}
        syncedCount={syncResult?.gradescope.synced}
      />
      <PensieveSettings
        credentials={credentials}
        onUpdate={handleUpdate}
        syncing={syncing}
        lastSyncedAt={lastSyncedAt}
        syncedCount={syncResult?.pensieve.synced}
      />
      <CanvasGenericCard />
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
