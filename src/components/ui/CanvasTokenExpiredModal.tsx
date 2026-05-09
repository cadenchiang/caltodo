"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import type { IntegrationCredentials } from "@/lib/types";

/** localStorage key to suppress modal for 24 hours after dismissal. */
const DISMISS_KEY = "caltodo_canvas_token_expired_dismissed";

/** Number of days before a Canvas token expires. */
const TOKEN_EXPIRY_DAYS = 120;

/** Number of hours to suppress modal after dismissal. */
const DISMISS_HOURS = 24;

/**
 * Checks if the user dismissed the modal within the last 24 hours.
 *
 * @returns true if modal should be suppressed
 */
function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    return Date.now() - dismissedAt < DISMISS_HOURS * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

/**
 * Modal that warns users when their bCourses API key has expired (120 days).
 * Only shown when canvas_token is non-null AND canvas_token_created_at + 120 days < now.
 * Does NOT show if canvas_token is null (user not connected).
 * Dismissal is stored in localStorage for 24 hours.
 */
export default function CanvasTokenExpiredModal() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isDismissed()) return;

    async function checkExpiration() {
      try {
        const res = await fetch("/api/credentials");
        if (!res.ok) return;
        const creds: IntegrationCredentials = await res.json();

        // Only show if user has a canvas token AND it has a creation date
        if (!creds.canvas_token || !creds.canvas_token_created_at) return;

        const createdAt = new Date(creds.canvas_token_created_at).getTime();
        const expiresAt = createdAt + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

        if (Date.now() > expiresAt) {
          setShow(true);
        }
      } catch {
        // Non-critical — silently skip
      }
    }

    checkExpiration();
  }, []);

  /**
   * Dismisses the modal and stores dismissal timestamp in localStorage.
   */
  function handleDismiss() {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // non-critical
    }
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-popover rounded-2xl border border-border shadow-2xl w-full w-[calc(100%-2rem)] max-w-sm p-6 animate-modal-in">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
            <AlertTriangle size={24} className="text-amber-500" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-foreground text-center mb-2">
          Your Canvas API key has expired
        </h3>

        <p className="text-sm text-muted-foreground text-center mb-6">
          Canvas API keys expire after 120 days. Please generate a new one in Settings to continue syncing assignments.
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              setShow(false);
              router.push("/app/settings");
            }}
            className="w-full px-4 py-2.5 bg-foreground text-background rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Go to Settings
          </button>
          <button
            onClick={handleDismiss}
            className="w-full px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
