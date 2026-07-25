"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Monitor, FileText, Check, CalendarDays } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { trackEvent } from "@/lib/analytics";
import CanvasStep from "@/components/onboarding/CanvasStep";
import GradescopeStep from "@/components/onboarding/GradescopeStep";
import PensieveStep from "@/components/onboarding/PensieveStep";
import BrightspaceStep from "@/components/onboarding/BrightspaceStep";
import AddCanvasStep from "@/components/onboarding/AddCanvasStep";
import SyllabusStep from "@/components/onboarding/SyllabusStep";
import SearchableSelect from "@/components/onboarding/SearchableSelect";
import { SCHOOL_OPTIONS, REFERRAL_OPTIONS } from "@/components/onboarding/onboardingOptions";
import type { IntegrationCredentials, AdditionalCanvasAccount } from "@/lib/types";

type Step = "welcome" | "school" | "referral" | "platforms" | "canvas" | "gradescope" | "pensieve" | "syllabus" | "done";
type Platform = "canvas" | "gradescope" | "pensieve" | "syllabus";

/** Display labels for each step in the stepper bar. */
const STEP_LABELS: Record<Step, string> = {
  welcome: "Welcome",
  school: "School",
  referral: "Referral",
  platforms: "Platforms",
  canvas: "Canvas",
  gradescope: "Gradescope",
  pensieve: "Pensive",
  syllabus: "Syllabus",
  done: "Finish",
};

/** Platform options shown in the platform selection step. */
const PLATFORM_OPTIONS: Array<{ id: Platform; label: string; description: string; logo: string }> = [
  { id: "canvas", label: "Canvas", description: "Sync assignments from your Canvas account", logo: "/canvas-logo.png" },
  { id: "gradescope", label: "Gradescope", description: "Sync deadlines from Gradescope", logo: "/gradescope-logo.png" },
  { id: "pensieve", label: "Pensive", description: "Sync CS/DS assignments from Pensive", logo: "/pensieve-logo.png" },
  { id: "syllabus", label: "Syllabus", description: "Extract assignments from a syllabus PDF", logo: "/file.svg" },
];

/** Valid platforms for standalone ?setup= mode. */
const VALID_SETUP_PLATFORMS = new Set<string>(["canvas", "gradescope", "pensieve", "brightspace", "canvas-add", "syllabus"]);

/** Display labels for standalone setup mode header. */
const SETUP_LABELS: Record<string, string> = {
  canvas: "Canvas",
  gradescope: "Gradescope",
  pensieve: "Pensive",
  brightspace: "Brightspace",
  "canvas-add": "Canvas",
  syllabus: "Syllabus",
};

/** Status blurbs cycled while syncing — mostly playful with a few technical ones. */
const SYNC_BLURBS = [
  "Hunting down sneaky deadlines...",
  "Bribing the calendar gods...",
  "Negotiating extensions for you...",
  "Untangling your schedule...",
  "Calibrating sync engine...",
  "Color-coding your future...",
  "Pretending finals aren't real...",
  "Whispering to the registrar...",
  "Sharpening pencils...",
  "Cross-referencing due dates...",
  "Convincing your TA to be lenient...",
  "Stretching office hours...",
  "Decoding mysterious syllabi...",
  "Saving you from yourself...",
  "Indexing your assignments...",
  "Turning chaos into Tuesdays...",
  "Reticulating splines...",
  "Buttering up your professors...",
  "Almost there, hang tight...",
];

interface SyncStats {
  total: number;
  perSource: Array<{ label: string; count: number }>;
  courses: string[];
}

/**
 * "Done" step — actually waits for the sync to complete.
 * Phase 1 (syncing): progress bar + rotating blurb messages.
 * Phase 2 (complete): shows stats (assignments synced, courses) + "Let's Go" button.
 *
 * @param onComplete - Called when the user clicks "Let's Go" after seeing stats
 * @param triggerSync - Awaits sync completion; resolves when done
 * @param getSyncStats - Reads the latest SyncResult and turns it into display stats
 */
function DoneStep({
  onComplete,
  triggerSync,
  getSyncStats,
}: {
  onComplete: () => void;
  triggerSync: () => Promise<void>;
  getSyncStats: () => SyncStats | null;
}) {
  const [progress, setProgress] = useState(0);
  const [blurbIndex, setBlurbIndex] = useState(0);
  const [phase, setPhase] = useState<"syncing" | "complete">("syncing");
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [fadingOut, setFadingOut] = useState(false);
  const syncDoneRef = useRef(false);

  // Kick off the sync once on mount — DON'T snap progress; let the tick interval ride it up.
  useEffect(() => {
    let cancelled = false;
    triggerSync().finally(() => {
      if (cancelled) return;
      syncDoneRef.current = true;
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick progress up by 1 each interval — purposely slow so the user feels the build-up.
  // While sync is in flight: cap at 92. Once sync resolves: keep climbing all the way to 100,
  // then flip to the complete phase. The bar never "jumps".
  useEffect(() => {
    if (phase !== "syncing") return;
    let tick = 0;
    const id = setInterval(() => {
      tick += 1;
      // Rotate blurb every ~2.4s (12 ticks at 200ms).
      if (tick % 12 === 0) setBlurbIndex((i) => (i + 1) % SYNC_BLURBS.length);
      setProgress((p) => {
        const cap = syncDoneRef.current ? 100 : 92;
        if (p >= cap) return p;
        return p + 1;
      });
    }, 200);
    return () => clearInterval(id);
  }, [phase]);

  // When the bar reaches 100% AND sync is actually done:
  //   1. Hold full state for the user to enjoy the checkmark.
  //   2. Fade the syncing UI out fully.
  //   3. Mount the recap which fades in slowly.
  useEffect(() => {
    if (phase !== "syncing") return;
    if (progress < 100 || !syncDoneRef.current) return;
    // Beat 1: 1.4s with full bar + checkmark visible
    const fadeStart = setTimeout(() => setFadingOut(true), 1400);
    // Beat 2: 1.0s after fade-out begins, swap to complete phase
    const swap = setTimeout(() => {
      setStats(getSyncStats());
      setPhase("complete");
    }, 2400);
    return () => {
      clearTimeout(fadeStart);
      clearTimeout(swap);
    };
  }, [progress, phase, getSyncStats]);

  if (phase === "syncing") {
    return (
      <div
        key="syncing"
        className={`text-center px-2 animate-phase-in -mt-[15vh] transition-opacity duration-1000 ease-out ${
          fadingOut ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* caltodo logo */}
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="caltodo" className="h-10 dark:invert" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">
          Setting up your account
        </h2>
        <p className="text-sm text-foreground mb-8 min-h-[1.25rem] transition-opacity duration-500" key={blurbIndex}>
          {SYNC_BLURBS[blurbIndex]}
        </p>
        <div className="w-full h-4 rounded-full bg-[#E5E5E7] dark:bg-[#3A3A3C] overflow-hidden mb-3">
          <div
            className="h-full rounded-l-full relative bg-[#0e89d6]"
            style={{
              width: `${progress}%`,
              transition: "width 280ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div className="absolute left-2.5 right-2.5 top-1 h-1 rounded-full bg-white/25" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 h-6">
          {progress >= 100 ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0e89d6] animate-check-in">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0e89d6] text-white">
                <Check size={12} strokeWidth={3} />
              </span>
              Done
            </span>
          ) : (
            <p className="text-sm font-medium text-foreground tabular-nums">{progress}%</p>
          )}
        </div>
      </div>
    );
  }

  // Complete phase — analytics recap
  return (
    <div key="complete" className="text-center px-2 animate-phase-in">
      {/* caltodo logo */}
      <div className="flex justify-center mb-6">
        <img src="/logo.png" alt="caltodo" className="h-10 dark:invert" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">
        You&apos;re all set.
      </h2>
      <p className="text-sm text-foreground mb-8">
        Here&apos;s what we synced.
      </p>

      {/* Top stats row: assignments + classes */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-[#f6f5f4] dark:bg-[#202022] rounded-2xl px-4 py-5">
          <p className="text-4xl font-bold text-foreground tabular-nums tracking-tight">
            {stats?.total ?? 0}
          </p>
          <p className="text-xs font-medium text-foreground mt-1.5">
            {stats?.total === 1 ? "Assignment" : "Assignments"}
          </p>
        </div>
        <div className="bg-[#f6f5f4] dark:bg-[#202022] rounded-2xl px-4 py-5">
          <p className="text-4xl font-bold text-foreground tabular-nums tracking-tight">
            {stats?.courses.length ?? 0}
          </p>
          <p className="text-xs font-medium text-foreground mt-1.5">
            {stats?.courses.length === 1 ? "Class" : "Classes"}
          </p>
        </div>
      </div>

      {/* Per-source breakdown with logos */}
      {stats && stats.perSource.length > 0 && (
        <div className="bg-[#f6f5f4] dark:bg-[#202022] rounded-2xl p-3 mb-3">
          <div className="flex flex-col gap-2">
            {stats.perSource.map((row) => (
              <div key={row.label} className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white dark:bg-[#2a2a2c]">
                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                  <SourceLogo label={row.label} />
                </div>
                <span className="flex-1 text-left text-sm font-semibold text-foreground">{row.label}</span>
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {row.count} {row.count === 1 ? "assignment" : "assignments"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Classes list */}
      {stats && stats.courses.length > 0 && (
        <div className="bg-[#f6f5f4] dark:bg-[#202022] rounded-2xl px-4 py-4 mb-8 text-left">
          <p className="text-xs font-semibold text-foreground mb-2.5 uppercase tracking-wide">
            Your Classes
          </p>
          <div className="flex flex-wrap gap-1.5">
            {stats.courses.slice(0, 14).map((name) => (
              <span
                key={name}
                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white dark:bg-[#2a2a2c] text-foreground"
              >
                {name}
              </span>
            ))}
            {stats.courses.length > 14 && (
              <span className="text-xs font-medium px-2.5 py-1 text-foreground">
                +{stats.courses.length - 14} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Live sync indicator — forward-looking, sits just before the CTA */}
      <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0e89d6] mb-4">
        <span className="relative inline-flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#0e89d6] opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0e89d6]" />
        </span>
        Live sync is on. New assignments appear automatically.
      </p>

      <button
        onClick={onComplete}
        className="w-full px-5 py-2.5 rounded-full text-sm font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900"
      >
        Let&apos;s Go
      </button>
    </div>
  );
}

/** Renders the appropriate logo for a sync source label. */
function SourceLogo({ label }: { label: string }) {
  if (label === "Canvas") {
    return <img src="/canvas-logo.png" alt="" className="w-full h-full object-contain" />;
  }
  if (label === "Gradescope") {
    return (
      <svg viewBox="0 0 14 14" fill="none" className="w-full h-full">
        <rect width="14" height="14" rx="3" fill="#3AADA8" />
        <rect x="1.5" y="8.5" width="2" height="3.5" rx="0.5" fill="white" />
        <rect x="4.5" y="6.5" width="2" height="5.5" rx="0.5" fill="white" />
        <rect x="7.5" y="4.5" width="2" height="7.5" rx="0.5" fill="white" />
        <rect x="10.5" y="2.5" width="2" height="9.5" rx="0.5" fill="white" />
      </svg>
    );
  }
  if (label === "Pensive") {
    return (
      <div className="relative w-full h-full">
        <div className="absolute inset-[10%] rounded-full bg-white" />
        <img src="/pensieve-logo.png" alt="" className="w-full h-full object-contain relative" />
      </div>
    );
  }
  if (label === "Brightspace") {
    return (
      <div className="w-full h-full rounded-md bg-[#E87040]/15 flex items-center justify-center">
        <CalendarDays size={14} className="text-[#E87040]" />
      </div>
    );
  }
  return null;
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
 */
export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { triggerSync, syncResult } = useTaskContext();

  // Standalone single-step setup mode: ?setup=canvas|gradescope|pensieve
  const setupParam = searchParams.get("setup");
  const isStandaloneSetup = setupParam !== null && VALID_SETUP_PLATFORMS.has(setupParam);

  // Syllabus phase tracking for conditional layout
  const [syllabusPhase, setSyllabusPhase] = useState<"upload" | "extracting" | "preview">("upload");

  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(new Set());
  /** Free-form school name selected on the "school" step. Tracked for analytics only. */
  const [school, setSchool] = useState<string>("");
  /** Free-form referral source selected on the "referral" step. Tracked for analytics only. */
  const [referral, setReferral] = useState<string>("");

  // Draft state refs — persisted across step navigation without causing re-renders.
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
    baseUrl: "https://bcourses.berkeley.edu",
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
    const platformSteps: Step[] = [];
    if (selectedPlatforms.has("canvas")) platformSteps.push("canvas");
    if (selectedPlatforms.has("gradescope")) platformSteps.push("gradescope");
    if (selectedPlatforms.has("pensieve")) platformSteps.push("pensieve");
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

  /** Whether the standalone setup overlay is fading out before navigation. */
  const [standaloneExiting, setStandaloneExiting] = useState(false);

  /**
   * Handles standalone setup completion. Fades out, then redirects to Settings.
   */
  function handleStandaloneSuccess() {
    trackEvent("standalone_setup_completed", { platform: setupParam });
    // Syllabus doesn't use the sync engine — skip triggerSync for it
    if (setupParam !== "syllabus") {
      const platform = setupParam === "canvas-add" ? "canvas" : setupParam as "canvas" | "gradescope" | "pensieve" | "brightspace";
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

      const newAccount: AdditionalCanvasAccount = {
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

  // ---- Standalone single-step setup mode rendering ----
  if (isStandaloneSetup) {
    const isSyllabusPreview = setupParam === "syllabus" && syllabusPhase === "preview";
    const isSyllabusExtracting = setupParam === "syllabus" && syllabusPhase === "extracting";

    return (
      <div className={`fixed inset-0 z-50 flex flex-col bg-background transition-opacity duration-75 ${standaloneExiting ? "opacity-0" : "opacity-100"}`}>
        {/* Minimal header: back arrow + title (hidden during extracting) */}
        {!isSyllabusExtracting && (
          <div className="flex items-center gap-3 px-6 pt-5 pb-3 shrink-0">
            <button
              onClick={handleStandaloneSkip}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Back to settings"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-lg font-semibold text-foreground">
              Set up {SETUP_LABELS[setupParam]}
            </h1>
          </div>
        )}

        {/* Step content — layout varies by syllabus phase */}
        <div className={`flex-1 ${isSyllabusPreview ? "overflow-hidden" : "overflow-y-auto"}`}>
          <div className={`min-h-full flex items-center justify-center px-6 ${isSyllabusPreview ? "h-full pt-2 pb-4" : "pt-4 pb-[20vh]"}`}>
            <div className={`w-full ${isSyllabusPreview ? "max-w-5xl h-full" : "max-w-md"}`}>
              <div className={`animate-step-in ${isSyllabusPreview ? "h-full" : ""}`}>
                {error && setupParam !== "syllabus" && (
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
                    onNext={handleStandaloneBrightspaceNext}
                    onSkip={handleStandaloneSkip}
                    saving={saving}
                    error={error}
                    setError={setError}
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
  const [showSkipModal, setShowSkipModal] = useState(false);

  /**
   * Marks onboarding complete and navigates to /app/home.
   *
   * @param skipSync - When true, sync is fired in the background (used for Skip Setup
   *                   path so the user can land in the app immediately without waiting).
   *                   When false, sync has already completed in DoneStep so we don't
   *                   re-fire it.
   */
  function handleSyncAndGo({ skipSync = false }: { skipSync?: boolean } = {}) {
    trackEvent("onboarding_completed");
    setExiting(true);
    // New users completing onboarding should never see any welcome/announcement modals.
    // Persist to server so dismiss state follows the account across devices.
    const allDismissed = {
      sync_welcome: true, gcal_announce: true,
      calchat_welcome: true,
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
      localStorage.setItem("calchat_welcome_accepted", "true");
    } catch {
      /* non-critical */
    }
    // Notify Sidebar/MobileTabBar that onboarding is complete (unlocks CalChat instantly)
    window.dispatchEvent(new CustomEvent("onboarding-status-change", { detail: { completed: true } }));
    try { sessionStorage.removeItem("caltodo_onboarding_status"); } catch { /* non-critical */ }
    // Skip Setup path: fire sync in the background since the user wants to land in the app fast.
    // Setup-completed path: sync has already finished in DoneStep — don't re-fire.
    if (skipSync) {
      triggerSync().catch(() => {});
    }
    // Navigate after fade-out animation completes
    setTimeout(() => router.push("/app/home"), 500);
  }

  /**
   * Reads the latest SyncResult from TaskContext and produces display stats
   * for the post-sync recap (total assignments, per-source counts, course list).
   */
  function getSyncStats(): SyncStats | null {
    if (!syncResult) return null;
    const total =
      syncResult.canvas.synced +
      syncResult.gradescope.synced +
      syncResult.pensieve.synced +
      (syncResult.brightspace?.synced ?? 0);
    const perSource: Array<{ label: string; count: number }> = [];
    if (syncResult.canvas.synced > 0) perSource.push({ label: "Canvas", count: syncResult.canvas.synced });
    if (syncResult.gradescope.synced > 0) perSource.push({ label: "Gradescope", count: syncResult.gradescope.synced });
    if (syncResult.pensieve.synced > 0) perSource.push({ label: "Pensive", count: syncResult.pensieve.synced });
    if (syncResult.brightspace?.synced) perSource.push({ label: "Brightspace", count: syncResult.brightspace.synced });
    const selectedCanvas = canvasDraftRef.current.courses
      ?.filter((c) => canvasDraftRef.current.selectedIds.includes(c.id))
      .map((c) => c.name) ?? [];
    const selectedGradescope = (gradescopeDraftRef.current.courses ?? [])
      .filter((c) => gradescopeDraftRef.current.selectedIds.includes(c.id))
      .map((c) => c.name);
    const courses = Array.from(new Set([...selectedCanvas, ...selectedGradescope]));
    return { total, perSource, courses };
  }

  const isDoneStep = currentStep === "done";

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-background transition-opacity duration-500 ${exiting ? "opacity-0" : "opacity-100"}`}>
      {/* Top bar: logo left, centered stepper, close right — hidden on done step */}
      <div
        className={`relative flex items-center justify-between px-6 pt-5 pb-3 gap-4 ${
          isDoneStep ? "hidden" : ""
        }`}
      >
        {/* Logo — left corner (non-interactive during onboarding) */}
        <div className="shrink-0">
          <img src="/logo.png" alt="caltodo" className="h-7 dark:invert" />
        </div>

        {/* Single rounded progress bar — centered in the bar */}
        <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-md px-16 pointer-events-none">
          <div className="h-4 rounded-full bg-[#E5E5E7] dark:bg-[#3A3A3C] overflow-hidden">
            <div
              className="h-full rounded-l-full transition-[width] duration-500 ease-out relative bg-[#0e89d6]"
              style={{
                width: `${({
                  welcome: 0,
                  school: 10,
                  referral: 20,
                  platforms: 30,
                  canvas: 45,
                  gradescope: 60,
                  pensieve: 75,
                  syllabus: 88,
                  done: 100,
                } as Record<Step, number>)[currentStep]}%`,
              }}
            >
              {/* Subtle top sheen — inset from the rounded ends */}
              <div className="absolute left-2.5 right-2.5 top-1 h-1 rounded-full bg-white/25" />
            </div>
          </div>
        </div>

        {/* Skip Setup button — subtle, opens confirm modal */}
        <button
          onClick={() => setShowSkipModal(true)}
          className="shrink-0 text-xs text-muted-foreground/70 hover:text-foreground transition-colors px-2 py-1"
        >
          Skip Setup
        </button>
      </div>

      {/* Step content — vertically centered */}
      <div className="flex-1 overflow-y-auto">
        <div className={`min-h-full flex items-center justify-center px-6 ${isDoneStep ? "py-12" : "pt-4 pb-[20vh]"}`}>
          <div className={`w-full ${isDoneStep ? "max-w-lg" : "max-w-md"}`}>
          <div key={currentStep} className={`animate-step-in ${isDoneStep ? "" : "bg-[#f6f5f4] dark:bg-[#202022] rounded-2xl p-8 sm:p-10"}`}>
            {stepIndex > 0 && !isDoneStep && (
              <button
                onClick={() => setCurrentStep(steps[stepIndex - 1])}
                className="-ml-1.5 mb-3 inline-flex items-center justify-center text-muted-foreground/60 hover:text-foreground transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </button>
            )}
            {error && (
              <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            {currentStep === "welcome" && (
              <div className="text-center">
                <div className="flex justify-center mb-3 ">
                  <img
                    src="/logo.png"
                    alt="caltodo"
                    className="h-14 dark:invert"
                  />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-3 ">
                  Welcome to caltodo.
                </h1>
                <p className="text-foreground text-sm mb-2 ">
                  This takes about 5-10 minutes.
                </p>
                <p className="text-foreground text-sm mb-8  flex items-center justify-center gap-2">
                  <Monitor size={16} strokeWidth={2} />
                  We recommend doing this on a computer.
                </p>
                <button
                  onClick={() => setCurrentStep("school")}
                  className="w-full px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-semibold"
                >
                  Get Started
                </button>
              </div>
            )}

            {currentStep === "school" && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">
                  Where do you go to school?
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Helps us know who we&rsquo;re building for.
                </p>
                <SearchableSelect
                  options={SCHOOL_OPTIONS}
                  value={school}
                  onChange={setSchool}
                  placeholder="Select your school..."
                />
                <button
                  onClick={() => {
                    trackEvent("onboarding_school_selected", { school: school || "(skipped)" });
                    trackEvent("onboarding_step_completed", { step: "school" });
                    setCurrentStep("referral");
                  }}
                  disabled={!school.trim()}
                  className="mt-8 w-full px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            )}

            {currentStep === "referral" && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">
                  Where did you hear about us?
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Helps us figure out what&rsquo;s working.
                </p>
                <SearchableSelect
                  options={REFERRAL_OPTIONS}
                  value={referral}
                  onChange={setReferral}
                  placeholder="Select a source..."
                />
                <button
                  onClick={() => {
                    trackEvent("onboarding_referral_selected", { source: referral || "(skipped)" });
                    trackEvent("onboarding_step_completed", { step: "referral" });
                    setCurrentStep("platforms");
                  }}
                  disabled={!referral.trim()}
                  className="mt-8 w-full px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            )}

            {currentStep === "platforms" && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-2 ">
                  Select Your Platforms
                </h2>
                <p className="text-sm text-muted-foreground mb-6 ">
                  Which platforms do you use? You can always change this later.
                </p>
                <div className="flex flex-col gap-3 mb-8">
                  {PLATFORM_OPTIONS.map((opt, i) => {
                    const selected = selectedPlatforms.has(opt.id);
                    const hasProgress = (() => {
                      if (opt.id === "canvas") {
                        const c = canvasDraftRef.current;
                        return !!(c.icalUrl || c.token || (c.icalCourses && c.icalCourses.length > 0) || (c.courses && c.courses.length > 0));
                      }
                      if (opt.id === "gradescope") {
                        const g = gradescopeDraftRef.current;
                        return !!(g.email || g.password || (g.courses && g.courses.length > 0));
                      }
                      if (opt.id === "pensieve") {
                        return !!pensieveDraftRef.current.url;
                      }
                      return false;
                    })();
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => togglePlatform(opt.id)}
                        className={` flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl bg-white dark:bg-[#2a2a2c] text-foreground border-2 transition-colors duration-150 focus:outline-none ${
                          selected
                            ? "border-[#0e89d6]"
                            : "border-transparent hover:border-[#0e89d6]/30"
                        }`}
                        style={{ animationDelay: `${(i + 2) * 50}ms` }}
                      >
                        {opt.id === "syllabus" ? (
                          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/15 flex items-center justify-center shrink-0">
                            <FileText size={16} className="text-purple-500" />
                          </div>
                        ) : (
                          <img
                            src={opt.logo}
                            alt={opt.label}
                            className="w-8 h-8 object-contain shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{opt.label}</span>
                          {hasProgress && (
                            <span className="text-[10px] font-semibold text-[#0e89d6] bg-[#0e89d6]/10 px-1.5 py-0.5 rounded">
                              Saved
                            </span>
                          )}
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          selected ? "bg-[#0e89d6]" : "border border-muted-foreground/30"
                        }`}>
                          {selected && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-background">
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
                    if (selectedPlatforms.size === 0) return;
                    trackEvent("onboarding_platforms_selected", {
                      platforms: Array.from(selectedPlatforms).join(","),
                    });
                    setCurrentStep(nextStepAfter("platforms"));
                  }}
                  disabled={selectedPlatforms.size === 0}
                  className={`w-full px-5 py-2.5 rounded-full text-sm font-semibold transition-colors border border-transparent ${
                    selectedPlatforms.size === 0
                      ? "bg-[#D1D1D6] dark:bg-[#3A3A3C] text-white/70 dark:text-white/40 cursor-not-allowed"
                      : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800"
                  }`}
                  style={{ animationDelay: "250ms" }}
                >
                  Continue
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
                initialIcalUrl={canvasDraftRef.current.icalUrl}
                initialIcalCourses={canvasDraftRef.current.icalCourses}
                initialIcalSelectedNames={canvasDraftRef.current.icalSelectedNames}
                initialMode={canvasDraftRef.current.mode}
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

            {currentStep === "syllabus" && (
              <SyllabusStep
                onNext={async () => { setCurrentStep(nextStepAfter("syllabus")); return true; }}
                onSkip={() => { trackEvent("onboarding_step_skipped", { step: "syllabus" }); setCurrentStep(nextStepAfter("syllabus")); }}
                error={error}
                setError={setError}
                saving={saving}
              />
            )}

            {currentStep === "done" && (
              <DoneStep
                onComplete={() => handleSyncAndGo()}
                triggerSync={() => triggerSync(undefined, undefined, { silent: true })}
                getSyncStats={getSyncStats}
              />
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Skip Setup confirmation modal */}
      {showSkipModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setShowSkipModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1c1c1e] p-6 shadow-2xl animate-drop-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-foreground mb-2">
              Skip setup for now?
            </h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              You can always connect Canvas, Gradescope, Pensive, or upload a syllabus later from <span className="font-semibold text-foreground">Settings &gt; Integrations</span>.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowSkipModal(false)}
                className="px-4 py-2 text-sm font-medium text-foreground hover:bg-black/5 rounded-lg transition-colors"
              >
                Keep going
              </button>
              <button
                onClick={() => {
                  setShowSkipModal(false);
                  router.push("/app/inbox");
                }}
                className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
