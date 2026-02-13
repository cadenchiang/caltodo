/**
 * Settings component for managing the iCal calendar feed subscription.
 *
 * - No token: "Enable Calendar Feed" button
 * - Token exists: Shows URL with Copy button, Regenerate, Disable, and Google Calendar instructions
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, Copy, Check, RefreshCw, XCircle } from "lucide-react";

/**
 * Inline Google Calendar logo SVG (16x16).
 * Used in the subscription instructions for brand recognition.
 */
function GoogleCalendarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block shrink-0"
    >
      <path d="M18.316 5.684H5.684v12.632h12.632V5.684z" fill="#fff" />
      <path d="M18.316 24l5.684-5.684h-5.684V24z" fill="#EA4335" />
      <path
        d="M24 5.684V18.316h-5.684V5.684H24zM18.316 5.684L24 0h-5.684v5.684z"
        fill="#FBBC04"
      />
      <path d="M18.316 18.316H5.684V24h12.632v-5.684z" fill="#34A853" />
      <path
        d="M0 18.316V24h5.684v-5.684H0zM5.684 18.316v-12.632H0v12.632h5.684z"
        fill="#188038"
      />
      <path d="M5.684 5.684V0H0v5.684h5.684z" fill="#1967D2" />
      <path d="M5.684 0h12.632v5.684H5.684V0z" fill="#4285F4" />
      <path
        d="M13.553 16.106c-.633.42-1.514.737-2.553.737-1.476 0-2.728-.842-3.265-2.074l1.307-.538.005-.002c.278.663.946 1.139 1.953 1.139.827 0 1.389-.282 1.81-.738.42-.456.42-1.072.42-1.392 0-1.139-.779-1.728-1.81-1.728h-.842v-1.265h.737c.842 0 1.581-.484 1.581-1.412 0-.842-.633-1.476-1.581-1.476-.948 0-1.476.633-1.686 1.265l-1.265-.527c.316-.948 1.265-2.021 2.951-2.021 1.581 0 2.846 1.053 2.846 2.528 0 1.09-.632 1.812-1.265 2.18v.064c.843.368 1.581 1.264 1.581 2.512 0 1.265-.843 2.337-1.824 2.748z"
        fill="#4285F4"
      />
      <path
        d="M8.842 12l-1.37-.947v-4.79h1.54v4.054L8.842 12z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function CalendarFeedSettings() {
  const [loading, setLoading] = useState(true);
  const [calendarToken, setCalendarToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);

  /**
   * Builds the full feed URL from the current token.
   *
   * @returns Absolute URL to the iCal feed endpoint, or null
   */
  const feedUrl = calendarToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/api/calendar/feed?token=${calendarToken}`
    : null;

  /**
   * Fetches the current calendar token from the API.
   */
  const fetchToken = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/calendar/token");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to fetch calendar token");
      }
      const data = await res.json();
      setCalendarToken(data.calendar_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load calendar settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  /**
   * Generates a new calendar token (creates or regenerates).
   */
  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/calendar/token", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to generate calendar token");
      }
      const data = await res.json();
      setCalendarToken(data.calendar_token);
      setSuccess("Calendar feed enabled. Copy the URL below.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate token");
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
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/calendar/token", { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to disable calendar feed");
      }
      setCalendarToken(null);
      setSuccess("Calendar feed disabled.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disable feed");
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
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Failed to copy URL to clipboard");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
        <Calendar size={16} />
        Loading calendar settings...
      </div>
    );
  }

  return (
    <div className="max-w-xl">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Calendar size={18} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Calendar Feed</h2>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Subscribe to your tasks as an iCal feed in Google Calendar, Apple Calendar, or any
          calendar app that supports URL subscriptions.
        </p>

        {!calendarToken ? (
          /* ---- No token: enable button ---- */
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {generating ? "Generating..." : "Enable Calendar Feed"}
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
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none select-all"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={handleCopy}
                className="shrink-0 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                title="Copy URL"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {/* Google Calendar instructions */}
            <div className="p-3 bg-gray-50 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <GoogleCalendarIcon size={16} />
                <span className="text-xs font-medium text-gray-600">Sync with Google Calendar</span>
              </div>
              <ol className="text-xs text-gray-400 space-y-1 ml-6 list-decimal">
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
                  Click <span className="font-medium text-gray-500">+</span> next to{" "}
                  <span className="font-medium text-gray-500">Other calendars</span>
                </li>
                <li>
                  Select <span className="font-medium text-gray-500">From URL</span>
                </li>
                <li>Paste the feed URL above and click Add calendar</li>
              </ol>
              <p className="text-xs text-gray-400 ml-6">
                Google Calendar refreshes subscriptions every 6–24 hours.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-gray-200 transition-colors disabled:opacity-60"
              >
                <RefreshCw size={12} className={generating ? "animate-spin" : ""} />
                {generating ? "Regenerating..." : "Regenerate URL"}
              </button>
              <button
                onClick={handleDisable}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-colors border ${
                  confirmDisable
                    ? "text-red-600 bg-red-50 border-red-200 hover:bg-red-100"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-50 border-gray-200"
                }`}
              >
                <XCircle size={12} />
                {confirmDisable ? "Click again to disable" : "Disable Feed"}
              </button>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="mt-3 bg-red-50 text-red-500 text-sm p-3 rounded-xl">{error}</div>
        )}
        {success && (
          <div className="mt-3 bg-emerald-50 text-emerald-600 text-sm p-3 rounded-xl">{success}</div>
        )}
    </div>
  );
}
