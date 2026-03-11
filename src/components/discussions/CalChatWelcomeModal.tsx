"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, EyeOff, ShieldCheck } from "lucide-react";
import { useTour } from "@/components/ui/AppTour";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";

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
  const { isActive: isTourActive } = useTour();
  const { hasCompletedOnboarding } = useOnboardingStatus();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [respectChecked, setRespectChecked] = useState(false);
  const [trackingChecked, setTrackingChecked] = useState(false);

  useEffect(() => {
    if (isTourActive || !hasCompletedOnboarding || isAlreadyAccepted()) return;
    setVisible(true);
  }, [isTourActive, hasCompletedOnboarding]);

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

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm ${backdropClass}`}
    >
      <div
        className={`bg-popover rounded-2xl shadow-2xl w-full w-[calc(100%-2rem)] max-w-md p-8 ${cardClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-1 w-16 rounded-full bg-foreground" />
        </div>

        {/* Title */}
        <h3
          className="text-xl font-semibold text-foreground mb-2 animate-drop-in"
          style={{ animationDelay: "150ms" }}
        >
          welcome to CalChat
        </h3>

        {/* Description */}
        <p
          className="text-sm text-muted-foreground mb-6 leading-relaxed animate-drop-in"
          style={{ animationDelay: "220ms" }}
        >
          chat with your classmates in real time. you can send messages with your name or anonymously.
        </p>

        {/* Items */}
        <div
          className="mb-6 animate-drop-in"
          style={{ animationDelay: "290ms" }}
        >
          {/* Item 1: Real-time chat */}
          <div className="flex items-start gap-3.5 py-4 border-t border-border">
            <MessageCircle size={18} className="text-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">real-time class chat</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                message classmates, share files, and react to messages
              </p>
            </div>
          </div>

          {/* Item 2: Anonymous messaging */}
          <div className="flex items-start gap-3.5 py-4 border-t border-border">
            <EyeOff size={18} className="text-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">anonymous mode</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                send messages anonymously — your identity is hidden from other students
              </p>
            </div>
          </div>

          {/* Item 3: Safety */}
          <div className="flex items-start gap-3.5 py-4 border-t border-border">
            <ShieldCheck size={18} className="text-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">safe and moderated</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                anonymous messages are tracked for safety but never shown to other students
              </p>
            </div>
          </div>
        </div>

        {/* Agreement checkboxes */}
        <div
          className="space-y-3 mb-6 animate-drop-in"
          style={{ animationDelay: "340ms" }}
        >
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={respectChecked}
              onChange={(e) => setRespectChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-border accent-foreground cursor-pointer"
            />
            <span className="text-[13px] text-foreground leading-snug">
              I will be respectful and follow community standards
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={trackingChecked}
              onChange={(e) => setTrackingChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-border accent-foreground cursor-pointer"
            />
            <span className="text-[13px] text-foreground leading-snug">
              I understand anonymous messages are tracked for safety
            </span>
          </label>
        </div>

        {/* CTA */}
        <div
          className="flex justify-end animate-drop-in"
          style={{ animationDelay: "410ms" }}
        >
          <button
            onClick={handleAccept}
            disabled={!respectChecked || !trackingChecked}
            className="px-8 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            let&apos;s go &rarr;
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
