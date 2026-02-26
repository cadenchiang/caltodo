"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { IntegrationCredentials } from "@/lib/types";

/** localStorage key to permanently dismiss the Pensieve announcement. */
const ANNOUNCE_KEY = "caltodo_pensieve_announced";

/**
 * Checks if the Pensieve announcement has already been dismissed.
 *
 * @returns true if the announcement should not be shown
 */
function isAlreadyAnnounced(): boolean {
  try {
    return localStorage.getItem(ANNOUNCE_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Marks the Pensieve announcement as permanently dismissed in localStorage.
 */
function markAnnounced(): void {
  try {
    localStorage.setItem(ANNOUNCE_KEY, "true");
  } catch {
    /* non-critical */
  }
}

/** Minimum account age in milliseconds before showing announcements (3 days). */
const MIN_ACCOUNT_AGE_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * One-time modal announcing Pensieve to existing users who haven't configured it yet.
 *
 * **One-time tracking:** Uses localStorage key `caltodo_pensieve_announced`.
 * When set to `"true"`, the modal never shows again. This is set:
 * - When the user clicks "Set up now" or "Maybe later"
 * - When a new user completes onboarding (in handleSyncAndGo)
 *
 * **Show conditions** (all must be true):
 * - `caltodo_pensieve_announced` is NOT "true" in localStorage
 * - `pensieve_calendar_url` is null (user hasn't configured Pensieve)
 * - User IS existing: has canvas_token, gradescope_email, or last_synced_at
 * - Account is at least 3 days old (prevents bombarding new users)
 *
 * @param userCreatedAt - ISO timestamp of when the user account was created
 */
export default function PensieveAnnouncementModal({ userCreatedAt }: { userCreatedAt?: string }) {
  const router = useRouter();
  /** Whether the modal should be visible (triggers entrance). */
  const [visible, setVisible] = useState(false);
  /** Whether the exit animation is playing (prevents unmount until done). */
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (isAlreadyAnnounced()) return;

    // Don't show to new users — wait at least 3 days
    if (userCreatedAt) {
      const accountAge = Date.now() - new Date(userCreatedAt).getTime();
      if (accountAge < MIN_ACCOUNT_AGE_MS) return;
    }

    async function checkEligibility() {
      try {
        const res = await fetch("/api/credentials");
        if (!res.ok) return;
        const creds: IntegrationCredentials = await res.json();

        if (creds.pensieve_calendar_url) return;

        const isExistingUser =
          creds.last_synced_at !== null ||
          creds.canvas_token !== null ||
          creds.gradescope_email !== null;

        if (isExistingUser) {
          setVisible(true);
        }
      } catch {
        // Non-critical — silently skip
      }
    }

    checkEligibility();
  }, [userCreatedAt]);

  /**
   * Plays the exit animation, marks as announced, then unmounts.
   * Calls the optional callback after the animation completes.
   *
   * @param onComplete - Optional callback after exit animation finishes
   */
  const dismiss = useCallback((onComplete?: () => void) => {
    markAnnounced();
    setExiting(true);
    // Fire callback while still mounted, then unmount after animation
    onComplete?.();
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, 250);
  }, []);

  /**
   * Dismisses the modal and navigates to Pensieve onboarding setup.
   */
  function handleSetupNow() {
    dismiss(() => router.push("/app/onboarding?setup=pensieve"));
  }

  /**
   * Dismisses the modal permanently without navigating.
   */
  function handleMaybeLater() {
    dismiss();
  }

  if (!visible) return null;

  const backdropClass = exiting
    ? "animate-announce-backdrop-out"
    : "animate-announce-backdrop-in";

  const cardClass = exiting
    ? "animate-announce-card-out"
    : "animate-announce-card-in";

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm ${backdropClass}`}
    >
      <div
        className={`bg-popover rounded-2xl border border-border shadow-2xl w-full max-w-sm mx-4 p-6 ${cardClass}`}
      >
        {/* Logo — staggered drop-in */}
        <div
          className="flex justify-center mb-4 animate-drop-in"
          style={{ animationDelay: "150ms" }}
        >
          <img
            src="/pensieve-logo.png"
            alt="Pensieve"
            className="w-12 h-12 object-contain"
          />
        </div>

        {/* Title — staggered */}
        <h3
          className="text-lg font-semibold text-foreground text-center mb-2 animate-drop-in"
          style={{ animationDelay: "220ms" }}
        >
          Pensieve is now available
        </h3>

        {/* Body — staggered */}
        <p
          className="text-sm text-muted-foreground text-center mb-6 animate-drop-in"
          style={{ animationDelay: "290ms" }}
        >
          You can now sync CS and Data Science assignments from Pensieve. Set it up in Settings anytime.
        </p>

        {/* Buttons — staggered */}
        <div
          className="flex flex-col gap-2 animate-drop-in"
          style={{ animationDelay: "360ms" }}
        >
          <button
            onClick={handleSetupNow}
            className="w-full px-4 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Set up now
          </button>
          <button
            onClick={handleMaybeLater}
            className="w-full px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
