"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { BookOpen, ShieldCheck } from "lucide-react";

/**
 * Inline Google Calendar logo SVG.
 */
function GCalIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 122.88 122.88" className="shrink-0">
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

/** localStorage key to permanently dismiss the integrations welcome modal. */
const WELCOME_KEY = "caltodo_integrations_welcome_seen";

/**
 * Module-level flag to prevent re-showing the modal on component re-mounts
 * within the same page session.
 */
let seenThisSession = false;

/**
 * Checks if the integrations welcome has already been seen.
 *
 * @returns true if the modal should not be shown
 */
function isAlreadySeen(): boolean {
  if (seenThisSession) return true;
  try {
    return localStorage.getItem(WELCOME_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Marks the integrations welcome as permanently seen in localStorage
 * and sets the module-level flag to prevent re-show on re-mount.
 */
function markSeen(): void {
  seenThisSession = true;
  try {
    localStorage.setItem(WELCOME_KEY, "true");
  } catch {
    /* non-critical */
  }
}

/**
 * One-time welcome modal shown when a user first visits the integrations
 * settings section. Explains available platforms and highlights Google
 * Calendar Live Sync.
 *
 * **Tracking:** Uses localStorage key `caltodo_integrations_welcome_seen`.
 * Once "true", the modal never shows again.
 */
export default function IntegrationsWelcomeModal() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (isAlreadySeen()) return;
    // Mark immediately to prevent duplicate mounts from showing twice
    seenThisSession = true;
    const timer = setTimeout(() => {
      setVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Dismisses the modal with exit animation and marks as seen.
   */
  const handleDismiss = useCallback(() => {
    markSeen();
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
      onClick={handleDismiss}
    >
      <div
        className={`bg-popover rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 ${cardClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar — single step */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-1 w-16 rounded-full bg-foreground" />
        </div>

        {/* Title — left-aligned */}
        <h3
          className="text-xl font-semibold text-foreground mb-2 animate-drop-in"
          style={{ animationDelay: "150ms" }}
        >
          your integrations
        </h3>

        {/* Description — left-aligned */}
        <p
          className="text-sm text-muted-foreground mb-6 leading-relaxed animate-drop-in"
          style={{ animationDelay: "220ms" }}
        >
          connect your class platforms to automatically import assignments and deadlines.
        </p>

        {/* Items */}
        <div
          className="mb-8 animate-drop-in"
          style={{ animationDelay: "290ms" }}
        >
          {/* Item 1: Sync platforms */}
          <div className="flex items-start gap-3.5 py-4 border-t border-border">
            <BookOpen size={18} className="text-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">sync your classes</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                connect bCourses, Gradescope, or Pensive to import assignments
              </p>
            </div>
          </div>

          {/* Item 2: Google Calendar */}
          <div className="flex items-start gap-3.5 py-4 border-t border-border">
            <div className="shrink-0 mt-0.5">
              <GCalIcon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">live sync to Google Calendar</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                your assignments automatically appear on your calendar
              </p>
            </div>
          </div>

          {/* Item 3: Data security */}
          <div className="flex items-start gap-3.5 py-4 border-t border-border">
            <ShieldCheck size={18} className="text-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">your data is safe and encrypted</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                all credentials are encrypted with AES-256. no one — not even us — can see your information.
              </p>
            </div>
          </div>
        </div>

        {/* CTA — right-aligned */}
        <div
          className="flex justify-end animate-drop-in"
          style={{ animationDelay: "360ms" }}
        >
          <button
            onClick={handleDismiss}
            className="px-8 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer active:scale-95"
          >
            got it &rarr;
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
