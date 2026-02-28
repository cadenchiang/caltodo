"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BookOpen, Compass } from "lucide-react";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useTour } from "./AppTour";

/** localStorage key to track dismissal of the welcome prompt. */
const DISMISS_KEY = "caltodo_sync_dismissed";

/** localStorage key to check if tour has already been completed. */
const TOUR_COMPLETED_KEY = "caltodo_tour_completed";

/** localStorage key to resume the slideshow at the tour step after returning from settings. */
const RESUME_TOUR_KEY = "caltodo_welcome_resume_tour";

/**
 * Module-level flag to prevent re-showing the modal on component re-mounts
 * within the same page session.
 */
let dismissedThisSession = false;

type Step = "welcome" | "sync" | "tour";

/**
 * Three-step welcome slideshow shown to new users on their first inbox visit.
 *
 * Step 1 ("welcome"): Welcome to caltodo!
 * Step 2 ("sync"): Prompt to sync classes → Settings/Integrations
 * Step 3 ("tour"): Prompt to take a quick tour → starts guided tour
 *
 * The steps are linked as a slideshow inside a single modal.
 *
 * Show conditions:
 * - Only on `/app/inbox` route
 * - `hasCompletedOnboarding === false`
 * - Not previously dismissed (localStorage)
 * - Tour not already completed
 */
export default function SyncClassesModal() {
  const router = useRouter();
  const pathname = usePathname();
  const { hasCompletedOnboarding, loading } = useOnboardingStatus();
  const { startTour } = useTour();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [step, setStep] = useState<Step>("welcome");

  const [redoActive, setRedoActive] = useState(false);

  // Listen for redo-setup event to reset the module-level dismissal flag
  useEffect(() => {
    function handleReset() {
      dismissedThisSession = false;
      setRedoActive(true);
    }
    window.addEventListener("caltodo-redo-setup", handleReset);
    return () => window.removeEventListener("caltodo-redo-setup", handleReset);
  }, []);

  useEffect(() => {
    if (!pathname?.startsWith("/app/inbox")) return;
    if (loading) return;

    // Check if resuming at tour step after returning from settings
    try {
      if (localStorage.getItem(RESUME_TOUR_KEY) === "true") {
        localStorage.removeItem(RESUME_TOUR_KEY);
        dismissedThisSession = false; // Allow re-show
        setStep("tour");
        const timer = setTimeout(() => setVisible(true), 400);
        return () => clearTimeout(timer);
      }
    } catch { /* ignore */ }

    if (dismissedThisSession) return;
    const isRedo = redoActive || localStorage.getItem("caltodo_redo_active") === "true";
    if (hasCompletedOnboarding && !isRedo) return;

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

    setStep("welcome");
    const timer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(timer);
  }, [pathname, loading, hasCompletedOnboarding, redoActive]);

  /**
   * Closes the modal with a fast exit animation and persists dismissal.
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
    }, 120);
  }, []);

  /** Step 1 "Get Started": advance to sync step. */
  const handleGetStarted = useCallback(() => {
    setStep("sync");
  }, []);

  /**
   * Step 2 CTA: Navigate to Settings/Integrations immediately.
   * Sets tour pending so the tour shows when user returns.
   */
  const handleSync = useCallback(() => {
    dismissedThisSession = true;
    try {
      localStorage.setItem(DISMISS_KEY, "true");
      localStorage.setItem(RESUME_TOUR_KEY, "true");
      localStorage.removeItem("caltodo_redo_active");
    } catch { /* non-critical */ }
    setRedoActive(false);
    setVisible(false);
    router.push("/app/settings?section=integrations");
  }, [router]);

  /** Step 2 "Maybe later": advance to tour step. */
  const handleSkipSync = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, "true");
    } catch { /* non-critical */ }
    setStep("tour");
  }, []);

  /** Step 3 CTA: Start the guided tour. */
  const handleStartTour = useCallback(() => {
    closeModal();
    setTimeout(startTour, 50);
  }, [closeModal, startTour]);

  /** Step 3 "Skip": Close everything, mark tour completed. */
  const handleSkipTour = useCallback(() => {
    try {
      localStorage.setItem(TOUR_COMPLETED_KEY, "true");
      localStorage.removeItem("caltodo_redo_active");
    } catch { /* non-critical */ }
    setRedoActive(false);
    closeModal();
  }, [closeModal]);

  if (!visible) return null;

  const backdropClass = exiting
    ? "animate-announce-backdrop-out"
    : "animate-announce-backdrop-in";

  const cardClass = exiting
    ? "animate-announce-card-out"
    : "animate-announce-card-in";

  /** Returns the active dot index for the step indicator. */
  const stepIndex = step === "welcome" ? 0 : step === "sync" ? 1 : 2;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm ${backdropClass}`}
      onClick={step === "tour" ? handleSkipTour : undefined}
    >
      <div
        className={`bg-popover rounded-2xl border border-border shadow-2xl w-full max-w-md mx-4 p-8 ${cardClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Step indicator dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                i === stepIndex ? "bg-foreground" : "bg-foreground/20"
              }`}
            />
          ))}
        </div>

        {step === "welcome" && (
          /* ── Step 1: Welcome ── */
          <div key="welcome">
            <div
              className="flex justify-center mb-5 animate-drop-in"
              style={{ animationDelay: "150ms" }}
            >
              <img
                src="/logo.png"
                alt="caltodo"
                className="h-14 dark:invert"
              />
            </div>

            <h3
              className="text-xl font-semibold text-foreground text-center mb-3 animate-drop-in"
              style={{ animationDelay: "220ms" }}
            >
              Welcome to caltodo!
            </h3>

            <p
              className="text-sm text-muted-foreground text-center mb-7 leading-relaxed animate-drop-in"
              style={{ animationDelay: "290ms" }}
            >
              The all-in-one task manager for Berkeley students. Sync your assignments, organize your schedule, and never miss a deadline.
            </p>

            <div
              className="animate-drop-in"
              style={{ animationDelay: "360ms" }}
            >
              <button
                onClick={handleGetStarted}
                className="w-full px-4 py-3 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer active:scale-95"
              >
                Get Started
              </button>
            </div>
          </div>
        )}

        {step === "sync" && (
          /* ── Step 2: Sync Classes ── */
          <div key="sync">
            <div className="flex justify-center mb-5 animate-drop-in">
              <div className="w-14 h-14 rounded-full bg-[#007AFF]/10 flex items-center justify-center">
                <BookOpen size={28} className="text-[#007AFF]" />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-foreground text-center mb-3 animate-drop-in">
              Sync Classes
            </h3>

            <p className="text-sm text-muted-foreground text-center mb-7 leading-relaxed animate-drop-in">
              Connect bCourses, Gradescope, or Pensieve to automatically sync your assignments and unlock all features.
            </p>

            <div className="animate-drop-in">
              <button
                onClick={handleSync}
                className="w-full px-4 py-3 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer active:scale-95"
              >
                Sync Classes
              </button>
            </div>

            <div className="animate-drop-in text-center mt-4">
              <button
                onClick={handleSkipSync}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Maybe later
              </button>
            </div>
          </div>
        )}

        {step === "tour" && (
          /* ── Step 3: Quick Tour ── */
          <div key="tour">
            <div className="flex justify-center mb-5 animate-drop-in">
              <div className="w-14 h-14 rounded-full bg-[#007AFF]/10 flex items-center justify-center">
                <Compass size={28} className="text-[#007AFF]" />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-foreground text-center mb-3 animate-drop-in">
              Quick Tour
            </h3>

            <p className="text-sm text-muted-foreground text-center mb-7 leading-relaxed animate-drop-in">
              Take a quick tour to learn how to navigate your inbox, create tasks, and sync your assignments.
            </p>

            <div className="animate-drop-in">
              <button
                onClick={handleStartTour}
                className="w-full px-4 py-3 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer active:scale-95"
              >
                Start Tour
              </button>
            </div>

            <div className="animate-drop-in text-center mt-4">
              <button
                onClick={handleSkipTour}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
