"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { BRAND, PROVIDER_LABELS, SKIP_LABEL } from "@/lib/copy";
import { useTaskContext } from "@/contexts/TaskContext";
import { trackEvent } from "@/lib/analytics";
import { CLASSROOM_AVAILABLE } from "@/lib/classroom-availability";
import {
  loadProgress,
  saveProgress,
  clearProgress,
  progressPercentInList,
  type OnboardingStep,
  type OnboardingPlatform,
} from "@/lib/onboarding-progress";
import CanvasStep from "@/components/onboarding/CanvasStep";
import GradescopeStep from "@/components/onboarding/GradescopeStep";
import PensieveStep from "@/components/onboarding/PensieveStep";
import BrightspaceStep from "@/components/onboarding/BrightspaceStep";
import BlackboardStep from "@/components/onboarding/BlackboardStep";
import type { FeedProvider } from "@/lib/integration-providers";
import CalendarStep from "@/components/onboarding/CalendarStep";
import ClassroomStep from "@/components/onboarding/ClassroomStep";
import AddCanvasStep from "@/components/onboarding/AddCanvasStep";
import SyllabusStep from "@/components/onboarding/SyllabusStep";
import DoneStep from "@/components/onboarding/DoneStep";
import { buildSyncStats, type SyncStats } from "@/lib/onboarding-sync-stats";
import PlatformsStep, { isPlatformSelectable } from "@/components/onboarding/PlatformsStep";
import { ErrorBanner } from "@/components/onboarding/StepChrome";
import { PickerStep, WelcomeStep } from "@/components/onboarding/IntroSteps";
import { SCHOOL_OPTIONS, REFERRAL_OPTIONS } from "@/components/onboarding/onboardingOptions";
import { buildEntries, searchSchools } from "@/lib/school-search";
import { canvasHostForSchool } from "@/lib/seo/schools";
import type { IntegrationCredentials, AdditionalCanvasAccountInput } from "@/lib/types";

/**
 * Prebuilt alias index for the school picker, computed once at module load so
 * every keystroke reuses it.
 */
const SCHOOL_ENTRIES = buildEntries(SCHOOL_OPTIONS);

/**
 * Alias-aware, typo-tolerant matcher for the school picker.
 *
 * @param query - What the user typed
 * @returns Matching school names, best first
 */
function searchSchoolOptions(query: string): string[] {
  return searchSchools(query, SCHOOL_ENTRIES);
}

/** Alias of the persisted step union, so saved progress and the flow
    can never disagree about what a step is called. */
type Step = OnboardingStep;
type Platform = OnboardingPlatform;

/**
 * Integration steps that need the flow's shared "Skip for now" control.
 *
 * Each of these components accepts an `onSkip` prop and never renders anything
 * that calls it, so users had no way past them. Brightspace is excluded: it
 * renders its own skip button, which the standalone setup flow relabels to
 * "Cancel", and a shared control would put two of them on screen.
 */
const STEPS_NEEDING_SKIP_CONTROL: readonly Step[] = [
  "canvas",
  "gradescope",
  "pensieve",
  "syllabus",
];

/** Where every exit from the flow lands unless a destination is passed. */
const EXIT_ROUTE = "/app/inbox";

/**
 * Valid platforms for standalone ?setup= mode. Classroom is only accepted
 * while it can actually be connected; otherwise ?setup=classroom rendered a
 * Connect link that just returned to Settings.
 */
const VALID_SETUP_PLATFORMS = new Set<string>([
  "canvas", "gradescope", "pensieve", "brightspace", "blackboard",
  "canvas-add", "pensieve-add", "brightspace-add", "blackboard-add", "syllabus",
  ...(CLASSROOM_AVAILABLE ? ["classroom"] : []),
]);

/** Display labels for standalone setup mode header. */
const SETUP_LABELS: Record<string, string> = {
  canvas: "Canvas",
  gradescope: "Gradescope",
  pensieve: "Pensive",
  brightspace: "Brightspace",
  blackboard: "Blackboard",
  "canvas-add": "Canvas",
  "pensieve-add": "another Pensive calendar",
  "brightspace-add": "another Brightspace calendar",
  "blackboard-add": "another Blackboard calendar",
  syllabus: "Syllabus",
  classroom: "Google Classroom",
};

/**
 * Full-screen onboarding wizard with dynamic steps, always white background.
 * Features stepper-bar progress indicators with step labels.
 * 1. Welcome - intro with staggered drop-in animations
 * 2. Platforms - select which integrations to configure
 * 3. Canvas/Gradescope/Pensieve - only shown if selected in step 2
 * 4. Done - Auto-syncs assignments and navigates to inbox
 *
 * Each step saves credentials via PUT /api/credentials.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { triggerSync, syncResult, error: syncError } = useTaskContext();

  // Standalone single-step setup mode: ?setup=canvas|gradescope|pensieve
  const setupParam = searchParams.get("setup");
  const isStandaloneSetup = setupParam !== null && VALID_SETUP_PLATFORMS.has(setupParam);

  // Declared up here, above the isStandaloneSetup early return further down,
  // because hook order has to be identical on every render of this component.
  // They used to sit below that return, so the component called 30 hooks with
  // ?setup=<platform> in the URL and 32 without. Switching between those two
  // URLs re-renders this instance rather than remounting it (the App Router
  // treats it as the same route), so React hit "Rendered more hooks than
  // during the previous render" and the page crashed. The health banner
  // pushes /app/onboarding?setup=canvas, which makes that a reachable path.
  const [exiting, setExiting] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);

  // Syllabus phase tracking for conditional layout
  const [syllabusPhase, setSyllabusPhase] = useState<"upload" | "extracting" | "preview">("upload");
  /** Assignments imported from syllabi, which bypass the sync engine entirely. */
  const syllabusImportRef = useRef<{ count: number; courses: string[] }>({ count: 0, courses: [] });

  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(new Set());
  /** Free-form school name selected on the "school" step. Tracked for analytics only. */
  const [school, setSchool] = useState<string>("");
  /** Free-form referral source selected on the "referral" step. Tracked for analytics only. */
  const [referral, setReferral] = useState<string>("");

  // Draft state refs, persisted across step navigation without causing re-renders.
  // Updated by each step on unmount; read by each step on mount.
  const canvasDraftRef = useRef<{
    token: string; baseUrl: string;
    courses: Array<{ id: number; name: string; course_code: string }> | null;
    selectedIds: number[];
    icalUrl: string;
    icalCourses: Array<{ name: string }> | null;
    icalSelectedNames: string[];
    mode: "ical" | "api";
  }>({
    token: "",
    baseUrl: "",
    courses: null,
    selectedIds: [],
    icalUrl: "",
    icalCourses: null,
    icalSelectedNames: [],
    mode: "ical",
  });

  const gradescopeDraftRef = useRef<{
    email: string; password: string;
    courses: Array<{ id: string; name: string; shortName: string }> | null;
    selectedIds: string[];
  }>({ email: "", password: "", courses: null, selectedIds: [] });

  const pensieveDraftRef = useRef<{ url: string }>({ url: "" });

  // Pre-fill Gradescope email when retrying from settings (standalone mode)
  const [standaloneGradescopeEmail, setStandaloneGradescopeEmail] = useState("");
  useEffect(() => {
    if (setupParam === "gradescope") {
      fetch("/api/credentials")
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data?.gradescope_email) {
            setStandaloneGradescopeEmail(data.gradescope_email);
          }
        })
        .catch(() => {});
    }
  }, [setupParam]);

  const handleCanvasDraft = useCallback((d: typeof canvasDraftRef.current) => { canvasDraftRef.current = d; }, []);
  const handleGradescopeDraft = useCallback((d: typeof gradescopeDraftRef.current) => { gradescopeDraftRef.current = d; }, []);
  const handlePensieveDraft = useCallback((d: typeof pensieveDraftRef.current) => { pensieveDraftRef.current = d; }, []);

  /** Dynamic step list based on selected platforms. */
  const steps = useMemo<Step[]>(() => {
    // Order follows ONBOARDING_STEPS. "gcal" and "classroom" were selectable
    // and rendered below but missing here, so picking either one skipped
    // straight past its step: nextStepAfter() never landed on it.
    const platformSteps: Step[] = [];
    if (selectedPlatforms.has("gcal")) platformSteps.push("gcal");
    if (selectedPlatforms.has("canvas")) platformSteps.push("canvas");
    if (selectedPlatforms.has("gradescope")) platformSteps.push("gradescope");
    if (selectedPlatforms.has("pensieve")) platformSteps.push("pensieve");
    if (selectedPlatforms.has("brightspace")) platformSteps.push("brightspace");
    if (selectedPlatforms.has("blackboard")) platformSteps.push("blackboard");
    if (selectedPlatforms.has("classroom")) platformSteps.push("classroom");
    if (selectedPlatforms.has("syllabus")) platformSteps.push("syllabus");
    return ["welcome", "school", "referral", "platforms", ...platformSteps, "done"];
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

  /**
   * Advances past an integration step without connecting it.
   *
   * Every integration step component accepted an `onSkip` prop and none of
   * them ever rendered a control that called it, so `onboarding_step_skipped`
   * had not fired once in 90 days while 26 of 65 non-completers sat stuck on
   * a platform step. The control now lives in the flow's shared chrome, so
   * there is one implementation and it cannot go missing from one step.
   *
   * @param step - The step being skipped, recorded on the analytics event.
   */
  const handleSkipStep = useCallback((step: Step) => {
    trackEvent("onboarding_step_skipped", { step });
    setError(null);
    setCurrentStep(nextStepAfter(step));
  }, [nextStepAfter]);

  /**
   * Whether the saved-progress restore has run.
   *
   * Analytics waits on this. Firing "onboarding_step_viewed" before the
   * restore lands would log a phantom "welcome" for every resumed session,
   * which is the exact double-count this persistence is meant to remove.
   */
  const [restored, setRestored] = useState(false);

  // Restore any position saved on a previous visit. Runs once, on mount.
  // Reading localStorage during render would desync SSR from hydration, so it
  // has to happen here even though it means setting state from an effect.
  /*
   * Seeds state from a browser-only store on mount. The lint-clean
   * alternative, a lazy useState initializer, would read localStorage during
   * render and desync the SSR'd HTML from hydration. This effect has an empty
   * dependency array and sets `restored` exactly once, so it cannot cascade.
   */
  // None of the three effects below belong to standalone ?setup= mode: it is
  // a single step reached from Settings, not a position in the flow. Running
  // them there fired a phantom "welcome" view and wrote a bogus snapshot
  // that the next real visit to the flow then resumed from.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isStandaloneSetup) return;
    const saved = loadProgress();
    if (saved) {
      setSelectedPlatforms(new Set(saved.platforms as Platform[]));
      setSchool(saved.school);
      setReferral(saved.referral);
      setCurrentStep(saved.step);
    }
    setRestored(true);
  }, [isStandaloneSetup]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persist the position on every change, so a reload resumes here. Skipped
  // until the restore has run, or the initial "welcome" would overwrite the
  // very snapshot being read. "done" is not saved: the user is finished, and
  // resuming a completed flow just traps them on the last screen.
  useEffect(() => {
    if (isStandaloneSetup) return;
    if (!restored || currentStep === "done") return;
    saveProgress({
      step: currentStep,
      platforms: [...selectedPlatforms] as OnboardingPlatform[],
      school,
      referral,
    });
  }, [isStandaloneSetup, restored, currentStep, selectedPlatforms, school, referral]);

  // Track when each step is viewed
  useEffect(() => {
    if (isStandaloneSetup) return;
    if (!restored) return;
    trackEvent("onboarding_step_viewed", { step: currentStep });
  }, [isStandaloneSetup, currentStep, restored]);

  // Prefetch every route onboarding can exit to, so the final navigation is
  // instant. Completing setup lands on /app/home; "Skip for now" lands on
  // /app/inbox. Only inbox used to be prefetched, so the common completion
  // path paid a cold route load after the exit fade had already finished,
  // which read as a stall and a loading-skeleton flash.
  useEffect(() => {
    router.prefetch(EXIT_ROUTE);
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
    canvas_token?: string;
    canvas_base_url?: string;
    canvas_ical_url?: string;
    selected_canvas_courses?: Array<{ id: number; name: string }>;
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
   * Handles Pensieve step completion with calendar URL and optional course selection.
   */
  async function handlePensieveNext(payload: {
    pensieve_calendar_url: string;
    selected_pensieve_courses?: Array<{ id: string; name: string }>;
  }): Promise<boolean> {
    const ok = await saveCredentials(payload);
    if (!ok) return false;
    trackEvent("onboarding_step_completed", { step: "pensieve" });
    setCurrentStep(nextStepAfter("pensieve"));
    return true;
  }

  /**
   * Saves the Brightspace calendar URL and advances.
   *
   * @param payload - The validated Brightspace calendar feed URL
   * @returns True when the credentials saved and the step advanced
   */
  async function handleBrightspaceNext(payload: {
    brightspace_calendar_url: string;
  }): Promise<boolean> {
    const ok = await saveCredentials(payload);
    if (!ok) return false;
    trackEvent("onboarding_step_completed", { step: "brightspace" });
    setCurrentStep(nextStepAfter("brightspace"));
    return true;
  }

  /**
   * Saves the Blackboard feed URL and advances the flow.
   *
   * @param payload - The validated Blackboard calendar feed URL
   * @returns True when the credentials saved and the step advanced
   */
  async function handleBlackboardNext(payload: {
    blackboard_calendar_url: string;
  }): Promise<boolean> {
    const ok = await saveCredentials(payload);
    if (!ok) return false;
    trackEvent("onboarding_step_completed", { step: "blackboard" });
    setCurrentStep(nextStepAfter("blackboard"));
    return true;
  }

  /** Whether the standalone setup overlay is fading out before navigation. */
  const [standaloneExiting, setStandaloneExiting] = useState(false);

  /**
   * Handles standalone setup completion. Fades out, then redirects to Settings.
   */
  function handleStandaloneSuccess() {
    trackEvent("standalone_setup_completed", { platform: setupParam });
    // Syllabus does not use the sync engine, so skip triggerSync for it
    if (setupParam !== "syllabus") {
      const platform = setupParam === "canvas-add" ? "canvas" : setupParam as "canvas" | "gradescope" | "pensieve" | "brightspace" | "blackboard";
      triggerSync(undefined, [platform]).catch(() => {});
    }
    setStandaloneExiting(true);
    setTimeout(() => router.push("/app/settings?section=integrations"), 100);
  }

  /**
   * Handles adding an additional Canvas account.
   * Fetches current credentials, appends the new account to the JSONB array, and saves.
   *
   * @param payload - The new account details (label, base_url, token, selected_courses)
   * @returns true on success, false on failure
   */
  async function handleAddCanvasNext(payload: {
    label: string;
    base_url: string;
    token?: string;
    ical_url?: string;
    selected_courses?: Array<{ id: number; name: string }>;
  }): Promise<boolean> {
    setSaving(true);
    setError(null);
    try {
      // Fetch current credentials to get existing additional accounts
      const getRes = await fetch("/api/credentials");
      if (!getRes.ok) throw new Error("Failed to fetch current credentials");
      const current: IntegrationCredentials = await getRes.json();

      const newAccount: AdditionalCanvasAccountInput = {
        id: `canvas-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label: payload.label,
        base_url: payload.base_url,
        token: payload.token ?? "",
        token_created_at: new Date().toISOString(),
        selected_courses: payload.selected_courses ?? null,
        ical_url: payload.ical_url,
      };

      const updatedAccounts = [...(current.additional_canvas_accounts ?? []), newAccount];

      const putRes = await fetch("/api/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ additional_canvas_accounts: updatedAccounts }),
      });
      if (!putRes.ok) {
        const body = await putRes.json().catch(() => ({}));
        throw new Error(body.error || `Save failed: ${putRes.status}`);
      }
      handleStandaloneSuccess();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setSaving(false);
    }
  }

  /**
   * Standalone Syllabus handler: no credentials to save, just navigate back.
   */
  async function handleStandaloneSyllabusNext(): Promise<boolean> {
    handleStandaloneSuccess();
    return true;
  }

  /**
   * Handles standalone setup skip/cancel. Redirects back to Settings.
   */
  function handleStandaloneSkip() {
    trackEvent("standalone_setup_skipped", { platform: setupParam });
    setStandaloneExiting(true);
    setTimeout(() => router.push("/app/settings?section=integrations"), 100);
  }

  /**
   * Standalone Canvas handler: saves credentials, then redirects to Settings.
   */
  async function handleStandaloneCanvasNext(payload: {
    canvas_token?: string;
    canvas_base_url?: string;
    canvas_ical_url?: string;
    selected_canvas_courses?: Array<{ id: number; name: string }>;
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
    selected_pensieve_courses?: Array<{ id: string; name: string }>;
  }): Promise<boolean> {
    const ok = await saveCredentials(payload);
    if (!ok) return false;
    handleStandaloneSuccess();
    return true;
  }

  /**
   * Standalone Brightspace handler: saves the feed URL, then redirects to Settings.
   */
  async function handleStandaloneBrightspaceNext(payload: {
    brightspace_calendar_url: string;
  }): Promise<boolean> {
    const ok = await saveCredentials(payload);
    if (!ok) return false;
    handleStandaloneSuccess();
    return true;
  }

  /**
   * Standalone Blackboard handler: saves the feed URL, then redirects to Settings.
   */
  async function handleStandaloneBlackboardNext(payload: {
    blackboard_calendar_url: string;
  }): Promise<boolean> {
    const ok = await saveCredentials(payload);
    if (!ok) return false;
    handleStandaloneSuccess();
    return true;
  }

  /**
   * Saves an additional feed account, as opposed to the primary one.
   *
   * The `<provider>-add` setup routes land here. The primary account still
   * lives in its flat integration_credentials column; extras go to
   * integration_accounts via its own endpoint, which enforces the same SSRF
   * allowlist and refuses providers that cannot hold a second account.
   *
   * @param provider - Feed provider the new account belongs to.
   * @param calendarUrl - The iCal feed URL the user pasted.
   * @returns True when the account was created and the flow may exit.
   */
  async function handleAddFeedAccount(
    provider: FeedProvider,
    calendarUrl: string
  ): Promise<boolean> {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/integration-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, calendar_url: calendarUrl }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add account");
      }
      trackEvent("standalone_setup_completed", { platform: `${provider}-add` });
      triggerSync(undefined, [provider]).catch(() => {});
      setStandaloneExiting(true);
      setTimeout(() => router.push("/app/settings?section=integrations"), 100);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add account");
      return false;
    } finally {
      setSaving(false);
    }
  }

  // ---- Standalone single-step setup mode rendering ----
  if (isStandaloneSetup) {
    const isSyllabusPreview = setupParam === "syllabus" && syllabusPhase === "preview";
    const isSyllabusExtracting = setupParam === "syllabus" && syllabusPhase === "extracting";

    return (
      <div className={`fixed inset-0 z-50 flex flex-col bg-background animate-overlay-in transition-opacity duration-150 ${standaloneExiting ? "opacity-0" : "opacity-100"}`}>
        {/* Minimal header: back arrow + title (hidden during extracting) */}
        {!isSyllabusExtracting && (
          <div className="flex items-center gap-3 px-6 pt-5 pb-3 shrink-0">
            <IconButton aria-label="Back to settings" onClick={handleStandaloneSkip}>
              <ChevronLeft size={20} />
            </IconButton>
            <h1 className="text-lg font-semibold text-foreground">
              Set up {SETUP_LABELS[setupParam]}
            </h1>
          </div>
        )}

        {/* Step content: layout varies by syllabus phase */}
        <div className={`flex-1 ${isSyllabusPreview ? "overflow-hidden" : "overflow-y-auto"}`}>
          <div className={`min-h-full flex items-center justify-center px-6 ${isSyllabusPreview ? "h-full pt-2 pb-4" : "pt-4 pb-[20vh]"}`}>
            <div className={`w-full ${isSyllabusPreview ? "max-w-5xl h-full" : "max-w-md"}`}>
              {/* A gentle lift, not the wizard's slide-from-the-right: this is
                  a single step opened from settings, so nothing came before it
                  for the content to slide in from. */}
              <div className={`animate-phase-in ${isSyllabusPreview ? "h-full" : ""}`}>
                {setupParam !== "syllabus" && <ErrorBanner message={error} />}

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
                    initialEmail={standaloneGradescopeEmail}
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

                {setupParam === "brightspace" && (
                  <BrightspaceStep
                    skipLabel="Cancel"
                    onNext={handleStandaloneBrightspaceNext}
                    onSkip={handleStandaloneSkip}
                    saving={saving}
                    error={error}
                    setError={setError}
                  />
                )}

                {setupParam === "blackboard" && (
                  <BlackboardStep
                    skipLabel="Cancel"
                    onNext={handleStandaloneBlackboardNext}
                    onSkip={handleStandaloneSkip}
                    saving={saving}
                    error={error}
                    setError={setError}
                  />
                )}

                {setupParam === "pensieve-add" && (
                  <PensieveStep
                    onNext={(p) => handleAddFeedAccount("pensieve", p.pensieve_calendar_url)}
                    onSkip={handleStandaloneSkip}
                    saving={saving}
                    error={error}
                    setError={setError}
                  />
                )}

                {setupParam === "brightspace-add" && (
                  <BrightspaceStep
                    skipLabel="Cancel"
                    onNext={(p) => handleAddFeedAccount("brightspace", p.brightspace_calendar_url)}
                    onSkip={handleStandaloneSkip}
                    saving={saving}
                    error={error}
                    setError={setError}
                  />
                )}

                {setupParam === "blackboard-add" && (
                  <BlackboardStep
                    skipLabel="Cancel"
                    onNext={(p) => handleAddFeedAccount("blackboard", p.blackboard_calendar_url)}
                    onSkip={handleStandaloneSkip}
                    saving={saving}
                    error={error}
                    setError={setError}
                  />
                )}

                {setupParam === "classroom" && (
                  <ClassroomStep
                    skipLabel="Cancel"
                    onNext={handleStandaloneSuccess}
                    onSkip={handleStandaloneSkip}
                  />
                )}

                {setupParam === "canvas-add" && (
                  <AddCanvasStep
                    onNext={handleAddCanvasNext}
                    onSkip={handleStandaloneSkip}
                    saving={saving}
                    error={error}
                    setError={setError}
                  />
                )}

                {setupParam === "syllabus" && (
                  <SyllabusStep
                    onNext={handleStandaloneSyllabusNext}
                    onSkip={handleStandaloneSkip}
                    saving={saving}
                    error={error}
                    setError={setError}
                    onPhaseChange={setSyllabusPhase}
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
    // Guard as well as disabling the tile: a platform nobody can connect must
    // not end up in the selection through a keyboard or a stale click.
    if (!isPlatformSelectable(platform)) return;
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

  /**
   * Marks onboarding complete and navigates into the app.
   *
   * @param skipSync - When true, sync is fired in the background (the skip
   *                   paths, so the user lands in the app without waiting).
   *                   When false, sync has already completed in DoneStep.
   * @param destination - Route to land on. Defaults to the inbox; the recap's
   *                      "Fix in settings" passes the integrations section.
   */
  function handleSyncAndGo({
    skipSync = false,
    destination = EXIT_ROUTE,
  }: { skipSync?: boolean; destination?: string } = {}) {
    trackEvent("onboarding_completed");
    // Finished: drop the saved position so a later visit does not resume a
    // flow the user has already come out the far side of.
    clearProgress();
    setExiting(true);
    // New users completing onboarding should never see the sync/announcement
    // modals. The chat welcome is NOT pre-dismissed: it carries the community
    // standards and the anonymity disclosure, and is shown on the first visit
    // to /app/discussions instead.
    const allDismissed = {
      sync_welcome: true, gcal_announce: true,
      pensieve_announced: true, calchat_announcement: true,
    };
    fetch("/api/credentials", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dismissed_modals: allDismissed }),
    }).catch(() => { /* non-critical */ });
    // Also set localStorage for instant local reads
    try {
      localStorage.setItem("caltodo_pensieve_announced", "true");
      localStorage.setItem("calchat_announcement_seen", "true");
      localStorage.setItem("caltodo_sync_dismissed", "true");
      localStorage.setItem("caltodo_gcal_announce_seen", "true");
    } catch {
      /* non-critical */
    }
    // Notify Sidebar/MobileTabBar that onboarding is complete (unlocks CalChat instantly)
    window.dispatchEvent(new CustomEvent("onboarding-status-change", { detail: { completed: true } }));
    try { sessionStorage.removeItem("caltodo_onboarding_status"); } catch { /* non-critical */ }
    // Skip Setup path: fire sync in the background since the user wants to land in the app fast.
    // Setup-completed path: sync has already finished in DoneStep, so do not re-fire.
    if (skipSync) {
      triggerSync().catch(() => {});
    }
    // Navigate after fade-out animation completes
    setTimeout(() => router.push(destination), 500);
  }

  /**
   * Records a completed syllabus import.
   *
   * @param summary - How many assignments were imported and for which course
   * @remarks Syllabus imports write tasks directly rather than going through
   *          the sync engine, so they never appear in SyncResult. Without this
   *          the recap reported "0 Assignments" to someone who had just
   *          imported thirty.
   */
  function handleSyllabusImported(summary: { count: number; courseName: string | null }) {
    syllabusImportRef.current = {
      count: syllabusImportRef.current.count + summary.count,
      courses: summary.courseName
        ? Array.from(new Set([...syllabusImportRef.current.courses, summary.courseName]))
        : syllabusImportRef.current.courses,
    };
  }

  /**
   * Platforms with a saved draft, so the picker can badge them "In progress".
   *
   * @returns Ids whose draft holds any user input
   */
  function platformsInProgress(): Set<Platform> {
    const out = new Set<Platform>();
    const c = canvasDraftRef.current;
    if (c.icalUrl || c.token || (c.icalCourses?.length ?? 0) > 0 || (c.courses?.length ?? 0) > 0) out.add("canvas");
    const g = gradescopeDraftRef.current;
    if (g.email || g.password || (g.courses?.length ?? 0) > 0) out.add("gradescope");
    if (pensieveDraftRef.current.url) out.add("pensieve");
    return out;
  }

  /**
   * Reads the latest SyncResult from TaskContext and produces display stats
   * for the post-sync recap, including per-source errors.
   *
   * @returns Display stats, or null when nothing has been synced or imported
   * @remarks Syllabus counts come from handleSyllabusImported rather than
   *          SyncResult, and are included even when no platform synced.
   */
  function getSyncStats(): SyncStats | null {
    const selectedCanvas = canvasDraftRef.current.courses
      ?.filter((c) => canvasDraftRef.current.selectedIds.includes(c.id))
      .map((c) => c.name) ?? [];
    const selectedGradescope = (gradescopeDraftRef.current.courses ?? [])
      .filter((c) => gradescopeDraftRef.current.selectedIds.includes(c.id))
      .map((c) => c.name);
    return buildSyncStats({
      syncResult,
      syncError: syncResult ? null : syncError,
      syllabus: syllabusImportRef.current,
      selectedCourseNames: [...selectedCanvas, ...selectedGradescope],
    });
  }

  const isDoneStep = currentStep === "done";
  const progressPercent = progressPercentInList(currentStep, steps);
  /** True while the in-flow syllabus step is showing its review table. */
  const flowSyllabusPreview = currentStep === "syllabus" && syllabusPhase === "preview";

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-background transition-opacity duration-500 ${exiting ? "opacity-0" : "opacity-100"}`}>
      {/* Top bar: logo left, centered progress, skip right. Hidden on the done step. */}
      <div className={`relative flex items-center justify-between px-6 pt-5 pb-3 gap-4 ${isDoneStep ? "hidden" : ""}`}>
        <div className="shrink-0">
          <img src="/logo.png" alt={BRAND} className="h-7 dark:invert" />
        </div>

        {/* Progress out of the user's own step list, so it reaches 100 on the last real step. */}
        <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-md px-16 pointer-events-none">
          <div
            role="progressbar"
            aria-label="Setup progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent}
            className="h-4 rounded-full bg-muted overflow-hidden"
          >
            <div
              className="h-full rounded-l-full transition-[width] duration-500 ease-out bg-blue-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={() => setShowSkipModal(true)} className="shrink-0">
          Skip setup
        </Button>
      </div>

      {/* Step content, vertically centered.
          The syllabus review is a wide, scrolling table of extracted
          assignments; squeezing it into the max-w-md column every other step
          uses crushes the title down to a few characters. It gets the same
          full-width treatment as the standalone ?setup=syllabus route. */}
      <div className={`flex-1 ${flowSyllabusPreview ? "overflow-hidden" : "overflow-y-auto"}`}>
        <div
          /* The 20vh bottom pad lifts a short step above the optical centre,
             but it is real height inside the scroller: on the platforms step
             it pushed Continue past the fold even once the options fitted. */
          className={`min-h-full flex items-center justify-center px-6 ${
            isDoneStep
              ? "py-12"
              : flowSyllabusPreview
                ? "h-full pt-2 pb-4"
                : currentStep === "platforms"
                  ? "py-8"
                  : "pt-4 pb-[20vh]"
          }`}
        >
          <div
            className={`w-full ${
              isDoneStep ? "max-w-lg" : flowSyllabusPreview ? "max-w-5xl h-full" : "max-w-md"
            }`}
          >
          <div
            key={currentStep}
            className={`animate-step-in ${
              isDoneStep
                ? ""
                : flowSyllabusPreview
                  ? "h-full"
                  : "bg-muted rounded-2xl p-8 sm:p-10"
            }`}
          >
            {stepIndex > 0 && !isDoneStep && (
              <IconButton
                aria-label="Go back"
                size="sm"
                onClick={() => setCurrentStep(steps[stepIndex - 1])}
                className="-ml-1.5 mb-3"
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </IconButton>
            )}
            <ErrorBanner message={error} />

            {currentStep === "welcome" && <WelcomeStep onStart={() => setCurrentStep("school")} />}

            {currentStep === "school" && (
              <PickerStep
                title="Where do you go to school?"
                description="Helps us know who we are building for."
                label="School"
                options={SCHOOL_OPTIONS}
                value={school}
                onChange={setSchool}
                placeholder="Search your school..."
                search={searchSchoolOptions}
                onContinue={() => {
                  trackEvent("onboarding_school_selected", { school: school || "(skipped)" });
                  trackEvent("onboarding_step_completed", { step: "school" });
                  setCurrentStep("referral");
                }}
              />
            )}

            {currentStep === "referral" && (
              <PickerStep
                title="Where did you hear about us?"
                description="Helps us figure out what is working."
                label="Referral source"
                options={REFERRAL_OPTIONS}
                value={referral}
                onChange={setReferral}
                placeholder="Select a source..."
                onContinue={() => {
                  trackEvent("onboarding_referral_selected", { source: referral || "(skipped)" });
                  trackEvent("onboarding_step_completed", { step: "referral" });
                  setCurrentStep("platforms");
                }}
              />
            )}

            {currentStep === "platforms" && (
              <PlatformsStep
                selected={selectedPlatforms}
                onToggle={togglePlatform}
                inProgress={platformsInProgress()}
                onContinue={() => {
                  trackEvent("onboarding_platforms_selected", {
                    platforms: Array.from(selectedPlatforms).join(","),
                  });
                  // Paired with the skip below. A step that reports only
                  // skips yields a funnel that can only show people leaving.
                  trackEvent("onboarding_step_completed", { step: "platforms" });
                  setCurrentStep(nextStepAfter("platforms"));
                }}
                onSkip={() => {
                  trackEvent("onboarding_step_skipped", { step: "platforms" });
                  handleSyncAndGo({ skipSync: true });
                }}
              />
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
                initialIcalUrl={canvasDraftRef.current.icalUrl}
                initialIcalCourses={canvasDraftRef.current.icalCourses}
                initialIcalSelectedNames={canvasDraftRef.current.icalSelectedNames}
                initialMode={canvasDraftRef.current.mode}
                schoolCanvasHost={canvasHostForSchool(school)}
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
                existingCanvasCourses={canvasDraftRef.current.courses?.filter((c) => canvasDraftRef.current.selectedIds.includes(c.id)).map((c) => ({ id: c.id, name: c.name }))}
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

            {currentStep === "brightspace" && (
              <BrightspaceStep
                onNext={handleBrightspaceNext}
                onSkip={() => { trackEvent("onboarding_step_skipped", { step: "brightspace" }); setCurrentStep(nextStepAfter("brightspace")); }}
                saving={saving}
                error={error}
                setError={setError}
              />
            )}

            {currentStep === "blackboard" && (
              <BlackboardStep
                onNext={handleBlackboardNext}
                onSkip={() => { trackEvent("onboarding_step_skipped", { step: "blackboard" }); setCurrentStep(nextStepAfter("blackboard")); }}
                saving={saving}
                error={error}
                setError={setError}
              />
            )}

            {/* Google Calendar and Google Classroom were connectable from
                settings but absent from this list, so a new user was never
                offered the two most common Google integrations during setup.
                Both step components already existed; only Classroom's was
                reachable, and only from the standalone ?setup= path. */}
            {currentStep === "gcal" && (
              <CalendarStep
                onNext={() => { trackEvent("onboarding_step_completed", { step: "gcal" }); setCurrentStep(nextStepAfter("gcal")); }}
                onSkip={() => handleSkipStep("gcal")}
              />
            )}

            {currentStep === "classroom" && (
              <ClassroomStep
                onNext={() => { trackEvent("onboarding_step_completed", { step: "classroom" }); setCurrentStep(nextStepAfter("classroom")); }}
                onSkip={() => handleSkipStep("classroom")}
              />
            )}

            {currentStep === "syllabus" && (
              <SyllabusStep
                onNext={async () => { trackEvent("onboarding_step_completed", { step: "syllabus" }); setCurrentStep(nextStepAfter("syllabus")); return true; }}
                onSkip={() => { trackEvent("onboarding_step_skipped", { step: "syllabus" }); setCurrentStep(nextStepAfter("syllabus")); }}
                error={error}
                setError={setError}
                saving={saving}
                onPhaseChange={setSyllabusPhase}
                onImported={handleSyllabusImported}
              />
            )}

            {currentStep === "done" && (
              <DoneStep
                onComplete={(destination) => handleSyncAndGo({ destination })}
                triggerSync={() => triggerSync(undefined, undefined, { silent: true })}
                getSyncStats={getSyncStats}
              />
            )}

            {/* Escape hatch for the integration steps that lack one. Hidden
                during the syllabus preview, where assignments have already
                been extracted and "skip" would read as "discard them". */}
            {STEPS_NEEDING_SKIP_CONTROL.includes(currentStep) && !flowSyllabusPreview && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSkipStep(currentStep)}
                  disabled={saving}
                >
                  {SKIP_LABEL}
                </Button>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      <ConfirmDialog
        open={showSkipModal}
        title="Skip setup for now?"
        body={`You can always connect ${PROVIDER_LABELS.canvas}, ${PROVIDER_LABELS.gradescope}, ${PROVIDER_LABELS.pensieve}, or upload a syllabus later from Settings.`}
        confirmLabel={SKIP_LABEL}
        cancelLabel="Keep going"
        onCancel={() => setShowSkipModal(false)}
        onConfirm={() => {
          // Deliberately leaving: the same completion bookkeeping as
          // finishing (clears progress), with sync in the background.
          setShowSkipModal(false);
          handleSyncAndGo({ skipSync: true });
        }}
      />
    </div>
  );
}
