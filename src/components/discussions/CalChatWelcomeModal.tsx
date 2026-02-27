"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageCircle } from "lucide-react";

/** localStorage key to permanently dismiss the CalChat welcome modal. */
const WELCOME_KEY = "calchat_welcome_accepted";

/**
 * Module-level flag to prevent re-showing the modal on component re-mounts
 * within the same page session (e.g. when switching chats).
 */
let acceptedThisSession = false;

/**
 * Checks if the CalChat welcome has already been accepted.
 *
 * @returns true if the modal should not be shown
 */
function isAlreadyAccepted(): boolean {
  if (acceptedThisSession) return true;
  try {
    return localStorage.getItem(WELCOME_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Marks the CalChat welcome as permanently accepted in localStorage
 * and sets the module-level flag to prevent re-show on re-mount.
 */
function markAccepted(): void {
  acceptedThisSession = true;
  try {
    localStorage.setItem(WELCOME_KEY, "true");
  } catch {
    /* non-critical */
  }
}

/**
 * One-time welcome modal shown on the user's first CalChat visit.
 * Explains that the chat supports anonymous messaging and sets
 * community standards. User must accept before using chat.
 *
 * **Tracking:** Uses localStorage key `calchat_welcome_accepted`.
 * Once "true", the modal never shows again.
 */
export default function CalChatWelcomeModal() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [respectChecked, setRespectChecked] = useState(false);
  const [trackingChecked, setTrackingChecked] = useState(false);

  useEffect(() => {
    if (!isAlreadyAccepted()) {
      setVisible(true);
    }
  }, []);

  /**
   * Accepts the community standards and dismisses the modal.
   */
  const handleAccept = useCallback(() => {
    markAccepted();
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, 250);
  }, []);

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
        {/* Icon */}
        <div
          className="flex justify-center mb-4 animate-drop-in"
          style={{ animationDelay: "150ms" }}
        >
          <div className="w-14 h-14 rounded-full bg-[#007AFF]/10 flex items-center justify-center">
            <MessageCircle size={28} className="text-[#007AFF]" />
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-lg font-semibold text-foreground text-center mb-2 animate-drop-in"
          style={{ animationDelay: "220ms" }}
        >
          Welcome to CalChat
        </h3>

        {/* Description */}
        <p
          className="text-sm text-muted-foreground text-center mb-5 animate-drop-in"
          style={{ animationDelay: "290ms" }}
        >
          Chat with your classmates in real time. You can choose to send messages with your name or anonymously.
        </p>

        {/* Agreement checkboxes */}
        <div
          className="space-y-3 mb-6 animate-drop-in"
          style={{ animationDelay: "340ms" }}
        >
          <label className="flex items-start gap-3 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={respectChecked}
              onChange={(e) => setRespectChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-border accent-[#007AFF] cursor-pointer"
            />
            <span className="text-[13px] text-foreground leading-snug">
              I will be respectful and follow community standards
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={trackingChecked}
              onChange={(e) => setTrackingChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-border accent-[#007AFF] cursor-pointer"
            />
            <span className="text-[13px] text-foreground leading-snug">
              I understand anonymous messages are tracked for safety, but won't be shown to other students
            </span>
          </label>
        </div>

        {/* Accept button */}
        <div
          className="animate-drop-in"
          style={{ animationDelay: "410ms" }}
        >
          <button
            onClick={handleAccept}
            disabled={!respectChecked || !trackingChecked}
            className="w-full px-4 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Let&apos;s go!
          </button>
        </div>
      </div>
    </div>
  );
}
