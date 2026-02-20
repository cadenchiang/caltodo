"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronLeft } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { trackEvent } from "@/lib/analytics";
import CanvasStep from "@/components/onboarding/CanvasStep";
import GradescopeStep from "@/components/onboarding/GradescopeStep";
type Step = "welcome" | "canvas" | "gradescope" | "done";
const STEPS: Step[] = ["welcome", "canvas", "gradescope", "done"];

/** Display labels for each step in the stepper bar. */
const STEP_LABELS: Record<Step, string> = {
  welcome: "Welcome",
  canvas: "bCourses",
  gradescope: "Gradescope",
  done: "Finish",
};

/** localStorage key to signal the app tour should start after onboarding. */
const TOUR_PENDING_KEY = "caltodo_tour_pending";

/**
 * Auto-syncing "done" step. Triggers sync on mount (fire-and-forget),
 * then fades out the overlay and navigates to /app/inbox.
 *
 * @param onSyncAndGo - Fires background sync and navigates after fade-out
 */
function DoneStep({ onSyncAndGo }: { onSyncAndGo: () => void }) {
  useEffect(() => {
    // Brief pause so user can read "you're all set", then transition out
    const timer = setTimeout(onSyncAndGo, 1200);
    return () => clearTimeout(timer);
  }, [onSyncAndGo]);

  return (
    <div className="text-center">
      <h2 className="text-lg font-bold text-gray-800 mb-2 animate-drop-in">
        you&apos;re all set!
      </h2>
      <p className="text-sm text-gray-500 mb-6 animate-drop-in delay-100">
        syncing your assignments...
      </p>
      <div className="flex justify-center animate-drop-in delay-200">
        <div className="h-6 w-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    </div>
  );
}

/**
 * Full-screen onboarding wizard with 4 steps, always white background.
 * Features stepper-bar progress indicators with step labels.
 * 1. Welcome - intro with staggered drop-in animations
 * 2. Canvas - Token verification + course selection
 * 3. Gradescope - Credential verification + course selection
 * 4. Done - Auto-syncs assignments and navigates to inbox
 *
 * Each step saves credentials via PUT /api/credentials.
 * Sets a localStorage flag on completion to trigger the app tour.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const { triggerSync } = useTaskContext();
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepIndex = STEPS.indexOf(currentStep);

  // Track when each step is viewed
  useEffect(() => {
    trackEvent("onboarding_step_viewed", { step: currentStep });
  }, [currentStep]);

  // Prefetch inbox route so post-onboarding navigation is instant
  useEffect(() => {
    router.prefetch("/app/inbox");
  }, [router]);

  /**
   * Saves credentials to the API via PUT /api/credentials.
   *
   * @param payload - Credential fields to save
   * @returns true on success, false on failure
   */
  async function saveCredentials(payload: Record<string, unknown>): Promise<boolean> {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Save failed: ${res.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSaving(false);
      return false;
    }
    setSaving(false);
    return true;
  }

  /**
   * Handles Canvas step completion with token and selected courses.
   */
  async function handleCanvasNext(payload: {
    canvas_token: string;
    canvas_base_url: string;
    selected_canvas_courses: Array<{ id: number; name: string }>;
  }): Promise<boolean> {
    const ok = await saveCredentials(payload);
    if (!ok) return false;
    trackEvent("onboarding_step_completed", { step: "canvas" });
    setCurrentStep("gradescope");
    return true;
  }

  /**
   * Handles Gradescope step completion with email, password, and selected courses.
   */
  async function handleGradescopeNext(payload: {
    gradescope_email: string;
    gradescope_password: string;
    selected_gradescope_courses: Array<{ id: string; name: string }>;
  }): Promise<boolean> {
    const ok = await saveCredentials(payload);
    if (!ok) return false;
    trackEvent("onboarding_step_completed", { step: "gradescope" });
    setCurrentStep("done");
    return true;
  }

  const [exiting, setExiting] = useState(false);

  /**
   * Starts fade-out, fires sync in background, then navigates to inbox.
   * Sets tour pending flag so the app tour starts on first inbox visit.
   * Sync continues via TaskContext even after navigation.
   */
  function handleSyncAndGo() {
    trackEvent("onboarding_completed");
    setExiting(true);
    // Signal the app tour to start after landing on inbox
    try {
      localStorage.setItem(TOUR_PENDING_KEY, "true");
    } catch {
      /* non-critical */
    }
    // Fire sync in background — it runs in TaskContext and survives navigation
    triggerSync().catch(() => {});
    // Navigate after fade-out animation completes
    setTimeout(() => router.push("/app/inbox"), 500);
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-white force-light transition-opacity duration-500 ${exiting ? "opacity-0" : "opacity-100"}`}>
      {/* Top bar: logo left, centered stepper, close right */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        {/* Logo — left corner */}
        <a href="/" className="cursor-pointer shrink-0">
          <img src="/logo.png" alt="caltodo" className="h-7" />
        </a>

        {/* Stepper bars + back button — centered with constrained width */}
        <div className="flex items-center gap-2 w-full max-w-md mx-6">
          {/* Back button */}
          <button
            onClick={() => {
              if (stepIndex > 0) setCurrentStep(STEPS[stepIndex - 1]);
            }}
            className={`p-1 rounded-lg transition-colors shrink-0 ${
              stepIndex > 0
                ? "text-gray-400 hover:text-gray-800 cursor-pointer"
                : "text-transparent pointer-events-none"
            }`}
            aria-label="Go back"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {STEPS.map((step, i) => {
              const state = i < stepIndex ? "completed" : i === stepIndex ? "active" : "inactive";
              return (
                <div key={step} className="flex-1 flex flex-col gap-1">
                  <span
                    className={`text-[11px] font-medium transition-colors duration-300 ${
                      state === "completed" ? "text-green-600" : state === "active" ? "text-gray-800" : "text-gray-400"
                    }`}
                  >
                    {STEP_LABELS[step]}
                  </span>
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ${
                      state === "completed" ? "bg-green-500" : state === "active" ? "bg-gray-800" : "bg-gray-200"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Close button — right corner */}
        <button
          onClick={() => { trackEvent("onboarding_exited", { step: currentStep }); router.push("/app/inbox"); }}
          className="p-1.5 text-gray-400 hover:text-gray-800 transition-colors rounded-lg shrink-0"
          aria-label="Close onboarding"
        >
          <X size={18} />
        </button>
      </div>

      {/* Step content — vertically centered */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center px-6 pt-4 pb-[20vh]">
          <div className="w-full max-w-md">
          <div key={currentStep} className="animate-step-in">
            {error && (
              <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            {currentStep === "welcome" && (
              <div className="text-center">
                <div className="flex justify-center mb-3 animate-drop-in">
                  <img
                    src="/logo.png"
                    alt="caltodo"
                    className="h-14"
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2 animate-drop-in">
                  welcome to caltodo
                </h1>
                <p className="text-gray-500 text-sm mb-8 animate-drop-in delay-100">
                  connect your bCourses and Gradescope accounts to automatically sync your assignments.
                </p>
                {/* Mobile-only recommendation */}
                <p className="md:hidden text-sm font-semibold text-black mb-6 animate-drop-in delay-150">
                  For the best experience, we recommend completing setup on a computer.
                </p>
                <button
                  onClick={() => setCurrentStep("canvas")}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl font-semibold animate-drop-in delay-200 btn-elevated-primary"
                >
                  get started
                </button>
                <button
                  onClick={() => { trackEvent("onboarding_step_skipped", { step: "welcome" }); router.push("/app/inbox"); }}
                  className="mt-4 px-4 py-2.5 text-sm text-gray-400 rounded-xl bg-white animate-drop-in delay-300 btn-elevated-secondary"
                >
                  skip for now
                </button>
              </div>
            )}

            {currentStep === "canvas" && (
              <CanvasStep
                onNext={handleCanvasNext}
                onSkip={() => { trackEvent("onboarding_step_skipped", { step: "canvas" }); setCurrentStep("gradescope"); }}
                saving={saving}
                error={error}
                setError={setError}
              />
            )}

            {currentStep === "gradescope" && (
              <GradescopeStep
                onNext={handleGradescopeNext}
                onSkip={() => { trackEvent("onboarding_step_skipped", { step: "gradescope" }); setCurrentStep("done"); }}
                saving={saving}
                error={error}
                setError={setError}
              />
            )}

            {currentStep === "done" && (
              <DoneStep onSyncAndGo={handleSyncAndGo} />
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
