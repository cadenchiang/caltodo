/**
 * Settings component for Google Calendar API integration.
 *
 * States:
 * - Not connected: "Connect Google Calendar" button
 * - Connected, syncing: Progress bar with "Setting up..." indicator
 * - Connected with calendar: Status badge, account info, "View" link, "Disconnect"
 * - Detects ?gcal=connected query param to auto-create calendar and sync
 * - Shows progress bar during initial GCal sync via NDJSON streaming
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Check, XCircle, Unlink, ExternalLink } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

/**
 * Module-level ref for showToast so sync can fire toasts after navigation.
 * Updated every render by the component.
 */
let globalShowToast: ((msg: string, opts?: Parameters<ReturnType<typeof useToast>["showToast"]>[1]) => void) | null = null;

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

/** localStorage key for caching GCal connection state. */
const GCAL_CACHE_KEY = "gcal_status";

/** Reads cached GCal status from localStorage for instant render. */
function getCachedStatus(): {
  connected: boolean;
  calendarId: string | null;
  email: string | null;
  photoUrl: string | null;
} {
  try {
    const raw = localStorage.getItem(GCAL_CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { connected: false, calendarId: null, email: null, photoUrl: null };
}

export default function GoogleCalendarSettings() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [googlePhotoUrl, setGooglePhotoUrl] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<{ synced: number; total: number } | null>(null);
  const [syncComplete, setSyncComplete] = useState(false);
  const mountedRef = useRef(true);

  // Keep global toast ref updated so sync can fire toasts after navigation
  globalShowToast = showToast;
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Hydrate from localStorage cache immediately on mount (client-only)
  useEffect(() => {
    const cached = getCachedStatus();
    setConnected(cached.connected);
    setSelectedCalendarId(cached.calendarId);
    setGoogleEmail(cached.email);
    setGooglePhotoUrl(cached.photoUrl);
    setLoading(false);
  }, []);

  /**
   * Fetches Google Calendar connection status from credentials API.
   */
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/credentials");
      if (res.ok) {
        const data = await res.json();
        const isConnected = !!data.has_google_calendar;
        setConnected(isConnected);
        setSelectedCalendarId(data.google_calendar_id ?? null);
        setGoogleEmail(data.google_email ?? null);
        setGooglePhotoUrl(data.google_photo_url ?? null);

        // Cache for instant render on next visit
        try {
          localStorage.setItem(GCAL_CACHE_KEY, JSON.stringify({
            connected: isConnected,
            calendarId: data.google_calendar_id ?? null,
            email: data.google_email ?? null,
            photoUrl: data.google_photo_url ?? null,
          }));
        } catch { /* ignore quota errors */ }
      }
    } catch {
      // Non-critical — default to not connected
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  /**
   * Automatically creates a "caltodo" calendar and syncs all tasks with due dates.
   * Called after OAuth redirect when ?gcal=connected is detected.
   * Shows a "View in Google Calendar" link on completion instead of
   * using window.open (which gets blocked by popup blockers).
   */
  /**
   * Helper: fire toast via globalShowToast (survives navigation) or local fallback.
   */
  function toast(msg: string, opts?: Parameters<typeof showToast>[1]) {
    (globalShowToast ?? showToast)(msg, opts);
  }

  /** Helper: only update state if component is still mounted. */
  function ifMounted<T>(setter: React.Dispatch<React.SetStateAction<T>>, value: NoInfer<T>) {
    if (mountedRef.current) setter(value);
  }

  async function autoSetupCalendar() {
    setSyncing(true);
    setSyncComplete(false);
    try {
      await fetchStatus();

      const selectRes = await fetch("/api/gcal/select-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calendarId: "create_new" }),
      });

      if (!selectRes.ok) {
        const err = await selectRes.json();
        toast(`Failed to create calendar: ${err.error || selectRes.status}`);
        return;
      }

      const selectResult = await selectRes.json();
      ifMounted(setSelectedCalendarId, selectResult.calendarId);

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
        // Show progress bar immediately so user knows sync is starting
        ifMounted(setSyncProgress, { synced: 0, total: 0 });

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
          ifMounted(setSyncComplete, true);
          return;
        }

        const reader = syncRes.body?.getReader();
        if (!reader) {
          toast("Sync failed: no response stream.");
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let finalResult: { synced: number; total: number; errors: string[] } | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // Flush decoder and process any remaining buffered data
            buffer += decoder.decode();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const event = JSON.parse(line);
              if (event.type === "start" || event.type === "progress") {
                ifMounted(setSyncProgress, { synced: event.synced ?? 0, total: event.total });
              } else if (event.type === "done") {
                finalResult = event;
                ifMounted(setSyncProgress, null);
              }
            } catch {
              // Skip malformed lines
            }
          }
        }

        // Process any remaining data left in the buffer after stream closed
        if (buffer.trim()) {
          try {
            const event = JSON.parse(buffer);
            if (event.type === "done") {
              finalResult = event;
              ifMounted(setSyncProgress, null);
            }
          } catch {
            // Skip malformed data
          }
        }

        if (finalResult && finalResult.synced > 0) {
          toast(
            `Synced ${finalResult.synced} of ${finalResult.total} task${finalResult.total === 1 ? "" : "s"} to Google Calendar.`,
            openAction
          );
          window.open(gcalUrl, "_blank");
        } else if (finalResult && finalResult.total > 0 && finalResult.synced === 0) {
          toast(`Sync failed for all ${finalResult.total} tasks. Check your Google Calendar permissions.`);
        } else if (finalResult && finalResult.total === 0) {
          toast("Calendar created! No tasks with due dates to sync.", openAction);
          window.open(gcalUrl, "_blank");
        }

        ifMounted(setSyncComplete, true);
      } else {
        toast("Calendar created.", openAction);
        ifMounted(setSyncComplete, true);
        window.open(gcalUrl, "_blank");
      }
    } catch (err) {
      console.error("Auto-setup calendar error:", err);
      toast("Failed to set up calendar. Please try again.");
    } finally {
      ifMounted(setSyncing, false);
      ifMounted(setSyncProgress, null);
    }
  }

  /**
   * Handles initial connection after OAuth redirect.
   * Triggered when ?gcal=connected is in the URL.
   * Auto-creates a "caltodo" calendar and syncs all tasks.
   */
  useEffect(() => {
    const gcalParam = searchParams.get("gcal");

    if (gcalParam === "connected") {
      setConnected(true);
      setLoading(false);
      showToast("Google Calendar connected! Setting up...");

      autoSetupCalendar();

      // Clean up URL param
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
   * Disconnects Google Calendar with double-click confirmation.
   */
  function handleDisconnect() {
    if (!confirmDisconnect) {
      setConfirmDisconnect(true);
      setTimeout(() => setConfirmDisconnect(false), 3000);
      return;
    }
    setConfirmDisconnect(false);

    // Optimistic: update UI instantly, fire API in background
    setConnected(false);
    setSelectedCalendarId(null);
    setGoogleEmail(null);
    setGooglePhotoUrl(null);
    setSyncComplete(false);
    try { localStorage.removeItem(GCAL_CACHE_KEY); } catch { /* ignore */ }
    showToast("Google Calendar disconnected.");

    fetch("/api/gcal/disconnect", { method: "POST" }).catch(() => {});
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-subtle-foreground text-sm py-4">
        <GoogleCalendarIcon size={16} />
        Loading Google Calendar settings...
      </div>
    );
  }

  return (
    <div className="max-w-xl rounded-2xl border border-border bg-card p-5 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-2.5 mb-1.5">
        <GoogleCalendarIcon size={22} />
        <h2 className="text-lg font-semibold text-foreground">
          Google Calendar
        </h2>
        <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full">
          Real-time
        </span>
      </div>
      <p className="text-xs text-subtle-foreground mb-4">
        Automatically sync tasks to Google Calendar in real time.
        Events are created, updated, and deleted as you modify tasks.
      </p>

      {!connected ? (
        <div className="space-y-3">
          <a
            href="/api/gcal/auth"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-semibold bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 active:scale-[0.98] transition-all duration-200 shadow-sm dark:shadow-none"
          >
            <GoogleCalendarIcon size={20} />
            Connect Google Calendar
          </a>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
            Google hasn&apos;t verified our app yet, but your data is safe and encrypted.
            When you see a warning screen, click <span className="font-medium text-foreground">Advanced</span> → <span className="font-medium text-foreground">Go to caltodo.me (unsafe)</span> to continue.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Connected status with Google account info */}
          <div className="flex items-center gap-2.5 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 rounded-xl w-fit">
            {googlePhotoUrl ? (
              <img
                src={googlePhotoUrl}
                alt=""
                width={20}
                height={20}
                className="rounded-full shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Check size={16} className="shrink-0" />
            )}
            <span className="font-medium">
              {googleEmail ? `Connected as ${googleEmail}` : "Connected to Google Calendar"}
            </span>
            <Check size={14} className="shrink-0 text-emerald-500" />
          </div>

          {/* Setting up indicator (connected but no calendar yet, syncing) */}
          {!selectedCalendarId && syncing && (
            <div className="text-xs text-subtle-foreground py-2">
              Setting up your calendar...
            </div>
          )}

          {/* Sync progress bar */}
          {syncProgress && (
            <div className="space-y-1.5">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                {syncProgress.total > 0 ? (
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-300 ease-out"
                    style={{ width: `${Math.round((syncProgress.synced / syncProgress.total) * 100)}%` }}
                  />
                ) : (
                  <div className="h-full w-full rounded-full bg-blue-500/30 animate-pulse" />
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-subtle-foreground">
                {syncProgress.total > 0 ? (
                  <>
                    <span>Syncing {syncProgress.synced} of {syncProgress.total} tasks</span>
                    <span className="font-medium">{Math.round((syncProgress.synced / syncProgress.total) * 100)}%</span>
                  </>
                ) : (
                  <span>Preparing sync...</span>
                )}
              </div>
            </div>
          )}

          {/* View in Google Calendar link (shown after sync completes) */}
          {syncComplete && (
            <a
              href={googleEmail ? `https://calendar.google.com/calendar/r?authuser=${encodeURIComponent(googleEmail)}` : "https://calendar.google.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ExternalLink size={12} />
              View in Google Calendar
            </a>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className={`flex items-center gap-1.5 text-xs transition-colors disabled:opacity-60 ${
                confirmDisconnect
                  ? "text-red-500"
                  : "text-muted-foreground hover:text-red-500"
              }`}
            >
              {confirmDisconnect ? <XCircle size={12} /> : <Unlink size={12} />}
              {confirmDisconnect
                ? "Click again to disconnect"
                : disconnecting
                  ? "Disconnecting..."
                  : "Disconnect"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
