/**
 * Google Calendar integration card.
 * Header is a disclosure once connected; the panel holds the account, a
 * Disconnect action (confirmed through ConfirmDialog), the calendar list, and
 * a Reconnect action whenever the grant needs renewing.
 */

"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useCredentials } from "@/components/settings/IntegrationSettings";
import { useGoogleCalendarConnect } from "@/hooks/useGoogleCalendarConnect";
import {
  canAutoSync,
  isSyncInProgress,
  markAutoSyncAttempt,
  publishSyncToastHandlers,
  runBackgroundSync,
} from "@/lib/gcal/background-sync";
import { PROVIDER_LABELS } from "@/lib/copy";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import GoogleAuthWarningModal from "./GoogleAuthWarningModal";
import GoogleCalendarIcon from "./GoogleCalendarIcon";
import GoogleCalendarList from "./GoogleCalendarList";
import { PILL_SHAPE } from "./AccountClasses";
import { NEEDS_RECONNECT_LABEL, StatusBadge } from "./integration-status";

/** localStorage key for caching GCal connection state (used by sidebar/header). */
const GCAL_CACHE_KEY = "gcal_status";

const LABEL = PROVIDER_LABELS.gcal;

export default function GoogleCalendarSettings() {
  const { showToast, updateToastProgress } = useToast();
  const { credentials, refresh } = useCredentials();

  const [open, setOpen] = useState(false);
  const connected = !!credentials.has_google_calendar;
  const googleEmail = credentials.google_email ?? null;
  const selectedCalendarId = credentials.google_calendar_id ?? null;

  const [disconnecting, setDisconnecting] = useState(false);
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false);
  /** Whether the token lacks write scope and needs reconnection. */
  const [scopeNeedsReconnect, setScopeNeedsReconnect] = useState(false);

  const connect = useGoogleCalendarConnect({
    googleEmail,
    refresh,
    openIcon: <ExternalLink size={14} />,
  });
  const { oauthConnecting, mountedRef } = connect;

  // Publish the toast helpers for the module-level background sync, which by
  // design outlives this component. Done in an effect, not during render.
  useEffect(() => {
    publishSyncToastHandlers({ showToast, updateProgress: updateToastProgress });
  });

  // Keep the gcal_status localStorage cache in sync for sidebar/header.
  useEffect(() => {
    try {
      localStorage.setItem(GCAL_CACHE_KEY, JSON.stringify({
        connected,
        calendarId: selectedCalendarId,
        email: googleEmail,
        photoUrl: credentials.google_photo_url ?? null,
      }));
    } catch { /* quota or storage unavailable */ }
  }, [connected, selectedCalendarId, googleEmail, credentials.google_photo_url]);

  // Check whether the stored token has write scope, once per session.
  useEffect(() => {
    if (!connected || oauthConnecting) return;
    try {
      if (sessionStorage.getItem("gcal-scope-ok") === "1") return;
    } catch { /* storage unavailable */ }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/gcal/check-scope");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled || !mountedRef.current) return;
        if (data.needsReconnect) {
          setScopeNeedsReconnect(true);
        } else {
          try { sessionStorage.setItem("gcal-scope-ok", "1"); } catch { /* storage unavailable */ }
        }
      } catch (err) {
        console.warn("GoogleCalendarSettings: scope check failed", {
          error: err instanceof Error ? err.message : String(err),
          impact: "the reconnect prompt may be missing until the next visit",
        });
      }
    })();
    return () => { cancelled = true; };
  }, [connected, oauthConnecting, mountedRef]);

  // Auto-sync unsynced tasks on mount, within the module cooldown.
  useEffect(() => {
    if (!connected || oauthConnecting || !canAutoSync()) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/gcal/unsynced-count");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled && mountedRef.current && data.count > 0 && !isSyncInProgress()) {
          markAutoSyncAttempt();
          void runBackgroundSync(true);
        }
      } catch (err) {
        console.warn("GoogleCalendarSettings: unsynced-count failed", {
          error: err instanceof Error ? err.message : String(err),
          impact: "auto-sync skipped this visit",
        });
      }
    })();
    return () => { cancelled = true; };
  }, [connected, oauthConnecting, mountedRef]);

  /**
   * Disconnects Google Calendar via API. Clears local state and toasts only
   * when the server confirmed; any other status leaves the card as is.
   */
  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/gcal/disconnect", { method: "POST" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        console.error("handleDisconnect: server refused", {
          status: res.status, error: body.error, impact: "tokens still stored, card stays connected",
        });
        showToast(`Failed to disconnect ${LABEL}: ${body.error || res.status}`, { variant: "error" });
        return;
      }
      try { localStorage.removeItem(GCAL_CACHE_KEY); } catch { /* storage unavailable */ }
      await refresh();
      try {
        window.dispatchEvent(new CustomEvent("gcal-status-change", { detail: { connected: false } }));
      } catch { /* not in a browser */ }
      showToast(`${LABEL} disconnected.`);
    } catch (err) {
      console.error("handleDisconnect: request failed", { error: err instanceof Error ? err.message : String(err) });
      showToast(`Failed to disconnect ${LABEL}.`, { variant: "error" });
    } finally {
      setDisconnecting(false);
      setConfirmingDisconnect(false);
    }
  }

  /** Drops the current grant and reopens the connect flow. */
  async function handleReconnect() {
    setScopeNeedsReconnect(false);
    try { sessionStorage.removeItem("gcal-scope-ok"); } catch { /* storage unavailable */ }
    await handleDisconnect();
    connect.openAuthWarning();
  }

  const isConnectedOrConnecting = connected || oauthConnecting;
  const needsReconnect = isConnectedOrConnecting && (scopeNeedsReconnect || !!credentials.google_auth_failed);
  const HeaderTag = isConnectedOrConnecting ? "button" : "div";

  return (
    <>
      <div className="rounded-2xl border border-border bg-card shadow-sm dark:shadow-none overflow-hidden">
        <HeaderTag
          {...(isConnectedOrConnecting
            ? { onClick: () => setOpen((v) => !v), "aria-expanded": open, type: "button" as const }
            : {})}
          className={`w-full flex items-center gap-2.5 sm:gap-3.5 px-3 sm:px-4 py-3.5 text-left ${
            isConnectedOrConnecting ? "hover:bg-muted/40 transition-colors cursor-pointer" : ""
          }`}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <GoogleCalendarIcon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-foreground whitespace-nowrap">{LABEL}</p>
              <Badge variant="info">Real-time</Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {isConnectedOrConnecting && googleEmail ? googleEmail : "Two-way event sync"}
            </p>
          </div>
          {isConnectedOrConnecting ? (
            <>
              <StatusBadge needsReconnect={needsReconnect} />
              <ChevronDown
                size={16}
                className={`text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </>
          ) : (
            <Button size="sm" variant="secondary" onClick={connect.openAuthWarning} className="text-blue-500">
              Connect
            </Button>
          )}
        </HeaderTag>

        {isConnectedOrConnecting && (
          <div
            className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
            aria-hidden={!open}
            inert={!open}
          >
            <div className="overflow-hidden">
              <div className="px-3 sm:px-4 pb-3 pt-3 border-t border-border">
                <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <span className="flex-1 min-w-0 flex">
                      <span className={`${PILL_SHAPE} font-semibold bg-card border border-border text-foreground`}>
                        {googleEmail ?? "Google account"}
                      </span>
                    </span>
                    {needsReconnect && (
                      <>
                        <span className="text-2xs font-medium text-red-500 shrink-0">{NEEDS_RECONNECT_LABEL}</span>
                        <Button size="sm" variant="secondary" onClick={handleReconnect} disabled={disconnecting}>
                          Reconnect
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setConfirmingDisconnect(true)}
                      disabled={disconnecting}
                      aria-label={`Disconnect ${LABEL}`}
                      className="text-muted-foreground"
                    >
                      Disconnect
                    </Button>
                  </div>
                  <div className="border-t border-border/60 px-3 py-2">
                    <GoogleCalendarList onSaved={refresh} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmingDisconnect}
        title={`Disconnect ${LABEL}?`}
        body="Tasks stop syncing to your calendar and the events caltodo created stay where they are. You can reconnect later."
        confirmLabel="Disconnect"
        destructive
        loading={disconnecting}
        onConfirm={handleDisconnect}
        onCancel={() => setConfirmingDisconnect(false)}
      />

      <GoogleAuthWarningModal
        open={connect.showAuthWarning}
        onContinue={connect.confirmConnect}
        onCancel={connect.closeAuthWarning}
      />
    </>
  );
}
