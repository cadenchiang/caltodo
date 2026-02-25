"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import type { IntegrationCredentials } from "@/lib/types";

/** localStorage key to permanently dismiss the feedback modal. */
const FEEDBACK_KEY = "caltodo_feedback_dismissed";

/**
 * Checks if the feedback modal has already been dismissed.
 *
 * @returns true if the modal should not be shown
 */
function isFeedbackDismissed(): boolean {
  try {
    return localStorage.getItem(FEEDBACK_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Marks the feedback modal as permanently dismissed in localStorage.
 */
function markFeedbackDismissed(): void {
  try {
    localStorage.setItem(FEEDBACK_KEY, "true");
  } catch {
    /* non-critical */
  }
}

/**
 * One-time feedback modal shown to existing users asking for NPS score
 * and optional text feedback.
 *
 * **One-time tracking:** Uses localStorage key `caltodo_feedback_dismissed`.
 * When set to `"true"`, the modal never shows again.
 *
 * **Show conditions** (all must be true):
 * - `caltodo_feedback_dismissed` is NOT "true" in localStorage
 * - User IS existing: has canvas_token, gradescope_email, or last_synced_at
 *
 * Submits feedback via POST /api/contact with message format:
 * "[Feedback] NPS: X/10 — <optional text>"
 *
 * Features smooth backdrop fade + card scale entrance matching
 * PensieveAnnouncementModal animations.
 */
export default function FeedbackModal() {
  /** Whether the modal should be visible (triggers entrance). */
  const [visible, setVisible] = useState(false);
  /** Whether the exit animation is playing (prevents unmount until done). */
  const [exiting, setExiting] = useState(false);
  /** Selected NPS score (0–10), null if none selected. */
  const [npsScore, setNpsScore] = useState<number | null>(null);
  /** Optional text feedback. */
  const [feedback, setFeedback] = useState("");
  /** Whether the form is currently submitting. */
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isFeedbackDismissed()) return;

    async function checkEligibility() {
      try {
        const res = await fetch("/api/credentials");
        if (!res.ok) return;
        const creds: IntegrationCredentials = await res.json();

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
  }, []);

  /**
   * Plays the exit animation, marks as dismissed, then unmounts.
   * Calls the optional callback after the animation completes.
   *
   * @param onComplete - Optional callback after exit animation finishes
   */
  const dismiss = useCallback((onComplete?: () => void) => {
    markFeedbackDismissed();
    setExiting(true);
    onComplete?.();
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, 250);
  }, []);

  /**
   * Submits the NPS score and optional feedback to /api/contact,
   * then dismisses the modal.
   */
  async function handleSubmit() {
    if (npsScore === null) return;

    setSubmitting(true);
    try {
      const textPart = feedback.trim();
      const message = textPart
        ? `[Feedback] NPS: ${npsScore}/10 — ${textPart}`
        : `[Feedback] NPS: ${npsScore}/10`;

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        console.error("FeedbackModal: failed to submit feedback", {
          status: res.status,
        });
      }
    } catch (err) {
      console.error("FeedbackModal: network error submitting feedback", {
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSubmitting(false);
      dismiss();
    }
  }

  /**
   * Dismisses the modal permanently without submitting.
   */
  function handleDismiss() {
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
        className={`bg-popover rounded-2xl border border-border shadow-2xl w-full max-w-sm mx-4 p-6 relative ${cardClass}`}
      >
        {/* Dismiss X — top right */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors rounded-lg"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>

        {/* Title — staggered */}
        <h3
          className="text-lg font-semibold text-foreground text-center mb-2 animate-drop-in"
          style={{ animationDelay: "150ms" }}
        >
          how likely are you to recommend caltodo to a friend?
        </h3>

        {/* NPS Scale — staggered */}
        <div
          className="flex justify-center gap-0.5 mb-4 animate-drop-in"
          style={{ animationDelay: "220ms" }}
        >
          {Array.from({ length: 11 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setNpsScore(i)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                npsScore === i
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "bg-gray-200 dark:bg-gray-700 text-muted-foreground hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {i}
            </button>
          ))}
        </div>

        {/* Scale labels */}
        <div
          className="flex justify-between px-1 mb-4 animate-drop-in"
          style={{ animationDelay: "220ms" }}
        >
          <span className="text-[10px] text-muted-foreground">not likely</span>
          <span className="text-[10px] text-muted-foreground">very likely</span>
        </div>

        {/* Optional textarea — staggered */}
        <div
          className="mb-4 animate-drop-in"
          style={{ animationDelay: "290ms" }}
        >
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="any other feedback?"
            rows={3}
            className="w-full text-sm text-foreground bg-transparent border border-input-border rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none placeholder-subtle-foreground transition-all"
          />
        </div>

        {/* Submit button — staggered */}
        <div
          className="animate-drop-in"
          style={{ animationDelay: "360ms" }}
        >
          <button
            onClick={handleSubmit}
            disabled={npsScore === null || submitting}
            className="w-full px-4 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? "Sending..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
