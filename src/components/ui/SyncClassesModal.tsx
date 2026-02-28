"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { BookOpen, Compass } from "lucide-react";

/** localStorage key to track dismissal of the welcome prompt. */
const DISMISS_KEY = "caltodo_sync_dismissed";

/** localStorage key to check if tour has already been completed. */
const TOUR_COMPLETED_KEY = "caltodo_tour_completed";

/** localStorage key for the Getting Started widget visibility. */
const GETTING_STARTED_VISIBLE_KEY = "caltodo_getting_started_visible";

/**
 * Module-level flag to prevent re-showing the modal on component re-mounts
 * within the same page session.
 */
let dismissedThisSession = false;

/**
 * Two-screen setup wizard shown to new users on their first inbox visit.
 *
 * Screen 1: Welcome message with the caltodo logo and "next →" CTA.
 * Screen 2: Get-started checklist preview with "start organizing →" CTA.
 *
 * On final click, dismisses the modal and reveals the Getting Started widget.
 *
 * Show conditions:
 * - Only on `/app/inbox` route
 * - `hasCompletedOnboarding === false` OR redo is active
 * - Not previously dismissed (localStorage)
 * - Tour not already completed
 */
export default function SyncClassesModal() {
  const pathname = usePathname();
  const { hasCompletedOnboarding, loading } = useOnboardingStatus();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [redoActive, setRedoActive] = useState(false);
  const [screen, setScreen] = useState<1 | 2>(1);

  // Listen for redo-setup event — force-show the wizard on next inbox visit
  useEffect(() => {
    function handleReset() {
      dismissedThisSession = false;
      setRedoActive(true);
    }
    window.addEventListener("caltodo-redo-setup", handleReset);
    return () => window.removeEventListener("caltodo-redo-setup", handleReset);
  }, []);

  // Dedicated redo path — bypasses all other checks for reliability
  useEffect(() => {
    if (!redoActive) return;
    if (!pathname?.startsWith("/app/inbox")) return;
    const timer = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(timer);
  }, [redoActive, pathname]);

  // Standard show logic for first-time users
  useEffect(() => {
    if (redoActive) return; // redo has its own path
    if (!pathname?.startsWith("/app/inbox")) return;
    if (loading) return;
    if (dismissedThisSession) return;
    if (hasCompletedOnboarding) return;

    try {
      if (localStorage.getItem(DISMISS_KEY) === "true") {
        dismissedThisSession = true;
        return;
      }
      if (localStorage.getItem(TOUR_COMPLETED_KEY) === "true") {
        dismissedThisSession = true;
        return;
      }
    } catch {
      return;
    }

    const timer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(timer);
  }, [pathname, loading, hasCompletedOnboarding, redoActive]);

  /**
   * Closes the modal with exit animation, persists dismissal,
   * and shows the Getting Started widget.
   */
  const closeAndShowWidget = useCallback(() => {
    dismissedThisSession = true;
    try {
      localStorage.setItem(DISMISS_KEY, "true");
      localStorage.removeItem("caltodo_redo_active");
      localStorage.setItem(GETTING_STARTED_VISIBLE_KEY, "true");
    } catch { /* non-critical */ }
    setRedoActive(false);
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
      setScreen(1);
      window.dispatchEvent(new CustomEvent("caltodo-show-getting-started"));
    }, 120);
  }, []);

  /**
   * Closes the modal without showing the widget (backdrop click).
   */
  const closeModal = useCallback(() => {
    dismissedThisSession = true;
    try {
      localStorage.setItem(DISMISS_KEY, "true");
      localStorage.removeItem("caltodo_redo_active");
    } catch { /* non-critical */ }
    setRedoActive(false);
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
      setScreen(1);
    }, 120);
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
      onClick={closeModal}
    >
      <div
        className={`bg-popover rounded-2xl shadow-2xl w-full max-w-md mx-4 p-10 text-center ${cardClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Key wrapper triggers re-mount animation on screen switch */}
        <div key={screen}>
          {screen === 1 ? (
            <>
              {/* Logo */}
              <div
                className="flex justify-center mb-6 animate-drop-in"
                style={{ animationDelay: "150ms" }}
              >
                <img
                  src="/logo.png"
                  alt="caltodo"
                  className="h-12 dark:invert"
                />
              </div>

              {/* Heading */}
              <h3
                className="text-xl font-semibold text-foreground mb-2 animate-drop-in"
                style={{ animationDelay: "220ms" }}
              >
                welcome to caltodo
              </h3>

              {/* Tagline */}
              <p
                className="text-sm text-muted-foreground mb-10 leading-relaxed animate-drop-in"
                style={{ animationDelay: "290ms" }}
              >
                your assignments, your schedule, one place.
              </p>

              {/* CTA */}
              <div
                className="animate-drop-in"
                style={{ animationDelay: "360ms" }}
              >
                <button
                  onClick={() => setScreen(2)}
                  className="px-8 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer active:scale-95"
                >
                  next &rarr;
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Heading */}
              <h3
                className="text-xl font-semibold text-foreground mb-2 animate-drop-in"
                style={{ animationDelay: "150ms" }}
              >
                get started
              </h3>

              {/* Subtitle */}
              <p
                className="text-sm text-muted-foreground mb-6 leading-relaxed animate-drop-in"
                style={{ animationDelay: "220ms" }}
              >
                here&apos;s what you can do to make caltodo yours.
              </p>

              {/* Preview items */}
              <div
                className="space-y-3 mb-8 text-left animate-drop-in"
                style={{ animationDelay: "290ms" }}
              >
                {/* Item 1: Sync your classes */}
                <div className="flex items-start gap-3 rounded-xl border border-border p-3.5">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <BookOpen size={16} className="text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">sync your classes</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      connect bCourses, Gradescope, or Pensieve to import assignments
                    </p>
                  </div>
                </div>

                {/* Item 2: Take a tour */}
                <div className="flex items-start gap-3 rounded-xl border border-border p-3.5">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Compass size={16} className="text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">take a tour</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      learn how to use your inbox, calendar, and more
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div
                className="animate-drop-in"
                style={{ animationDelay: "360ms" }}
              >
                <button
                  onClick={closeAndShowWidget}
                  className="px-8 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer active:scale-95"
                >
                  start organizing &rarr;
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
