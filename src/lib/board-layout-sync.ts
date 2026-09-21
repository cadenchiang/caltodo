/**
 * Server sync helpers for board layout persistence.
 * Handles fetching and saving board layout to the Supabase API,
 * with debounced writes, retry logic, and error notification.
 * Includes beforeunload/visibilitychange flush to prevent data loss
 * when users close the tab before the debounce fires.
 *
 * @module board-layout-sync
 */

import {
  getKnownLayoutVersion,
  setKnownLayoutVersion,
  withLayoutVersion,
} from "@/lib/board-layout-version";

/** Shape of the server response from GET /api/board-layout. */
interface ServerLayoutResponse {
  layout: Record<string, unknown> | null;
  updatedAt: string | null;
}

/**
 * Result of a server save attempt.
 *
 * @property ok - Whether the save succeeded
 * @property error - Human-readable error message on failure
 * @property stale - True when the server refused the save (409) because the
 *                   row changed since this client last read it
 */
export interface SaveResult {
  ok: boolean;
  error?: string;
  stale?: boolean;
}

/** Delay in ms before retrying a failed save. */
const RETRY_DELAY_MS = 2000;

/**
 * Single-flight + short cache for the board-layout GET. Both HomeBoard and
 * WidgetGrid call useWidgetLayout independently, and React can mount the tree
 * more than once, so without this the same /api/board-layout request fired
 * two+ times in the same tick on first render. Collapsing to one in-flight
 * request (and reusing it for ~5s) removes the duplicate network round-trips.
 */
let layoutInflight: Promise<ServerLayoutResponse> | null = null;
let layoutCache: ServerLayoutResponse | null = null;
let layoutCachedAt = 0;
const LAYOUT_TTL_MS = 5000;

/**
 * Fetches the user's board layout from the server.
 *
 * @returns The layout object and updatedAt timestamp, or null values if none exists.
 *          Returns null layout on fetch failure (non-blocking).
 */
export async function fetchServerLayout(): Promise<ServerLayoutResponse> {
  if (layoutCache && Date.now() - layoutCachedAt < LAYOUT_TTL_MS) {
    return layoutCache;
  }
  if (layoutInflight) return layoutInflight;

  layoutInflight = (async () => {
    try {
      const res = await fetch("/api/board-layout");
      if (!res.ok) {
        console.warn("[board-layout-sync] fetchServerLayout failed:", res.status);
        return { layout: null, updatedAt: null };
      }
      const data: ServerLayoutResponse = await res.json();
      layoutCache = data;
      layoutCachedAt = Date.now();
      // Every save from now on is based on this read.
      setKnownLayoutVersion(data.updatedAt);
      return data;
    } catch (err) {
      console.warn("[board-layout-sync] fetchServerLayout error:", err);
      return { layout: null, updatedAt: null };
    } finally {
      layoutInflight = null;
    }
  })();

  return layoutInflight;
}

/** Invalidate the board-layout cache (call after a local save so the next
 *  fetch reflects the server write). */
export function invalidateServerLayoutCache(): void {
  layoutCache = null;
  layoutCachedAt = 0;
}

/**
 * Saves the board layout to the server via PUT, based on the last known
 * server version. On success the version the server returns becomes the
 * base for the next save.
 *
 * @param data - The full PersistedLayout object (with updatedAt)
 * @returns SaveResult with ok=true on success, ok=false with error message
 *          on failure; `stale` is set when the server refused a save whose
 *          base version is older than the row
 */
export async function saveServerLayout(data: object): Promise<SaveResult> {
  try {
    const res = await fetch("/api/board-layout", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(withLayoutVersion(data)),
    });
    if (!res.ok) {
      const msg = `HTTP ${res.status}`;
      const stale = res.status === 409;
      console.warn("[board-layout-sync] saveServerLayout failed:", msg, stale ? "(stale base version)" : "");
      return { ok: false, error: msg, stale };
    }
    const body = (await res.json().catch(() => null)) as { updatedAt?: string | null } | null;
    if (typeof body?.updatedAt === "string") {
      setKnownLayoutVersion(body.updatedAt);
    } else {
      console.warn("[board-layout-sync] save response carried no updatedAt; the next save will be refused as stale and re-read");
      setKnownLayoutVersion(null);
    }
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error";
    console.warn("[board-layout-sync] saveServerLayout error:", msg);
    return { ok: false, error: msg };
  }
}

/**
 * Module-level error callback for bridging save failures to React (toast).
 * Registered by the hook on mount, cleared on unmount.
 */
let saveErrorHandler: ((error: string) => void) | null = null;

/**
 * Registers a callback to be invoked when a save fails after retry.
 * Pass null to clear the handler (e.g. on hook unmount).
 *
 * @param cb - Error callback or null to clear
 */
export function registerSaveErrorHandler(cb: ((error: string) => void) | null): void {
  saveErrorHandler = cb;
}

/** What the error handler is told when a save is dropped as stale. */
export const STALE_SAVE_MESSAGE = "Board changed on another device";

/**
 * Attempts to save layout to server, retrying once after RETRY_DELAY_MS on failure.
 *
 * Before retrying, the server row is re-read. If its version moved past the
 * one the first attempt was based on, another device saved meanwhile and
 * the retry is dropped rather than sent: sending it would overwrite that
 * newer layout, which is exactly what a delayed retry used to do. The
 * registered error handler is told either way.
 *
 * @param data - The full PersistedLayout object to persist
 */
export async function saveWithRetry(data: object): Promise<void> {
  const baseVersion = getKnownLayoutVersion();
  const first = await saveServerLayout(data);
  if (first.ok) return;

  invalidateServerLayoutCache();
  await fetchServerLayout();
  const currentVersion = getKnownLayoutVersion();
  if (currentVersion !== baseVersion) {
    console.warn("[board-layout-sync] save dropped: server layout changed since last read", {
      baseVersion,
      currentVersion,
      firstError: first.error,
      impact: "local edit kept in cache only; the newer server layout wins",
    });
    if (saveErrorHandler) saveErrorHandler(STALE_SAVE_MESSAGE);
    return;
  }

  // Wait and retry once
  await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  const second = await saveServerLayout(data);
  if (second.ok) return;

  // Both attempts failed; notify via registered handler
  if (saveErrorHandler) {
    saveErrorHandler(second.error ?? "Save failed");
  }
}

/** Timer ID for the debounced save. */
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/** Pending data waiting to be flushed to the server. Null when no save is pending. */
let pendingData: object | null = null;

/**
 * Immediately flushes any pending debounced save using sendBeacon (for tab close)
 * or a regular fetch (for visibility change). Called by beforeunload/visibilitychange.
 * sendBeacon cannot retry — this is best-effort on tab close.
 */
function flushPendingSync(): void {
  if (!pendingData) return;
  const data = pendingData;
  pendingData = null;

  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  // Use fetch with keepalive for reliable delivery during page unload.
  // sendBeacon Blob Content-Type may be stripped by some browsers; fetch preserves headers.
  fetch("/api/board-layout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(withLayoutVersion(data)),
    keepalive: true,
  }).catch(() => {
    // Best-effort on tab close; nothing to retry
  });
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
 * Debounced version of saveWithRetry.
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
    saveWithRetry(data);
  }, 500);
}

/**
 * Decides whether an onLayoutChange event should be persisted to the server.
 *
 * react-grid-layout fires onLayoutChange automatically on mount, before the
 * user has done anything. Persisting that would write a frozen copy of the
 * template-fallback layout into the user's own row, detaching them from
 * future template updates. We therefore persist a layout-change ONLY when
 * both gates are open: initial hydration has completed (so we don't clobber
 * server state with stale defaults) AND the user has genuinely interacted
 * (drag/resize/add/remove/edit) this session.
 *
 * @param hydrationComplete - Whether the initial server fetch has finished
 * @param interacted - Whether the user has made a genuine edit this session
 * @returns true only when both gates are open
 */
export function shouldPersistLayoutChange(
  hydrationComplete: boolean,
  interacted: boolean
): boolean {
  return hydrationComplete && interacted;
}
