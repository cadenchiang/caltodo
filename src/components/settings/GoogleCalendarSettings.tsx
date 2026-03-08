/**
 * Google Calendar integration row card.
 * Compact horizontal layout: logo in gray square, title + description, Connected/Connect badge.
 * Connect triggers OAuth flow; Connected is a static label (disconnect available via calendar header).
 * Detects ?gcal=connected query param to auto-create calendar and sync.
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useCredentials } from "@/components/settings/IntegrationSettings";
import GoogleAuthWarningModal from "./GoogleAuthWarningModal";
import { readSyncStream } from "@/lib/gcal/read-sync-stream";

/**
 * Module-level ref for showToast so sync can fire toasts after navigation.
 * Updated every render by the component.
 */
let globalShowToast: ((msg: string, opts?: Parameters<ReturnType<typeof useToast>["showToast"]>[1]) => void) | null = null;

/** Module-level ref for updateToastProgress so sync can update progress after navigation. */
let globalUpdateProgress: ((progress: number) => void) | null = null;

// readSyncStream is now imported from @/lib/gcal/read-sync-stream

/** Whether a module-level background sync is currently in progress. */
let moduleSyncInProgress = false;
/** Callback to notify the mounted component of sync state changes. */
let onModuleSyncStateChange: ((syncing: boolean, progress: { synced: number; total: number } | null) => void) | null = null;
/** Timestamp of the last auto-sync attempt. Used to enforce a cooldown so we don't retry endlessly on persistent failures. */
let lastAutoSyncAt = 0;
/** Minimum interval (ms) between automatic sync attempts. */
const AUTO_SYNC_COOLDOWN_MS = 5 * 60_000;

/**
 * Runs the initial-sync in the background at module level.
 * Survives component unmount so users can navigate away from the integrations tab.
 * Uses globalShowToast/globalUpdateProgress for toast notifications.
 */
async function runBackgroundSync(): Promise<void> {
  if (moduleSyncInProgress) return;
  moduleSyncInProgress = true;
  onModuleSyncStateChange?.(true, { synced: 0, total: 0 });

  const toast = (msg: string, opts?: Record<string, unknown>) => globalShowToast?.(msg, opts as Parameters<NonNullable<typeof globalShowToast>>[1]);
  const progress = (p: number) => globalUpdateProgress?.(p);

  toast("Syncing missed tasks to Google Calendar...", { progress: 0 });

  try {
    const syncRes = await fetch("/api/gcal/initial-sync", { method: "POST" });
    const contentType = syncRes.headers.get("Content-Type") ?? "";

    if (contentType.includes("application/json")) {
      const result = await syncRes.json();
      progress(100);
      if (syncRes.ok && result.synced === 0 && result.total === 0) {
        toast("All tasks are already synced.");
      } else if (!syncRes.ok) {
        toast(`Sync failed: ${result.error || syncRes.status}`);
      }
      return;
    }

    const finalResult = await readSyncStream(syncRes, {
      onProgress: (synced, total) => {
        onModuleSyncStateChange?.(true, { synced, total });
        if (total > 0) progress(Math.round((synced / total) * 100));
      },
      onDone: () => onModuleSyncStateChange?.(true, null),
    });

    if (!finalResult) {
      progress(100);
      toast("Sync failed: no response stream.");
      return;
    }

    if (finalResult.synced > 0) {
      const msg = finalResult.synced === finalResult.total
        ? `Synced ${finalResult.synced} task${finalResult.synced === 1 ? "" : "s"} to Google Calendar.`
        : `Synced ${finalResult.synced} of ${finalResult.total} tasks to Google Calendar.`;
      toast(msg);
    } else if (finalResult.total > 0) {
      toast(`Sync failed for all ${finalResult.total} tasks. Check your Google Calendar permissions.`);
    } else {
      toast("All tasks are already synced.");
    }
  } catch (err) {
    console.error("Background sync error:", err);
    progress(100);
    toast("Failed to sync tasks. Please try again.");
  } finally {
    moduleSyncInProgress = false;
    onModuleSyncStateChange?.(false, null);
  }
}

/**
 * Inline Google Calendar logo SVG for brand recognition.
 *
 * @param size - Icon dimensions in pixels (default 16)
 */
function GoogleCalendarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 122.88 122.88"
      className="inline-block shrink-0"
    >
      <polygon points="93.78,29.1 29.1,29.1 29.1,93.78 93.78,93.78" fill="#fff" />
      <polygon points="93.78,122.88 122.88,93.78 93.78,93.78" fill="#EA4335" />
      <polygon points="122.88,29.1 93.78,29.1 93.78,93.78 122.88,93.78" fill="#FBBC04" />
      <polygon points="93.78,93.78 29.1,93.78 29.1,122.88 93.78,122.88" fill="#34A853" />
      <path d="M0,93.78v19.4c0,5.36,4.34,9.7,9.7,9.7h19.4v-29.1H0z" fill="#188038" />
      <path d="M122.88,29.1V9.7c0-5.36-4.34-9.7-9.7-9.7h-19.4v29.1H122.88z" fill="#1967D2" />
      <path d="M93.78,0H9.7C4.34,0,0,4.34,0,9.7v84.08h29.1V29.1h64.67V0z" fill="#4285F4" />
      <path d="M42.37,79.27c-2.42-1.63-4.09-4.02-5-7.17l5.61-2.31c0.51,1.94,1.4,3.44,2.67,4.51c1.26,1.07,2.8,1.59,4.59,1.59c1.84,0,3.41-0.56,4.73-1.67c1.32-1.12,1.98-2.54,1.98-4.26c0-1.76-0.7-3.2-2.09-4.32c-1.39-1.12-3.14-1.67-5.22-1.67H46.4v-5.55h2.91c1.79,0,3.31-0.48,4.54-1.46c1.23-0.97,1.84-2.3,1.84-3.99c0-1.5-0.55-2.7-1.65-3.6s-2.49-1.35-4.18-1.35c-1.65,0-2.96,0.44-3.93,1.32c-0.97,0.88-1.7,2-2.12,3.24l-5.55-2.31c0.74-2.09,2.09-3.93,4.07-5.52c1.98-1.59,4.51-2.39,7.58-2.39c2.27,0,4.32,0.44,6.13,1.32c1.81,0.88,3.23,2.1,4.26,3.65c1.03,1.56,1.54,3.31,1.54,5.25c0,1.98-0.48,3.65-1.43,5.03c-0.95,1.37-2.13,2.43-3.52,3.16v0.33c1.79,0.74,3.36,1.96,4.51,3.52c1.17,1.58,1.76,3.46,1.76,5.66c0,2.2-0.56,4.16-1.67,5.88c-1.12,1.72-2.66,3.08-4.62,4.07c-1.96,0.99-4.17,1.49-6.62,1.49C47.41,81.72,44.79,80.91,42.37,79.27z" fill="#1A73E8" />
      <path d="M76.83,51.43l-6.16,4.45l-3.08-4.67l11.05-7.97h4.24v37.6h-6.05V51.43z" fill="#1A73E8" />
    </svg>
  );
}

/** localStorage key for caching GCal connection state (used by sidebar/header). */
const GCAL_CACHE_KEY = "gcal_status";

export default function GoogleCalendarSettings() {
  const { showToast, updateToastProgress } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { credentials, refresh } = useCredentials();

  // Derive GCal state from the shared credentials context
  const connected = !!credentials.has_google_calendar;
  const googleEmail = credentials.google_email ?? null;
  const selectedCalendarId = credentials.google_calendar_id ?? null;

  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ synced: number; total: number } | null>(null);
  // Local override for connected state during OAuth flow (before context refreshes)
  const [oauthConnecting, setOauthConnecting] = useState(false);
  /** Whether the user's token lacks write scope and needs reconnection. */
  const [needsReconnect, setNeedsReconnect] = useState(false);
  const mountedRef = useRef(true);

  globalShowToast = showToast;
  globalUpdateProgress = updateToastProgress;
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Keep the gcal_status localStorage cache in sync for sidebar/header
  useEffect(() => {
    try {
      localStorage.setItem(GCAL_CACHE_KEY, JSON.stringify({
        connected,
        calendarId: selectedCalendarId,
        email: googleEmail,
        photoUrl: credentials.google_photo_url ?? null,
      }));
    } catch { /* ignore quota errors */ }
  }, [connected, selectedCalendarId, googleEmail, credentials.google_photo_url]);

  function toast(msg: string, opts?: Parameters<typeof showToast>[1]) {
    (globalShowToast ?? showToast)(msg, opts);
  }

  function toastProgress(progress: number) {
    (globalUpdateProgress ?? updateToastProgress)(progress);
  }

  function ifMounted<T>(setter: React.Dispatch<React.SetStateAction<T>>, value: NoInfer<T>) {
    if (mountedRef.current) setter(value);
  }

  // Check if existing token has write scope — prompt reconnect if read-only
  useEffect(() => {
    if (!connected || oauthConnecting) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/gcal/check-scope");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled && mountedRef.current && data.needsReconnect) {
          setNeedsReconnect(true);
        }
      } catch { /* network error — ignore */ }
    })();
    return () => { cancelled = true; };
  }, [connected, oauthConnecting]);

  // Auto-sync unsynced tasks on mount — no manual banner needed.
  // Skips if already syncing, during OAuth setup, or within cooldown.
  useEffect(() => {
    if (!connected || oauthConnecting || moduleSyncInProgress) return;
    if (Date.now() - lastAutoSyncAt < AUTO_SYNC_COOLDOWN_MS) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/gcal/unsynced-count");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled && mountedRef.current && data.count > 0 && !moduleSyncInProgress) {
          lastAutoSyncAt = Date.now();
          setSyncing(true);
          setSyncProgress({ synced: 0, total: 0 });
          runBackgroundSync();
        }
      } catch { /* network error — ignore silently */ }
    })();
    return () => { cancelled = true; };
  }, [connected, oauthConnecting]);

  // Register module-level sync callback so sync survives navigation away
  useEffect(() => {
    if (moduleSyncInProgress) {
      setSyncing(true);
    }
    onModuleSyncStateChange = (isSyncing, progress) => {
      if (mountedRef.current) {
        setSyncing(isSyncing);
        setSyncProgress(progress);
      }
    };
    return () => { onModuleSyncStateChange = null; };
  }, []);

  async function autoSetupCalendar() {
    setSyncing(true);
    toast("Setting up Google Calendar...", { progress: 0 });
    try {
      await refresh();
      // Fetch available calendars and select them (max 10 per route validation)
      const calListRes = await fetch("/api/gcal/calendars?all=true");
      let calendarIds = ["primary"];
      if (calListRes.ok) {
        const calData = await calListRes.json();
        if (calData.calendars && calData.calendars.length > 0) {
          calendarIds = calData.calendars.map((c: { id: string }) => c.id).slice(0, 10);
        }
      }
      const selectRes = await fetch("/api/gcal/select-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calendarIds }),
      });
      if (!selectRes.ok) {
        const err = await selectRes.json();
        toast(`Failed to set up calendar: ${err.error || selectRes.status}`);
        return;
      }
      const selectResult = await selectRes.json();
      const gcalUrl = googleEmail
        ? `https://calendar.google.com/calendar/r?authuser=${encodeURIComponent(googleEmail)}`
        : "https://calendar.google.com";
      const openAction = {
        action: {
          label: "Open",
          icon: <ExternalLink size={14} />,
          onClick: () => window.open(gcalUrl, "_blank"),
        },
      };
      if (selectResult.needsSync) {
        ifMounted(setSyncProgress, { synced: 0, total: 0 });
        toast("Syncing tasks to Google Calendar...", { progress: 0 });
        const syncRes = await fetch("/api/gcal/initial-sync", { method: "POST" });
        const contentType = syncRes.headers.get("Content-Type") ?? "";
        if (contentType.includes("application/json")) {
          const syncResult = await syncRes.json();
          if (syncRes.ok && syncResult.synced === 0 && syncResult.total === 0) {
            toast("Calendar created! No tasks with due dates to sync.", openAction);
            window.open(gcalUrl, "_blank");
          } else if (!syncRes.ok) {
            toast(`Sync failed: ${syncResult.error || syncRes.status}`);
          }
          /* sync complete */
          return;
        }
        const finalResult = await readSyncStream(syncRes, {
          onProgress: (synced, total) => {
            ifMounted(setSyncProgress, { synced, total });
            if (total > 0) toastProgress(Math.round((synced / total) * 100));
          },
          onDone: () => ifMounted(setSyncProgress, null),
        });
        if (!finalResult) { toast("Sync failed: no response stream."); return; }
        if (finalResult && finalResult.synced > 0) {
          const msg = finalResult.synced === finalResult.total
            ? `Synced ${finalResult.synced} task${finalResult.synced === 1 ? "" : "s"} to Google Calendar. New tasks will sync automatically.`
            : `Synced ${finalResult.synced} of ${finalResult.total} tasks to Google Calendar. New tasks will sync automatically.`;
          toast(msg, openAction);
          window.open(gcalUrl, "_blank");
        } else if (finalResult && finalResult.total > 0 && finalResult.synced === 0) {
          toast(`Sync failed for all ${finalResult.total} tasks. Check your Google Calendar permissions.`);
        } else if (finalResult && finalResult.total === 0) {
          toast("Google Calendar connected! No tasks to sync yet — new tasks will sync automatically.", openAction);
          window.open(gcalUrl, "_blank");
        }
        /* sync complete */
      } else {
        toast("Google Calendar connected! New tasks will sync automatically.", openAction);
        /* sync complete */
        window.open(gcalUrl, "_blank");
      }
    } catch (err) {
      console.error("Auto-setup calendar error:", err);
      toast("Failed to set up calendar. Please try again.");
    } finally {
      ifMounted(setSyncing, false);
      ifMounted(setSyncProgress, null);
      ifMounted(setOauthConnecting, false);
      // Refresh shared context so all cards reflect updated state
      await refresh();
      // Notify sidebar/header to update GCal badge in the same tab
      try {
        window.dispatchEvent(new CustomEvent("gcal-status-change", { detail: { connected: true } }));
      } catch { /* ignore SSR */ }
      // Navigate back to integrations section after sync completes
      router.replace("/app/settings?section=integrations");
    }
  }

  useEffect(() => {
    const gcalParam = searchParams.get("gcal");
    // Skip auto-setup if running inside a popup — the opener window handles it
    if (window.opener) return;
    if (gcalParam === "connected") {
      setOauthConnecting(true);
      autoSetupCalendar();
      const url = new URL(window.location.href);
      url.searchParams.delete("gcal");
      window.history.replaceState({}, "", url.toString());
    } else if (gcalParam === "error") {
      const reason = searchParams.get("reason");
      const messages: Record<string, string> = {
        denied: "Google Calendar access was denied.",
        csrf: "Security check failed. Please try again.",
        token_exchange: "Failed to connect. Please try again.",
        missing_tokens: "Failed to get tokens from Google. Please try again.",
        config: "Google Calendar is not configured on this server.",
        storage: "Failed to save connection. Please try again.",
      };
      showToast(messages[reason ?? ""] ?? "Failed to connect Google Calendar.");
      const url = new URL(window.location.href);
      url.searchParams.delete("gcal");
      url.searchParams.delete("reason");
      window.history.replaceState({}, "", url.toString());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, showToast]);

  /**
   * Disconnects Google Calendar via API.
   * Clears local state/cache and shows confirmation toast.
   */
  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      await fetch("/api/gcal/disconnect", { method: "POST" });
      try { localStorage.removeItem(GCAL_CACHE_KEY); } catch { /* ignore */ }
      await refresh();
      // Notify header/sidebar to update GCal badge
      try {
        window.dispatchEvent(new CustomEvent("gcal-status-change", { detail: { connected: false } }));
      } catch { /* ignore SSR */ }
      showToast("Google Calendar disconnected.");
    } catch {
      showToast("Failed to disconnect Google Calendar.");
    } finally {
      setDisconnecting(false);
    }
  }

  /**
   * Shows the auth warning modal before starting the OAuth flow.
   */
  function handleConnect() {
    setShowAuthWarning(true);
  }

  /**
   * Proceeds with OAuth after user acknowledges the warning.
   * Desktop: opens Google OAuth in a centered popup, polls for completion.
   * Mobile: falls back to full-page redirect.
   */
  function handleConfirmConnect() {
    setShowAuthWarning(false);
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;

    if (!isDesktop) {
      window.location.href = "/api/gcal/auth";
      return;
    }

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      "/api/gcal/auth",
      "gcal-auth",
      `width=${width},height=${height},left=${left},top=${top},popup=true`
    );

    if (!popup || popup.closed) {
      // Popup blocked — fall back to full redirect
      window.location.href = "/api/gcal/auth";
      return;
    }

    /**
     * Polls the popup URL until it navigates back to our origin with
     * ?gcal=connected or ?gcal=error, then closes the popup and handles the result.
     */
    const pollId = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          clearInterval(pollId);
          return;
        }

        const popupUrl = popup.location.href;

        if (popupUrl.includes("gcal=connected")) {
          clearInterval(pollId);
          popup.close();
          setOauthConnecting(true);
          autoSetupCalendar();
        } else if (popupUrl.includes("gcal=error")) {
          clearInterval(pollId);
          popup.close();
          const url = new URL(popupUrl);
          const reason = url.searchParams.get("reason");
          const messages: Record<string, string> = {
            denied: "Google Calendar access was denied.",
            csrf: "Security check failed. Please try again.",
            token_exchange: "Failed to connect. Please try again.",
            missing_tokens: "Failed to get tokens from Google. Please try again.",
            config: "Google Calendar is not configured on this server.",
            storage: "Failed to save connection. Please try again.",
          };
          showToast(messages[reason ?? ""] ?? "Failed to connect Google Calendar.");
        }
      } catch {
        // Cross-origin — popup is still on Google domain, keep polling
      }
    }, 300);
  }

  const isConnectedOrConnecting = connected || oauthConnecting;

  return (
    <>
      <div className="rounded-2xl border border-border bg-card shadow-sm dark:shadow-none overflow-hidden">
        <div className="flex items-center gap-3.5 px-4 py-3.5">
          {/* Logo */}
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <GoogleCalendarIcon size={20} />
          </div>
          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">Google Calendar</p>
              <span className="text-[9px] font-medium text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded-full leading-none">
                Real-time
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {isConnectedOrConnecting && googleEmail
                ? googleEmail
                : "Sync tasks to Google Calendar in real time"}
            </p>
          </div>
          {/* Status */}
          {isConnectedOrConnecting ? (
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              aria-label="Disconnect Google Calendar"
              className="group min-w-[84px] text-xs font-medium px-3 py-1 rounded-lg shrink-0 border transition-colors cursor-pointer disabled:opacity-60
                text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30
                hover:text-red-500 hover:border-red-300 hover:bg-red-50 dark:hover:text-red-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10"
            >
              <span className="group-hover:hidden">{disconnecting ? "..." : "Connected"}</span>
              <span className="hidden group-hover:inline">Disconnect</span>
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="text-xs font-semibold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors shrink-0 cursor-pointer"
            >
              Connect
            </button>
          )}
        </div>

        {/* Reconnect banner — shown when token has read-only scope */}
        {needsReconnect && isConnectedOrConnecting && (
          <div className="mx-4 mb-3 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
            <p className="text-xs text-amber-800 dark:text-amber-300 mb-1.5">
              Please reconnect to enable task syncing to Google Calendar.
            </p>
            <button
              onClick={async () => {
                setNeedsReconnect(false);
                await handleDisconnect();
                handleConnect();
              }}
              className="text-xs font-medium text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 underline underline-offset-2 cursor-pointer"
            >
              Reconnect now
            </button>
          </div>
        )}

        {/* Sync progress bar at bottom of card */}
        {syncing && (
          <div className="h-1 w-full bg-muted overflow-hidden">
            {syncProgress && syncProgress.total > 0 ? (
              <div
                className="h-full bg-blue-500 transition-all duration-700 ease-out"
                style={{ width: `${Math.round((syncProgress.synced / syncProgress.total) * 100)}%` }}
              />
            ) : (
              <div className="h-full w-1/3 bg-blue-500 rounded-full animate-sync-bar" />
            )}
          </div>
        )}
      </div>

      <GoogleAuthWarningModal
        open={showAuthWarning}
        onContinue={handleConfirmConnect}
        onCancel={() => setShowAuthWarning(false)}
      />
    </>
  );
}
