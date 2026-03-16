"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { BookOpen, Compass, ArrowLeft } from "lucide-react";

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
  const router = useRouter();
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
    if (!pathname?.startsWith("/app/inbox") && !pathname?.startsWith("/app/home")) return;
    const timer = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(timer);
  }, [redoActive, pathname]);

  // Standard show logic for first-time users (shows on /app/home or /app/inbox).
  // When loading, waits up to 400ms for the API to respond before showing.
  // Once loading finishes, shows immediately if onboarding is not complete.
  useEffect(() => {
    if (redoActive) return; // redo has its own path
    if (!pathname?.startsWith("/app/inbox") && !pathname?.startsWith("/app/home")) return;
    if (dismissedThisSession) return;
    if (hasCompletedOnboarding) {
      // API confirmed onboarding is done — hide if it was shown prematurely
      if (visible) setVisible(false);
      return;
    }

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

    if (!loading) {
      // API responded — show immediately
      setVisible(true);
      return;
    }

    // API still loading — show after a short timeout so new users aren't waiting
    const timer = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(timer);
  }, [pathname, loading, hasCompletedOnboarding, redoActive, visible]);

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
   * Dismisses the modal, shows the widget, and navigates to integrations.
   */
  const handleSyncClick = useCallback(() => {
    closeAndShowWidget();
    setTimeout(() => router.push("/app/settings?section=integrations"), 150);
  }, [closeAndShowWidget, router]);

  /**
   * Dismisses the modal, shows the widget, and starts the tour.
   */
  const handleTourClick = useCallback(() => {
    closeAndShowWidget();
    setTimeout(() => {
      try {
        localStorage.removeItem("caltodo_tour_completed");
        localStorage.removeItem("caltodo_tour_pending");
      } catch { /* non-critical */ }
      window.dispatchEvent(new CustomEvent("caltodo-restart-tour"));
    }, 150);
  }, [closeAndShowWidget]);

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
        className={`bg-popover rounded-2xl shadow-2xl w-full w-[calc(100%-2rem)] max-w-md overflow-hidden ${cardClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sliding container — 200% wide, each page is w-1/2 (= card width) */}
        <div
          className="flex transition-transform duration-400 ease-in-out"
          style={{
            width: "200%",
            transform: screen === 1 ? "translateX(0)" : "translateX(-50%)",
          }}
        >
          {/* Screen 1: Welcome — flex-col so it stretches to match screen 2 height */}
          <div className="w-1/2 p-8 flex flex-col">
            {/* Progress bar */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="h-1 w-12 rounded-full bg-foreground" />
              <div className="h-1 w-12 rounded-full bg-muted-foreground/25" />
            </div>

            {/* Centered content fills remaining space */}
            <div className="flex-1 flex flex-col items-center justify-center">
              {/* Logo */}
              <div className="mb-6">
                <img
                  src="/logo.png"
                  alt="caltodo"
                  className="h-12 dark:invert"
                />
              </div>

              {/* Heading */}
              <h3 className="text-xl font-semibold text-foreground mb-2 text-center">
                welcome to caltodo
              </h3>

              {/* Tagline */}
              <p className="text-sm text-muted-foreground mb-10 leading-relaxed text-center max-w-[260px]">
                your assignments, your schedule, your classmates — one place.
              </p>

              {/* CTA */}
              <button
                onClick={() => setScreen(2)}
                className="px-8 py-2.5 bg-foreground text-background rounded-full text-sm font-medium hover:bg-foreground/90 transition-colors cursor-pointer active:scale-95"
              >
                next &rarr;
              </button>
            </div>
          </div>

          {/* Screen 2: Get started */}
          <div className="w-1/2 p-8 flex flex-col">
            {/* Top row: back arrow + progress bar */}
            <div className="flex items-center mb-8">
              <button
                onClick={() => setScreen(1)}
                className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors rounded-lg cursor-pointer"
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex items-center justify-center gap-2 flex-1">
                <div className="h-1 w-12 rounded-full bg-muted-foreground/25" />
                <div className="h-1 w-12 rounded-full bg-foreground" />
              </div>
              {/* Spacer to balance the back arrow */}
              <div className="w-[26px]" />
            </div>

            {/* Heading — left-aligned */}
            <h3 className="text-xl font-semibold text-foreground mb-2">
              get started
            </h3>

            {/* Subtitle — left-aligned */}
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              here&apos;s what you can do to make caltodo yours.
            </p>

            {/* Preview items */}
            <div className="mb-8">
              {/* Item 1: Sync your classes */}
              <button
                type="button"
                onClick={handleSyncClick}
                className="w-full flex items-start gap-3.5 py-4 border-t border-border text-left hover:bg-accent -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
              >
                <BookOpen size={18} className="text-foreground shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">sync your classes</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    connect bCourses, Gradescope, or Pensive to import assignments
                  </p>
                </div>
              </button>

              {/* Item 2: Take a tour */}
              <button
                type="button"
                onClick={handleTourClick}
                className="w-full flex items-start gap-3.5 py-4 border-t border-border text-left hover:bg-accent -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
              >
                <Compass size={18} className="text-foreground shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">take a tour</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    learn how to use your inbox, calendar, and more
                  </p>
                </div>
              </button>
            </div>

            {/* CTA — right-aligned */}
            <div className="flex justify-end">
              <button
                onClick={closeAndShowWidget}
                className="px-8 py-2.5 bg-foreground text-background rounded-full text-sm font-medium hover:bg-foreground/90 transition-colors cursor-pointer active:scale-95"
              >
                start organizing &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
