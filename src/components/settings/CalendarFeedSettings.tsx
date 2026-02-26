/**
 * Settings component for managing the iCal calendar feed subscription.
 *
 * - No token: prominent "Sync to Google Calendar" button with Google Calendar icon
 * - Token exists: Shows URL with Copy button, Regenerate, Disable, and Google Calendar instructions
 * - All notifications use toast popups instead of inline messages
 */

"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { Copy, Check, RefreshCw, XCircle } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

const CAL_CACHE_KEY = "caltodo_calendar_token_cache";

/**
 * Reads cached calendar token from localStorage.
 * @returns Cached token string, null (no token), or undefined (no cache)
 */
function getCachedToken(): string | null | undefined {
  try {
    const raw = localStorage.getItem(CAL_CACHE_KEY);
    if (raw === null) return undefined;
    return JSON.parse(raw) as string | null;
  } catch {
    return undefined;
  }
}

/**
 * Writes calendar token to localStorage cache.
 * @param token - The token to cache, or null to cache "no token" state
 */
function setCachedToken(token: string | null): void {
  try {
    localStorage.setItem(CAL_CACHE_KEY, JSON.stringify(token));
  } catch {
    /* ignore quota errors */
  }
}

/**
 * Inline Google Calendar logo SVG.
 * Used in the enable button and subscription instructions for brand recognition.
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

export default function CalendarFeedSettings() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [calendarToken, setCalendarToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);
  const hasCacheRef = useRef(false);

  /** Hydrate from localStorage before first paint. */
  useLayoutEffect(() => {
    const cached = getCachedToken();
    if (cached !== undefined) {
      setCalendarToken(cached);
      setLoading(false);
      hasCacheRef.current = true;
    }
  }, []);

  /**
   * Builds the full feed URL from the current token.
   *
   * @returns Absolute URL to the iCal feed endpoint, or null
   */
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const feedUrl = calendarToken && origin
    ? `${origin}/api/calendar/feed?token=${calendarToken}`
    : null;

  /**
   * Fetches the current calendar token from the API.
   * Skips loading spinner if cache was used.
   */
  const fetchToken = useCallback(async () => {
    if (!hasCacheRef.current) {
      setLoading(true);
    }
    try {
      const res = await fetch("/api/calendar/token");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to fetch calendar token");
      }
      const data = await res.json();
      setCalendarToken(data.calendar_token);
      setCachedToken(data.calendar_token);
    } catch (err) {
      if (!hasCacheRef.current) {
        showToast(err instanceof Error ? err.message : "Failed to load calendar settings");
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  /**
   * Generates a new calendar token (creates or regenerates).
   */
  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/calendar/token", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to generate calendar token");
      }
      const data = await res.json();
      setCalendarToken(data.calendar_token);
      setCachedToken(data.calendar_token);
      showToast("Calendar feed enabled. Copy the URL below.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to generate token");
    } finally {
      setGenerating(false);
    }
  }

  /**
   * Disables the calendar feed (requires double-click confirmation).
   * First click shows confirmation, second click executes.
   * Resets after 3 seconds if not confirmed.
   */
  async function handleDisable() {
    if (!confirmDisable) {
      setConfirmDisable(true);
      setTimeout(() => setConfirmDisable(false), 3000);
      return;
    }
    setConfirmDisable(false);
    try {
      const res = await fetch("/api/calendar/token", { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to disable calendar feed");
      }
      setCalendarToken(null);
      setCachedToken(null);
      showToast("Calendar feed disabled.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to disable feed");
    }
  }

  /**
   * Copies the feed URL to the clipboard.
   */
  async function handleCopy() {
    if (!feedUrl) return;
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      showToast("Feed URL copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Failed to copy URL to clipboard.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-subtle-foreground text-sm py-4">
        <GoogleCalendarIcon size={16} />
        Loading calendar settings...
      </div>
    );
  }

  return (
    <div className="max-w-xl">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <GoogleCalendarIcon size={18} />
          <h2 className="text-lg font-semibold text-foreground">iCal Feed (Manual)</h2>
        </div>
        <p className="text-xs text-subtle-foreground mb-4">
          Subscribe to your tasks as an iCal feed in Google Calendar, Apple Calendar, or any
          calendar app that supports URL subscriptions.
        </p>

        {!calendarToken ? (
          /* ---- No token: prominent enable button ---- */
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-semibold bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <GoogleCalendarIcon size={20} />
            {generating ? "Generating..." : "Sync to Google Calendar"}
          </button>
        ) : (
          /* ---- Token exists: show URL, copy, instructions ---- */
          <div className="space-y-3">
            {/* Feed URL with copy button */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={feedUrl || ""}
                className="flex-1 px-3 py-2 rounded-xl border border-input-border text-sm text-secondary-foreground bg-card focus:outline-none select-all"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={handleCopy}
                className="shrink-0 px-3 py-2 rounded-xl border border-input-border text-sm text-secondary-foreground hover:bg-accent transition-colors flex items-center gap-1.5"
                title="Copy URL"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {/* Google Calendar instructions */}
            <div className="p-3 bg-muted rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <GoogleCalendarIcon size={16} />
                <span className="text-xs font-medium text-secondary-foreground">Sync with Google Calendar</span>
              </div>
              <ol className="text-xs text-subtle-foreground space-y-1 ml-6 list-decimal">
                <li>
                  Open{" "}
                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 underline"
                  >
                    Google Calendar
                  </a>
                </li>
                <li>
                  Click <span className="font-medium text-muted-foreground">+</span> next to{" "}
                  <span className="font-medium text-muted-foreground">Other calendars</span>
                </li>
                <li>
                  Select <span className="font-medium text-muted-foreground">From URL</span>
                </li>
                <li>Paste the feed URL above and click Add calendar</li>
              </ol>
              <p className="text-xs text-subtle-foreground ml-6">
                Google Calendar refreshes subscriptions every 6-24 hours.
              </p>
            </div>

            {/* Action buttons — clean row */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-60"
              >
                <RefreshCw size={12} className={generating ? "animate-spin" : ""} />
                {generating ? "Regenerating..." : "Regenerate URL"}
              </button>
              <span className="text-border">|</span>
              <button
                onClick={handleDisable}
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  confirmDisable
                    ? "text-red-500"
                    : "text-muted-foreground hover:text-red-500"
                }`}
              >
                <XCircle size={12} />
                {confirmDisable ? "Click again to disable" : "Disable Feed"}
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
