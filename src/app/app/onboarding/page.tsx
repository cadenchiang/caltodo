"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronLeft } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import CanvasStep from "@/components/onboarding/CanvasStep";
import GradescopeStep from "@/components/onboarding/GradescopeStep";
type Step = "welcome" | "canvas" | "gradescope" | "done";
const STEPS: Step[] = ["welcome", "canvas", "gradescope", "done"];

/**
 * Auto-syncing "done" step. Triggers sync on mount (fire-and-forget),
 * then fades out the overlay and navigates to /app/inbox.
 *
 * @param onSyncAndGo - Fires background sync and navigates after fade-out
 */
function DoneStep({ onSyncAndGo }: { onSyncAndGo: () => void }) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;
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
 * 1. Welcome - intro with staggered drop-in animations
 * 2. Canvas - Token verification + course selection
 * 3. Gradescope - Credential verification + course selection
 * 4. Done - Auto-syncs assignments and navigates to inbox
 *
 * Each step saves credentials via PUT /api/credentials.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const { triggerSync } = useTaskContext();
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepIndex = STEPS.indexOf(currentStep);

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
    setCurrentStep("done");
    return true;
  }

  const [exiting, setExiting] = useState(false);

  /**
   * Starts fade-out, fires sync in background, then navigates to inbox.
   * Sync continues via TaskContext even after navigation.
   */
  function handleSyncAndGo() {
    setExiting(true);
    // Fire sync in background — it runs in TaskContext and survives navigation
    triggerSync().catch(() => {});
    // Navigate after fade-out animation completes
    setTimeout(() => router.push("/app/inbox"), 500);
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-white force-light transition-opacity duration-500 ${exiting ? "opacity-0" : "opacity-100"}`}>
      {/* Top bar: logo left, close right */}
      <div className="absolute top-5 left-4">
        <img
          src="/logo.png"
          alt="caltodo"
          className="h-10"
        />
      </div>

      {/* Close button */}
      <button
        onClick={() => router.push("/app/inbox")}
        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-800 transition-colors rounded-lg"
        aria-label="Close onboarding"
      >
        <X size={20} />
      </button>

      <div className="w-full max-w-md mx-auto px-6">
        {/* Step indicator with back button */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => {
              if (stepIndex > 0) setCurrentStep(STEPS[stepIndex - 1]);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              stepIndex > 0
                ? "text-gray-400 hover:text-gray-800 cursor-pointer"
                : "text-transparent pointer-events-none"
            }`}
            aria-label="Go back"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center justify-center gap-2 flex-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= stepIndex ? "bg-gray-800 w-8" : "bg-gray-300 w-4"
                }`}
              />
            ))}
          </div>
          {/* Spacer to keep dots centered */}
          <div className="w-[30px]" />
        </div>

        {/* Step content — key forces re-mount to re-trigger animation */}
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
              <button
                onClick={() => setCurrentStep("canvas")}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl font-semibold animate-drop-in delay-200 btn-elevated-primary"
              >
                get started
              </button>
              <button
                onClick={() => router.push("/app/inbox")}
                className="mt-4 px-4 py-2.5 text-sm text-gray-400 rounded-xl bg-white animate-drop-in delay-300 btn-elevated-secondary"
              >
                skip for now
              </button>
            </div>
          )}

          {currentStep === "canvas" && (
            <CanvasStep
              onNext={handleCanvasNext}
              onSkip={() => setCurrentStep("gradescope")}
              saving={saving}
              error={error}
              setError={setError}
            />
          )}

          {currentStep === "gradescope" && (
            <GradescopeStep
              onNext={handleGradescopeNext}
              onSkip={() => setCurrentStep("done")}
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
  );
}
