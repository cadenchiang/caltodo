"use client";

/**
 * Google Calendar onboarding step.
 *
 * Runs the same OAuth connect settings does. It used to mint an iCal feed URL
 * for the user to paste into Google by hand, which never connected the account:
 * no tokens were stored, so two-way sync never started for anyone who set up
 * Google Calendar here.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Check } from "lucide-react";
import GoogleAuthWarningModal from "@/components/settings/GoogleAuthWarningModal";
import { setUpConnectedCalendar } from "@/lib/gcal/connect-setup";
import { describeOAuthError } from "@/lib/gcal/oauth-return";

interface CalendarStepProps {
  onNext: () => void;
  onSkip: () => void;
}

/** What the step is currently doing. */
type Phase = "loading" | "idle" | "connecting" | "settingUp" | "connected";

/** OAuth entry point; `return=onboarding` brings the user back to this flow. */
const AUTH_URL = "/api/gcal/auth?return=onboarding";

/** How often the opener checks whether the OAuth popup has finished. */
const POPUP_POLL_MS = 1000;

/**
 * Inline Google Calendar logo SVG (official 2020 icon) for the onboarding step.
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

/**
 * Onboarding step that connects Google Calendar for two-way sync.
 *
 * Desktop opens Google's consent screen in a popup and polls it; narrow
 * screens and blocked popups fall back to a full-page redirect, which returns
 * to /app/onboarding?gcal=connected where saved progress resumes this step.
 * Once tokens exist it saves the calendar selection, without which nothing
 * syncs. The first bulk sync runs from TaskContext when the app loads.
 *
 * @param onNext - Called when the user continues after connecting
 * @param onSkip - Called when the user skips this step
 */
export default function CalendarStep({ onNext, onSkip }: CalendarStepProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  /** Guards setup against running twice (StrictMode remounts the effect). */
  const setupStartedRef = useRef(false);

  /** Saves the calendar selection after tokens are stored, then marks connected. */
  const finishSetup = useCallback(async () => {
    if (setupStartedRef.current) return;
    setupStartedRef.current = true;
    setPhase("settingUp");
    setError(null);
    const result = await setUpConnectedCalendar();
    if (!mountedRef.current) return;
    if (result.ok) {
      // TaskContext only pushes task edits to Google when this cache says
      // connected; settings writes it on every render, but a user who
      // connects here and never opens settings would otherwise wait for
      // the 30-minute auto-sync to pick anything up.
      try {
        localStorage.setItem("gcal_status", JSON.stringify({
          connected: true,
          calendarId: result.calendarIds[0] ?? null,
          email: null,
          photoUrl: null,
        }));
      } catch { /* quota or private window; the auto-sync still covers it */ }
      try {
        window.dispatchEvent(new CustomEvent("gcal-status-change", { detail: { connected: true } }));
      } catch { /* non-critical: only refreshes the sidebar badge */ }
      setPhase("connected");
    } else {
      setupStartedRef.current = false; // allow a retry
      setError(`Connected to Google, but could not set up your calendar: ${result.error}`);
      setPhase("idle");
    }
  }, []);

  // Decide the starting phase: returning from a redirect, already connected
  // (resumed session), or not connected yet. The redirect result lives in the
  // URL, which is only readable after mount, so this has to set state here.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    mountedRef.current = true;
    const url = new URL(window.location.href);
    const gcalParam = url.searchParams.get("gcal");

    const cleanup = () => {
      mountedRef.current = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };

    // Inside the OAuth popup the opener owns the result and closes this window.
    if (window.opener && gcalParam) return cleanup;

    if (gcalParam) {
      const reason = url.searchParams.get("reason");
      url.searchParams.delete("gcal");
      url.searchParams.delete("reason");
      window.history.replaceState({}, "", url.toString());
      if (gcalParam === "connected") {
        void finishSetup();
      } else {
        setError(describeOAuthError(reason));
        setPhase("idle");
      }
      return cleanup;
    }

    (async () => {
      try {
        const res = await fetch("/api/credentials");
        const data = res.ok ? await res.json() : null;
        if (!mountedRef.current) return;
        if (data?.has_google_calendar && data?.google_calendar_id) setPhase("connected");
        else if (data?.has_google_calendar) void finishSetup();
        else setPhase("idle");
      } catch (err) {
        console.warn("CalendarStep: could not read connection status; offering connect", { error: String(err) });
        if (mountedRef.current) setPhase("idle");
      }
    })();

    return cleanup;
  }, [finishSetup]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /** Starts OAuth after the user acknowledges the pre-flight notice. */
  function handleConfirmConnect() {
    setShowAuthWarning(false);
    setError(null);

    if (window.innerWidth < 768) {
      window.location.href = AUTH_URL;
      return;
    }

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      AUTH_URL,
      "gcal-auth",
      `width=${width},height=${height},left=${left},top=${top},popup=true`
    );

    if (!popup || popup.closed) {
      // Popup blocked: fall back to a full redirect.
      window.location.href = AUTH_URL;
      return;
    }

    setPhase("connecting");
    pollRef.current = setInterval(() => {
      if (popup.closed) {
        if (pollRef.current) clearInterval(pollRef.current);
        // Closed without finishing; let the user try again.
        setPhase((p) => (p === "connecting" ? "idle" : p));
        return;
      }
      try {
        const popupUrl = new URL(popup.location.href);
        const result = popupUrl.searchParams.get("gcal");
        if (!result) return;
        if (pollRef.current) clearInterval(pollRef.current);
        popup.close();
        if (result === "connected") {
          void finishSetup();
        } else {
          setError(describeOAuthError(popupUrl.searchParams.get("reason")));
          setPhase("idle");
        }
      } catch {
        // Cross-origin while the popup is still on Google; keep polling.
      }
    }, POPUP_POLL_MS);
  }

  const busy = phase === "loading" || phase === "connecting" || phase === "settingUp";

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <GoogleCalendarIcon size={22} />
        <h2 className="text-lg font-bold text-foreground animate-drop-in">Connect Google Calendar</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6 animate-drop-in delay-100">
        Two-way sync: your assignments and deadlines show up in Google Calendar, and your events show up here.
      </p>

      {phase === "connected" ? (
        <div className="animate-drop-in delay-200">
          <div className="rounded-xl border border-border px-4 py-3 mb-5 flex items-center gap-2 text-sm text-foreground">
            <Check size={15} className="text-green-600 shrink-0" />
            Google Calendar connected. Your tasks will sync automatically.
          </div>
          <button
            onClick={onNext}
            className="w-full px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold btn-elevated-primary"
          >
            Continue
          </button>
        </div>
      ) : (
        <div className="animate-drop-in delay-200">
          <div className="rounded-xl border border-border px-4 py-3 mb-5 text-xs text-muted-foreground leading-relaxed">
            caltodo creates its own &quot;caltodo&quot; calendar in your Google account, so synced
            assignments stay separate from your personal events.
          </div>

          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          <button
            onClick={() => setShowAuthWarning(true)}
            disabled={busy}
            className="w-full px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 btn-elevated-primary"
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            {phase === "connecting"
              ? "Waiting for Google..."
              : phase === "settingUp"
                ? "Setting up your calendar..."
                : "Connect Google Calendar"}
          </button>

          <button
            type="button"
            onClick={onSkip}
            disabled={phase === "settingUp"}
            className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            Skip for now
          </button>
        </div>
      )}

      <GoogleAuthWarningModal
        open={showAuthWarning}
        onContinue={handleConfirmConnect}
        onCancel={() => setShowAuthWarning(false)}
      />
    </div>
  );
}
