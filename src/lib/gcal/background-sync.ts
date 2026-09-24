/**
 * Module-level Google Calendar background sync.
 *
 * Lives outside any component so a sync started from the settings card keeps
 * running when the user navigates away. The card publishes its toast helpers
 * here on every render and reads the in-progress flags before starting a new
 * run.
 *
 * @module gcal/background-sync
 */

import { readSyncStream } from "@/lib/gcal/read-sync-stream";

/** Toast options the sync passes through to the card's showToast. */
export interface SyncToastOptions {
  progress?: number;
  [key: string]: unknown;
}

/** The card's toast helpers, published each render. */
export interface SyncToastHandlers {
  showToast: (message: string, options?: SyncToastOptions) => void;
  updateProgress: (progress: number) => void;
}

/** Minimum interval between automatic sync attempts. */
export const AUTO_SYNC_COOLDOWN_MS = 5 * 60_000;

/** Consecutive failures after which auto-sync stops retrying. */
export const MAX_AUTO_SYNC_FAILURES = 1;

let handlers: SyncToastHandlers | null = null;
let syncInProgress = false;
let syncSilent = false;
let lastAutoSyncAt = 0;
let consecutiveFailures = 0;

/**
 * Publishes the mounted card's toast helpers. Deliberately never cleared on
 * unmount: the whole point is that a sync outlives the card.
 *
 * @param next - The card's showToast and updateToastProgress
 */
export function publishSyncToastHandlers(next: SyncToastHandlers): void {
  handlers = next;
}

/**
 * Shows a toast through the published handlers, or the fallback when the
 * card has never mounted.
 *
 * @param fallback - Used when nothing has been published yet
 * @param message - Toast text
 * @param options - Toast options
 */
export function syncToast(
  fallback: SyncToastHandlers["showToast"],
  message: string,
  options?: SyncToastOptions
): void {
  (handlers?.showToast ?? fallback)(message, options);
}

/** @returns True while a background sync is running. */
export function isSyncInProgress(): boolean {
  return syncInProgress;
}

/**
 * Whether an automatic sync may start now.
 *
 * @returns False while one runs, inside the cooldown, or after too many failures
 */
export function canAutoSync(): boolean {
  if (syncInProgress) return false;
  if (Date.now() - lastAutoSyncAt < AUTO_SYNC_COOLDOWN_MS) return false;
  return consecutiveFailures < MAX_AUTO_SYNC_FAILURES;
}

/** Records that an automatic sync attempt is starting. */
export function markAutoSyncAttempt(): void {
  lastAutoSyncAt = Date.now();
}

/**
 * Resets the module state. Test-only.
 */
export function resetBackgroundSyncState(): void {
  handlers = null;
  syncInProgress = false;
  syncSilent = false;
  lastAutoSyncAt = 0;
  consecutiveFailures = 0;
}

/**
 * Runs the initial-sync in the background. Survives component unmount.
 * When silent (auto-sync), no toasts are shown.
 *
 * @param silent - Suppress toasts (used for auto-sync)
 * @remarks A second call while one is running is a no-op.
 */
export async function runBackgroundSync(silent = false): Promise<void> {
  if (syncInProgress) return;
  syncInProgress = true;
  syncSilent = silent;

  const toast = (msg: string, opts?: SyncToastOptions) => {
    if (!silent) handlers?.showToast(msg, opts);
  };
  const progress = (p: number) => {
    if (!silent) handlers?.updateProgress(p);
  };

  toast("Syncing tasks to Google Calendar...", { progress: 0 });

  try {
    const syncRes = await fetch("/api/gcal/initial-sync", { method: "POST" });
    const contentType = syncRes.headers.get("Content-Type") ?? "";

    if (contentType.includes("application/json")) {
      const result = await syncRes.json();
      progress(100);
      if (syncRes.ok && result.synced === 0 && result.total === 0) {
        consecutiveFailures = 0;
        toast("All tasks are already synced.");
      } else if (!syncRes.ok) {
        consecutiveFailures++;
        toast(`Sync failed: ${result.error || syncRes.status}`, { variant: "error" });
      }
      return;
    }

    const finalResult = await readSyncStream(syncRes, {
      onProgress: (synced, total) => {
        if (total > 0) progress(Math.round((synced / total) * 100));
      },
      onDone: () => {},
    });

    if (!finalResult) {
      progress(100);
      consecutiveFailures++;
      toast("Sync failed: no response stream.", { variant: "error" });
      return;
    }

    if (finalResult.partial) {
      // The server stopped at its time budget, not on an error. Leave the
      // failure counter alone so the next visit continues with the rest.
      consecutiveFailures = 0;
      toast(
        `Synced ${finalResult.synced} of ${finalResult.total} tasks to Google Calendar so far. ` +
          `The remaining ${finalResult.remaining ?? finalResult.total - finalResult.synced} will continue next time.`
      );
    } else if (finalResult.synced > 0) {
      consecutiveFailures = 0;
      toast(
        finalResult.synced === finalResult.total
          ? `Synced ${finalResult.synced} task${finalResult.synced === 1 ? "" : "s"} to Google Calendar.`
          : `Synced ${finalResult.synced} of ${finalResult.total} tasks to Google Calendar.`
      );
    } else if (finalResult.total > 0) {
      consecutiveFailures++;
      toast(`Sync failed for all ${finalResult.total} tasks. Check your Google Calendar permissions.`, {
        variant: "error",
      });
    } else {
      consecutiveFailures = 0;
      toast("All tasks are already synced.");
    }
  } catch (err) {
    console.error("gcal/background-sync: request failed", {
      error: err instanceof Error ? err.message : String(err),
      impact: "no tasks were pushed this run; auto-sync backs off",
    });
    consecutiveFailures++;
    progress(100);
    toast("Failed to sync tasks. Please try again.", { variant: "error" });
  } finally {
    syncInProgress = false;
    syncSilent = false;
  }
}

/** @returns True while the running sync is a silent auto-sync. */
export function isSyncSilent(): boolean {
  return syncSilent;
}
