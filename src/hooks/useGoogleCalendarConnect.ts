"use client";

/**
 * The Google Calendar connect flow: the pre-flight warning, the OAuth popup
 * (or full-page redirect on mobile), the `?gcal=` callback handling, and the
 * post-consent setup that creates the caltodo calendar and selects it.
 *
 * Split out of GoogleCalendarSettings so the card only renders state.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { oauthErrorMessage } from "@/lib/gcal/oauth-error-copy";

/** Width and height of the centered OAuth popup. */
const POPUP_WIDTH = 500;
const POPUP_HEIGHT = 600;

/** How often the popup URL is polled for the callback, in ms. */
const POPUP_POLL_MS = 1000;

interface UseGoogleCalendarConnectOptions {
  /** The connected Google account, used to deep-link the "Open" toast action. */
  googleEmail: string | null;
  /** Bypasses the credentials cache after a write. */
  refresh: () => Promise<void>;
  /** Renders the toast action icon; passed in so this file holds no JSX. */
  openIcon?: React.ReactNode;
}

interface UseGoogleCalendarConnectResult {
  /** True from consent until the post-consent setup has finished. */
  oauthConnecting: boolean;
  /** Whether the pre-flight warning modal is open. */
  showAuthWarning: boolean;
  /** Opens the pre-flight warning. */
  openAuthWarning: () => void;
  /** Closes the pre-flight warning without connecting. */
  closeAuthWarning: () => void;
  /** Closes the warning and starts the OAuth flow. */
  confirmConnect: () => void;
  /** True while this component is mounted. Shared with the card. */
  mountedRef: React.RefObject<boolean>;
}

/**
 * Manages the Google Calendar OAuth flow for the settings card.
 *
 * @param googleEmail - Connected account email, or null
 * @param refresh - Forces a credentials refetch
 * @param openIcon - Icon for the "Open" toast action
 * @returns Flow state and the handlers the card wires to its buttons
 * @remarks The popup poll lives in a ref and is cleared on unmount so a
 *          consent completed after navigation never drags the user back.
 */
export function useGoogleCalendarConnect({
  googleEmail,
  refresh,
  openIcon,
}: UseGoogleCalendarConnectOptions): UseGoogleCalendarConnectResult {
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [oauthConnecting, setOauthConnecting] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const mountedRef = useRef(true);
  /** The OAuth popup poll, kept so unmount can stop it. */
  const popupPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (popupPollRef.current) {
        clearInterval(popupPollRef.current);
        popupPollRef.current = null;
      }
    };
  }, []);

  /**
   * Creates the caltodo calendar, lists the account's other calendars, and
   * saves the selection with the caltodo calendar first (the write target).
   */
  const autoSetupCalendar = useCallback(async () => {
    // Fresh OAuth means full scope; skip future scope checks this session.
    try { sessionStorage.setItem("gcal-scope-ok", "1"); } catch { /* storage unavailable */ }
    showToast("Setting up Google Calendar...", { progress: 0 });
    try {
      await refresh();
      const caltodoRes = await fetch("/api/gcal/ensure-caltodo-calendar", { method: "POST" });
      let caltodoCalendarId: string | null = null;
      if (caltodoRes.ok) {
        caltodoCalendarId = ((await caltodoRes.json()) as { calendarId: string }).calendarId;
      } else {
        console.warn("useGoogleCalendarConnect: failed to ensure caltodo calendar; falling back", {
          status: caltodoRes.status,
          impact: "tasks will be written to the primary calendar",
        });
      }

      const calListRes = await fetch("/api/gcal/calendars?all=true");
      const otherIds: string[] = [];
      if (calListRes.ok) {
        const calData = await calListRes.json();
        for (const c of (calData.calendars ?? []) as Array<{ id: string }>) {
          if (c.id !== caltodoCalendarId) otherIds.push(c.id);
        }
      }

      const calendarIds = caltodoCalendarId
        ? [caltodoCalendarId, ...otherIds].slice(0, 10)
        : otherIds.length > 0
          ? otherIds.slice(0, 10)
          : ["primary"];

      const selectRes = await fetch("/api/gcal/select-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calendarIds }),
      });
      if (!selectRes.ok) {
        const err = await selectRes.json().catch(() => ({}));
        showToast(`Failed to set up calendar: ${err.error || selectRes.status}`, { variant: "error" });
        return;
      }
      const gcalUrl = googleEmail
        ? `https://calendar.google.com/calendar/r?authuser=${encodeURIComponent(googleEmail)}`
        : "https://calendar.google.com";
      showToast("Google Calendar connected! New tasks will sync automatically.", {
        action: { label: "Open", icon: openIcon, onClick: () => window.open(gcalUrl, "_blank") },
      });
    } catch (err) {
      console.error("useGoogleCalendarConnect: setup failed", {
        error: err instanceof Error ? err.message : String(err),
        impact: "the grant is stored but no calendar was selected",
      });
      showToast("Failed to set up calendar. Please try again.", { variant: "error" });
    } finally {
      if (mountedRef.current) setOauthConnecting(false);
      await refresh();
      try {
        window.dispatchEvent(new CustomEvent("gcal-status-change", { detail: { connected: true } }));
      } catch { /* not in a browser */ }
      if (mountedRef.current) router.replace("/app/settings?section=integrations");
    }
  }, [googleEmail, openIcon, refresh, router, showToast]);

  // Full-page redirect return: ?gcal=connected or ?gcal=error&reason=...
  useEffect(() => {
    const gcalParam = searchParams.get("gcal");
    // Inside the popup the opener handles completion.
    if (window.opener) return;
    if (gcalParam === "connected") {
      setOauthConnecting(true);
      void autoSetupCalendar();
    } else if (gcalParam === "error") {
      showToast(oauthErrorMessage(searchParams.get("reason")), { variant: "error" });
    } else {
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("gcal");
    url.searchParams.delete("reason");
    window.history.replaceState({}, "", url.toString());
  // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per callback param
  }, [searchParams, showToast]);

  /**
   * Starts OAuth. Desktop opens a centered popup and polls it for the
   * callback; mobile (or a blocked popup) falls back to a full-page redirect.
   */
  const confirmConnect = useCallback(() => {
    setShowAuthWarning(false);
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
    if (!isDesktop) {
      window.location.href = "/api/gcal/auth";
      return;
    }
    const left = window.screenX + (window.outerWidth - POPUP_WIDTH) / 2;
    const top = window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2;
    const popup = window.open(
      "/api/gcal/auth",
      "gcal-auth",
      `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},popup=true`
    );
    if (!popup || popup.closed) {
      window.location.href = "/api/gcal/auth";
      return;
    }

    if (popupPollRef.current) clearInterval(popupPollRef.current);
    const stopPolling = () => {
      if (popupPollRef.current) clearInterval(popupPollRef.current);
      popupPollRef.current = null;
    };
    popupPollRef.current = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          stopPolling();
          return;
        }
        const popupUrl = popup.location.href;
        if (popupUrl.includes("gcal=connected")) {
          stopPolling();
          popup.close();
          setOauthConnecting(true);
          void autoSetupCalendar();
        } else if (popupUrl.includes("gcal=error")) {
          stopPolling();
          popup.close();
          showToast(oauthErrorMessage(new URL(popupUrl).searchParams.get("reason")), { variant: "error" });
        }
      } catch {
        // Cross-origin: the popup is still on Google's domain, keep polling.
      }
    }, POPUP_POLL_MS);
  }, [autoSetupCalendar, showToast]);

  return {
    oauthConnecting,
    showAuthWarning,
    openAuthWarning: () => setShowAuthWarning(true),
    closeAuthWarning: () => setShowAuthWarning(false),
    confirmConnect,
    mountedRef,
  };
}
