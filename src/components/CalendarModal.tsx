"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface CalendarModalProps {
  onClose: () => void;
}

/**
 * Inline Google Calendar logo SVG (official 2020 icon).
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
 * Modal popup for enabling Google Calendar iCal feed subscription.
 * Generates a feed token via POST /api/calendar/token and displays
 * the feed URL for the user to add to Google Calendar.
 *
 * @param onClose - Called when the modal is dismissed
 */
export default function CalendarModal({ onClose }: CalendarModalProps) {
  const [enabling, setEnabling] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [feedUrl, setFeedUrl] = useState<string | null>(null);

  /**
   * Generates a calendar feed token and shows the feed URL.
   */
  async function handleEnable() {
    setEnabling(true);
    try {
      const res = await fetch("/api/calendar/token", { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate feed");
      const data = await res.json();
      const url = `${window.location.origin}/api/calendar/feed?token=${data.calendar_token}`;
      setFeedUrl(url);
      setEnabled(true);
    } catch {
      // Non-critical — user can enable later in settings
    } finally {
      setEnabling(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md mx-4 flex flex-col animate-in">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GoogleCalendarIcon size={20} />
            <h3 className="text-sm font-semibold text-foreground">Google Calendar</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-subtle-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          {!enabled ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Add your synced assignments to Google Calendar so deadlines show up alongside your classes.
              </p>
              <div className="rounded-xl border border-border px-4 py-3 mb-5 text-xs text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  This creates an iCal feed URL that Google Calendar (or Apple Calendar)
                  can subscribe to. Your assignments will automatically appear on your calendar.
                </p>
                <p className="text-subtle-foreground">
                  Google Calendar refreshes subscriptions every 6-24 hours.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-sm text-muted-foreground rounded-xl border border-border hover:bg-accent transition-colors"
                >
                  Maybe later
                </button>
                <button
                  onClick={handleEnable}
                  disabled={enabling}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-foreground text-background hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                  {enabling && <Loader2 size={14} className="animate-spin" />}
                  {enabling ? "Enabling..." : "Enable feed"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-border px-4 py-3 mb-4">
                <p className="text-xs font-medium text-foreground mb-2">Your feed URL:</p>
                <input
                  type="text"
                  readOnly
                  value={feedUrl || ""}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-muted-foreground focus:outline-none select-all"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <p className="text-xs text-subtle-foreground mt-2">
                  Copy this URL, then add it to Google Calendar via{" "}
                  <span className="font-medium text-muted-foreground">Other calendars &gt; From URL</span>.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-foreground text-background hover:opacity-90 transition-all"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
