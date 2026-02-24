"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { trackEvent } from "@/lib/analytics";
import CanvasStep from "@/components/onboarding/CanvasStep";
import GradescopeStep from "@/components/onboarding/GradescopeStep";
import PensieveStep from "@/components/onboarding/PensieveStep";

type Step = "welcome" | "platforms" | "canvas" | "gradescope" | "pensieve" | "done";
type Platform = "canvas" | "gradescope" | "pensieve";

/** Display labels for each step in the stepper bar. */
const STEP_LABELS: Record<Step, string> = {
  welcome: "Welcome",
  platforms: "Platforms",
  canvas: "bCourses",
  gradescope: "Gradescope",
  pensieve: "Pensieve",
  done: "Finish",
};

/** Platform options shown in the platform selection step. */
const PLATFORM_OPTIONS: Array<{ id: Platform; label: string; description: string; logo: string }> = [
  { id: "canvas", label: "bCourses", description: "Sync assignments from Canvas/bCourses", logo: "/bcourses-logo.png" },
  { id: "gradescope", label: "Gradescope", description: "Sync deadlines from Gradescope", logo: "/gradescope-logo.png" },
  { id: "pensieve", label: "Pensieve", description: "Sync CS/DS assignments from Pensieve", logo: "/pensieve-logo.png" },
];

/** localStorage key to signal the app tour should start after onboarding. */
const TOUR_PENDING_KEY = "caltodo_tour_pending";

/** Valid platforms for standalone ?setup= mode. */
const VALID_SETUP_PLATFORMS = new Set<string>(["canvas", "gradescope", "pensieve"]);

/** Display labels for standalone setup mode header. */
const SETUP_LABELS: Record<string, string> = {
  canvas: "bCourses",
  gradescope: "Gradescope",
  pensieve: "Pensieve",
};

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
 * Full-screen onboarding wizard with dynamic steps, always white background.
 * Features stepper-bar progress indicators with step labels.
 * 1. Welcome - intro with staggered drop-in animations
 * 2. Platforms - select which integrations to configure
 * 3. Canvas/Gradescope/Pensieve - only shown if selected in step 2
 * 4. Done - Auto-syncs assignments and navigates to inbox
 *
 * Each step saves credentials via PUT /api/credentials.
 * Sets a localStorage flag on completion to trigger the app tour.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { triggerSync } = useTaskContext();

  // Standalone single-step setup mode: ?setup=canvas|gradescope|pensieve
  const setupParam = searchParams.get("setup");
  const isStandaloneSetup = setupParam !== null && VALID_SETUP_PLATFORMS.has(setupParam);

  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(new Set());

  // Draft state refs — persisted across step navigation without causing re-renders.
  // Updated by each step on unmount; read by each step on mount.
  const canvasDraftRef = useRef<{
    token: string; baseUrl: string;
    courses: Array<{ id: number; name: string; course_code: string }> | null;
    selectedIds: number[];
  }>({ token: "", baseUrl: "https://bcourses.berkeley.edu", courses: null, selectedIds: [] });

  const gradescopeDraftRef = useRef<{
    email: string; password: string;
    courses: Array<{ id: string; name: string; shortName: string }> | null;
    selectedIds: string[];
  }>({ email: "", password: "", courses: null, selectedIds: [] });

  const pensieveDraftRef = useRef<{ url: string }>({ url: "" });

  const handleCanvasDraft = useCallback((d: typeof canvasDraftRef.current) => { canvasDraftRef.current = d; }, []);
  const handleGradescopeDraft = useCallback((d: typeof gradescopeDraftRef.current) => { gradescopeDraftRef.current = d; }, []);
  const handlePensieveDraft = useCallback((d: typeof pensieveDraftRef.current) => { pensieveDraftRef.current = d; }, []);

  /** Dynamic step list based on selected platforms. */
  const steps = useMemo<Step[]>(() => {
    const platformSteps: Step[] = [];
    if (selectedPlatforms.has("canvas")) platformSteps.push("canvas");
    if (selectedPlatforms.has("gradescope")) platformSteps.push("gradescope");
    if (selectedPlatforms.has("pensieve")) platformSteps.push("pensieve");
    return ["welcome", "platforms", ...platformSteps, "done"];
  }, [selectedPlatforms]);

  const stepIndex = steps.indexOf(currentStep);

  /**
   * Returns the next step after the given step in the dynamic steps array.
   *
   * @param step - Current step to find the successor of
   * @returns The next Step, or "done" if at the end
   */
  const nextStepAfter = useCallback((step: Step): Step => {
    const idx = steps.indexOf(step);
    return steps[idx + 1] ?? "done";
  }, [steps]);

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
    setCurrentStep(nextStepAfter("canvas"));
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
    setCurrentStep(nextStepAfter("gradescope"));
    return true;
  }

  /**
   * Handles Pensieve step completion with calendar URL.
   */
  async function handlePensieveNext(payload: {
    pensieve_calendar_url: string;
  }): Promise<boolean> {
    const ok = await saveCredentials(payload);
    if (!ok) return false;
    trackEvent("onboarding_step_completed", { step: "pensieve" });
    setCurrentStep(nextStepAfter("pensieve"));
    return true;
  }

  /**
   * Handles standalone setup completion. Shows success toast, then redirects to Settings.
   */
  function handleStandaloneSuccess() {
    trackEvent("standalone_setup_completed", { platform: setupParam });
    // Fire sync for only the just-connected platform
    const platform = setupParam as "canvas" | "gradescope" | "pensieve";
    triggerSync(undefined, [platform]).catch(() => {});
    setTimeout(() => router.push("/app/settings?section=integrations"), 800);
  }

  /**
   * Handles standalone setup skip/cancel. Redirects back to Settings.
   */
  function handleStandaloneSkip() {
    trackEvent("standalone_setup_skipped", { platform: setupParam });
    router.push("/app/settings?section=integrations");
  }

  /**
   * Standalone Canvas handler: saves credentials, then redirects to Settings.
   */
  async function handleStandaloneCanvasNext(payload: {
    canvas_token: string;
    canvas_base_url: string;
    selected_canvas_courses: Array<{ id: number; name: string }>;
  }): Promise<boolean> {
    const ok = await saveCredentials(payload);
    if (!ok) return false;
    handleStandaloneSuccess();
    return true;
  }

  /**
   * Standalone Gradescope handler: saves credentials, then redirects to Settings.
   */
  async function handleStandaloneGradescopeNext(payload: {
    gradescope_email: string;
    gradescope_password: string;
    selected_gradescope_courses: Array<{ id: string; name: string }>;
  }): Promise<boolean> {
    const ok = await saveCredentials(payload);
    if (!ok) return false;
    handleStandaloneSuccess();
    return true;
  }

  /**
   * Standalone Pensieve handler: saves credentials, then redirects to Settings.
   */
  async function handleStandalonePensieveNext(payload: {
    pensieve_calendar_url: string;
  }): Promise<boolean> {
    const ok = await saveCredentials(payload);
    if (!ok) return false;
    handleStandaloneSuccess();
    return true;
  }

  // ---- Standalone single-step setup mode rendering ----
  if (isStandaloneSetup) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-white force-light">
        {/* Minimal header: back arrow + title */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-3">
          <button
            onClick={handleStandaloneSkip}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-800 transition-colors"
            aria-label="Back to settings"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">
            Set up {SETUP_LABELS[setupParam]}
          </h1>
        </div>

        {/* Step content — vertically centered */}
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center px-6 pt-4 pb-[20vh]">
            <div className="w-full max-w-md">
              <div className="animate-step-in">
                {error && (
                  <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-xl mb-4">
                    {error}
                  </div>
                )}

                {setupParam === "canvas" && (
                  <CanvasStep
                    onNext={handleStandaloneCanvasNext}
                    onSkip={handleStandaloneSkip}
                    saving={saving}
                    error={error}
                    setError={setError}
                  />
                )}

                {setupParam === "gradescope" && (
                  <GradescopeStep
                    onNext={handleStandaloneGradescopeNext}
                    onSkip={handleStandaloneSkip}
                    saving={saving}
                    error={error}
                    setError={setError}
                  />
                )}

                {setupParam === "pensieve" && (
                  <PensieveStep
                    onNext={handleStandalonePensieveNext}
                    onSkip={handleStandaloneSkip}
                    saving={saving}
                    error={error}
                    setError={setError}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /** Toggles a platform in the selected set. */
  function togglePlatform(platform: Platform) {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(platform)) {
        next.delete(platform);
      } else {
        next.add(platform);
      }
      return next;
    });
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
      // New users completing onboarding should never see the Pensieve announcement
      localStorage.setItem("caltodo_pensieve_announced", "true");
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
        {/* Logo — left corner (non-interactive during onboarding) */}
        <div className="shrink-0">
          <img src="/logo.png" alt="caltodo" className="h-7" />
        </div>

        {/* Stepper bars + back button — centered with constrained width */}
        <div className="flex items-center gap-2 w-full max-w-md mx-6">
          {/* Back button */}
          <button
            onClick={() => {
              if (stepIndex > 0) setCurrentStep(steps[stepIndex - 1]);
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
            {steps.map((step, i) => {
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

        {/* Spacer to balance the logo on the left */}
        <div className="w-7 shrink-0" />
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
                <p className="text-gray-500 text-sm mb-3 animate-drop-in delay-100">
                  connect your bCourses, Gradescope, and Pensieve accounts to automatically sync your assignments.
                </p>
                <p className="text-gray-800 text-sm font-semibold mb-8 animate-drop-in delay-150 text-center">
                  this takes about 5-10 minutes.
                </p>
                {/* Mobile-only recommendation */}
                <p className="md:hidden text-sm font-semibold text-black mb-6 animate-drop-in delay-150">
                  For the best experience, we recommend completing setup on a computer.
                </p>
                <button
                  onClick={() => setCurrentStep("platforms")}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl font-semibold animate-drop-in delay-200 btn-elevated-primary"
                >
                  get started
                </button>
              </div>
            )}

            {currentStep === "platforms" && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-2 animate-drop-in">
                  select your platforms
                </h2>
                <p className="text-sm text-gray-500 mb-6 animate-drop-in delay-100">
                  which platforms do you use? you can always change this later.
                </p>
                <div className="flex flex-col gap-3 mb-8">
                  {PLATFORM_OPTIONS.map((opt, i) => {
                    const selected = selectedPlatforms.has(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => togglePlatform(opt.id)}
                        className={`animate-drop-in flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                          selected
                            ? "border-gray-800 bg-gray-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        style={{ animationDelay: `${(i + 2) * 50}ms` }}
                      >
                        <img
                          src={opt.logo}
                          alt={opt.label}
                          className="w-8 h-8 object-contain shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-gray-800">{opt.label}</span>
                          <p className="text-xs text-gray-500">{opt.description}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                          selected ? "border-gray-800 bg-gray-800" : "border-gray-300"
                        }`}>
                          {selected && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => {
                    trackEvent("onboarding_platforms_selected", {
                      platforms: Array.from(selectedPlatforms).join(","),
                    });
                    if (selectedPlatforms.size === 0) {
                      setCurrentStep("done");
                    } else {
                      setCurrentStep(nextStepAfter("platforms"));
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl font-semibold btn-elevated-primary animate-drop-in"
                  style={{ animationDelay: "250ms" }}
                >
                  {selectedPlatforms.size === 0 ? "skip setup" : "continue"}
                </button>
              </div>
            )}

            {currentStep === "canvas" && (
              <CanvasStep
                onNext={handleCanvasNext}
                onSkip={() => { trackEvent("onboarding_step_skipped", { step: "canvas" }); setCurrentStep(nextStepAfter("canvas")); }}
                saving={saving}
                error={error}
                setError={setError}
                initialToken={canvasDraftRef.current.token}
                initialBaseUrl={canvasDraftRef.current.baseUrl}
                initialCourses={canvasDraftRef.current.courses}
                initialSelectedIds={canvasDraftRef.current.selectedIds}
                onDraftChange={handleCanvasDraft}
              />
            )}

            {currentStep === "gradescope" && (
              <GradescopeStep
                onNext={handleGradescopeNext}
                onSkip={() => { trackEvent("onboarding_step_skipped", { step: "gradescope" }); setCurrentStep(nextStepAfter("gradescope")); }}
                saving={saving}
                error={error}
                setError={setError}
                initialEmail={gradescopeDraftRef.current.email}
                initialPassword={gradescopeDraftRef.current.password}
                initialCourses={gradescopeDraftRef.current.courses}
                initialSelectedIds={gradescopeDraftRef.current.selectedIds}
                onDraftChange={handleGradescopeDraft}
              />
            )}

            {currentStep === "pensieve" && (
              <PensieveStep
                onNext={handlePensieveNext}
                onSkip={() => { trackEvent("onboarding_step_skipped", { step: "pensieve" }); setCurrentStep(nextStepAfter("pensieve")); }}
                saving={saving}
                error={error}
                setError={setError}
                initialUrl={pensieveDraftRef.current.url}
                onDraftChange={handlePensieveDraft}
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
