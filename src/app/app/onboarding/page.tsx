"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import CanvasStep from "@/components/onboarding/CanvasStep";
import GradescopeStep from "@/components/onboarding/GradescopeStep";

type Step = "welcome" | "canvas" | "gradescope" | "done";
const STEPS: Step[] = ["welcome", "canvas", "gradescope", "done"];

/**
 * Full-screen onboarding wizard with 4 steps.
 * 1. Welcome - "Welcome to toodoocal!"
 * 2. Canvas - Token verification + course selection (via CanvasStep)
 * 3. Gradescope - Credential verification + course selection (via GradescopeStep)
 * 4. Done - "Sync Now" button + skip to inbox
 *
 * Each step saves credentials via PUT /api/credentials.
 * Full-screen overlay with glassmorphism and step transitions.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const { triggerSync } = useTaskContext();
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepIndex = STEPS.indexOf(currentStep);

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

  async function handleSyncAndGo() {
    setSaving(true);
    try {
      await triggerSync();
    } catch {
      // Non-critical — user can sync from inbox later
    }
    setSaving(false);
    router.push("/app/inbox");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-xl">
      {/* Close button */}
      <button
        onClick={() => router.push("/app/inbox")}
        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors"
        aria-label="Close onboarding"
      >
        <X size={20} />
      </button>

      <div className="w-full max-w-md mx-auto px-6">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= stepIndex ? "bg-blue-500 w-8" : "bg-gray-200 w-4"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="glass-strong rounded-2xl shadow-2xl p-8 animate-in">
          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {currentStep === "welcome" && (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome to <span className="text-gray-800">toodoo</span>
                <span className="brand-gradient font-black">cal</span>
              </h1>
              <p className="text-gray-500 text-sm mb-8">
                Connect your Canvas and Gradescope accounts to automatically sync your assignments.
              </p>
              <button
                onClick={() => setCurrentStep("canvas")}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                Get Started
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
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-800 mb-2">You&apos;re all set!</h2>
              <p className="text-sm text-gray-500 mb-6">
                Sync your assignments now, or skip and do it later from the inbox.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSyncAndGo}
                  disabled={saving}
                  className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Syncing..." : "Sync Now & Go to Inbox"}
                </button>
                <button
                  onClick={() => router.push("/app/inbox")}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Skip to Inbox
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
