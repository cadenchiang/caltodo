/**
 * Server sync helpers for board layout persistence.
 * Handles fetching and saving board layout to the Supabase API,
 * with debounced writes to batch rapid mutations.
 * Includes beforeunload/visibilitychange flush to prevent data loss
 * when users close the tab before the debounce fires.
 *
 * @module board-layout-sync
 */

/** Shape of the server response from GET /api/board-layout. */
interface ServerLayoutResponse {
  layout: Record<string, unknown> | null;
  updatedAt: string | null;
}

/**
 * Fetches the user's board layout from the server.
 *
 * @returns The layout object and updatedAt timestamp, or null values if none exists.
 *          Returns null layout on fetch failure (non-blocking).
 */
export async function fetchServerLayout(): Promise<ServerLayoutResponse> {
  try {
    const res = await fetch("/api/board-layout");
    if (!res.ok) {
      console.warn("[board-layout-sync] fetchServerLayout failed:", res.status);
      return { layout: null, updatedAt: null };
    }
    return await res.json();
  } catch (err) {
    console.warn("[board-layout-sync] fetchServerLayout error:", err);
    return { layout: null, updatedAt: null };
  }
}

/**
 * Saves the board layout to the server via PUT.
 * Fire-and-forget — errors are logged but not thrown.
 *
 * @param data - The full PersistedLayout object (with updatedAt)
 */
export async function saveServerLayout(data: object): Promise<void> {
  try {
    const res = await fetch("/api/board-layout", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      console.warn("[board-layout-sync] saveServerLayout failed:", res.status);
    }
  } catch (err) {
    console.warn("[board-layout-sync] saveServerLayout error:", err);
  }
}

/** Timer ID for the debounced save. */
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/** Pending data waiting to be flushed to the server. Null when no save is pending. */
let pendingData: object | null = null;

/**
 * Immediately flushes any pending debounced save using sendBeacon (for tab close)
 * or a regular fetch (for visibility change). Called by beforeunload/visibilitychange.
 */
function flushPendingSync(): void {
  if (!pendingData) return;
  const data = pendingData;
  pendingData = null;

  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  // sendBeacon is reliable during page unload; fetch may be cancelled by the browser
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    navigator.sendBeacon("/api/board-layout", blob);
  } else {
    // Fallback: fire-and-forget fetch (may not complete on unload)
    saveServerLayout(data);
  }
}

/** Register flush listeners once (module-level singleton). */
let listenersRegistered = false;
function registerFlushListeners(): void {
  if (listenersRegistered || typeof window === "undefined") return;
  listenersRegistered = true;

  window.addEventListener("beforeunload", flushPendingSync);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushPendingSync();
    }
  });
}

/**
 * Debounced version of saveServerLayout.
 * Batches rapid mutations (e.g. widget dragging) into a single API call.
 * Uses a 500ms debounce window. Pending data is flushed on tab close
 * or visibility change to prevent data loss.
 *
 * @param data - The full layout object to persist
 */
export function debouncedServerSave(data: object): void {
  registerFlushListeners();
  pendingData = data;

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    pendingData = null;
    saveServerLayout(data);
  }, 500);
}
