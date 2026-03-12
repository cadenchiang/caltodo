"use client";

import { useState, useRef, useCallback } from "react";
import { Eye, EyeOff, Loader2, Play, X } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

/**
 * Instruction steps for generating a Canvas access token (advanced mode).
 */
const TOKEN_STEPS: Array<{ label: string; time: number }> = [
  { label: "open your Canvas settings", time: 0 },
  { label: "create + new access token", time: 5 },
  { label: "name the token whatever you want", time: 9 },
  { label: "set expiration to max (120 days)", time: 12 },
  { label: "copy and paste your token below", time: 18 },
];

interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
}

interface AddCanvasStepProps {
  onNext: (payload: {
    label: string;
    base_url: string;
    token?: string;
    ical_url?: string;
    selected_courses?: Array<{ id: number; name: string }>;
  }) => Promise<boolean>;
  onSkip: () => void;
  saving: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

/**
 * Formats a timestamp in seconds to "M:SS" display format.
 */
function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Setup flow for adding an additional Canvas account.
 * Default: paste calendar feed URL (simple).
 * Advanced: API token flow with course selection.
 */
export default function AddCanvasStep({ onNext, onSkip, saving, error, setError }: AddCanvasStepProps) {
  const { showToast } = useToast();
  const [mode, setMode] = useState<"ical" | "api">("ical");

  // iCal state
  const [icalUrl, setIcalUrl] = useState("");
  const [icalBaseHost, setIcalBaseHost] = useState("");

  // API token state
  const [baseHost, setBaseHost] = useState("");
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [courses, setCourses] = useState<CanvasCourse[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [videoExpanded, setVideoExpanded] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [showTokenHelp, setShowTokenHelp] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    setVideoTime(v.currentTime);
    if (v.currentTime >= 28 && !v.paused) {
      v.pause();
      v.currentTime = 0;
      setVideoTime(0);
      setVideoExpanded(false);
    }
  }, []);

  function getActiveStepIndex(): number {
    if (!videoExpanded) return -1;
    for (let i = TOKEN_STEPS.length - 1; i >= 0; i--) {
      if (videoTime >= TOKEN_STEPS[i].time) return i;
    }
    return 0;
  }

  /**
   * Derives a label from a URL hostname (e.g. "canvas.stanford.edu" → "Canvas (stanford)").
   */
  function deriveLabel(url: string): string {
    try {
      const hostname = new URL(url.trim()).hostname;
      const parts = hostname.split(".");
      if (parts.length >= 2) {
        return `Canvas (${parts[parts.length - 2]})`;
      }
    } catch { /* use default */ }
    return "Canvas";
  }

  /**
   * Saves the iCal feed URL and advances.
   */
  async function handleICalSave() {
    const url = icalUrl.trim();
    const host = icalBaseHost.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");

    if (!host) {
      showToast("please enter the Canvas domain.");
      return;
    }
    if (!url) {
      showToast("please paste your calendar feed URL.");
      return;
    }
    if (!url.startsWith("https://") || !url.endsWith(".ics")) {
      setError("that doesn't look like a calendar feed URL. it should start with https:// and end with .ics");
      return;
    }

    const base = `https://${host}`;
    setError(null);
    await onNext({
      label: deriveLabel(base),
      base_url: base,
      ical_url: url,
    });
  }

  /**
   * Verifies the API token by fetching courses.
   */
  async function handleVerify() {
    const host = baseHost.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
    if (!host) {
      showToast("please enter the Canvas domain.");
      return;
    }
    if (!token.trim()) {
      showToast("please enter your Canvas access token.");
      return;
    }

    const fullBaseUrl = `https://${host}`;
    setVerifying(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        token: token.trim(),
        base_url: fullBaseUrl,
      });
      const res = await fetch(`/api/canvas/courses?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Verification failed: ${res.status}`);
      }
      const data = await res.json();
      setCourses(data.courses);
      setSelectedIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setVerifying(false);
    }
  }

  function toggleCourse(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleSaveAndNext() {
    if (!courses) return;
    const host = baseHost.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
    const fullBaseUrl = `https://${host}`;
    const selected = courses
      .filter((c) => selectedIds.has(c.id))
      .map((c) => ({ id: c.id, name: c.name }));

    await onNext({
      label: deriveLabel(fullBaseUrl),
      base_url: fullBaseUrl,
      token: token.trim(),
      selected_courses: selected,
    });
  }

  const activeStep = getActiveStepIndex();

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <img src="/canvas-logo.png" alt="Canvas" width={22} height={22} className="shrink-0 object-contain" />
        <h2 className="text-lg font-bold text-foreground animate-drop-in">Add Canvas Account</h2>
      </div>

      {/* ===== iCal mode (default) ===== */}
      {mode === "ical" && (
        <>
          <div className="flex flex-col gap-1 mb-4 text-left animate-drop-in delay-100">
            <div className="flex items-center gap-3 px-2 py-2">
              <span className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <span className="text-sm font-medium text-foreground">go to your Canvas calendar</span>
            </div>
            <div className="flex items-center gap-3 px-2 py-2">
              <span className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <span className="text-sm font-medium text-foreground">click &quot;Calendar Feed&quot; at the bottom right</span>
            </div>
            <div className="flex items-center gap-3 px-2 py-2">
              <span className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <span className="text-sm font-medium text-foreground">copy the feed URL and paste it below</span>
            </div>
          </div>

          <div className="mb-3 animate-drop-in delay-200">
            <div className="flex items-center rounded-xl border border-border bg-card overflow-hidden focus-within:border-foreground/50 transition-colors">
              <span className="pl-3 py-2.5 text-sm text-foreground/50 select-none shrink-0 bg-muted/50 pr-2 border-r border-border">https://</span>
              <input
                type="text"
                value={icalBaseHost}
                onChange={(e) => setIcalBaseHost(e.target.value)}
                placeholder="canvas.stanford.edu"
                autoComplete="off"
                className="flex-1 px-1.5 py-2.5 bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-5 animate-drop-in delay-200">
            <input
              type="url"
              value={icalUrl}
              onChange={(e) => setIcalUrl(e.target.value)}
              placeholder="paste calendar feed URL"
              autoComplete="off"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors"
            />
          </div>

          <div className="flex gap-3 animate-drop-in delay-300">
            <button
              onClick={onSkip}
              className="flex-1 px-4 py-2.5 text-sm text-muted-foreground rounded-xl bg-card btn-elevated-secondary"
            >
              cancel
            </button>
            <button
              onClick={handleICalSave}
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 btn-elevated-primary"
            >
              {saving ? "saving..." : "connect"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => { setMode("api"); setError(null); }}
            className="mt-4 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            use API key instead (advanced, more setup required)
          </button>
        </>
      )}

      {/* ===== API token mode (advanced) ===== */}
      {mode === "api" && !courses && (
        <>
          <p className="text-xs text-muted-foreground mb-4 animate-drop-in">
            this method requires generating an API token and has more setup steps.
          </p>

          <div className="animate-drop-in delay-100">
            {/* Expanded: side-by-side steps + video */}
            <div
              className={`grid overflow-hidden transition-all duration-500 ${videoExpanded ? "sm:-mx-80" : ""}`}
              style={{
                gridTemplateRows: videoExpanded ? "1fr" : "0fr",
                opacity: videoExpanded ? 1 : 0,
                transitionTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)",
              }}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-8 mb-4">
                  <div className="sm:w-56 shrink-0 flex flex-col gap-1.5">
                    {TOKEN_STEPS.map((step, i) => {
                      const isActive = activeStep === i;
                      return (
                        <button
                          key={step.time}
                          type="button"
                          onClick={() => {
                            if (videoRef.current) {
                              videoRef.current.currentTime = step.time;
                              videoRef.current.play().catch(() => {});
                            }
                          }}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                            isActive
                              ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : "text-foreground hover:text-foreground hover:bg-accent"
                          }`}
                        >
                          <span className="tabular-nums text-xs font-mono opacity-60 shrink-0 w-8 text-right">
                            {formatTimestamp(step.time)}
                          </span>
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isActive ? "bg-blue-500 text-white" : "bg-foreground text-background"
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span className={`text-sm leading-tight ${isActive ? "font-semibold" : "font-medium"}`}>
                            {step.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="rounded-xl overflow-hidden shadow-lg">
                      <video ref={videoRef} src="/bcourses-instructions.mp4" muted playsInline controls onTimeUpdate={handleTimeUpdate} className="w-full" />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setVideoExpanded(false); videoRef.current?.pause(); }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 flex items-center gap-1 mx-auto"
                >
                  <X size={14} />
                  hide video
                </button>
              </div>
            </div>

            {/* Collapsed: numbered steps */}
            <div
              className="grid overflow-hidden transition-[grid-template-rows,opacity] duration-500"
              style={{
                gridTemplateRows: videoExpanded ? "0fr" : "1fr",
                opacity: videoExpanded ? 0 : 1,
                transitionTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)",
              }}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="flex flex-col gap-1 mb-4 text-left">
                  {TOKEN_STEPS.map((step, i) => (
                    <div key={step.time}>
                      <div className="flex items-center gap-3 px-2 py-2">
                        <span className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                          {i === 1 ? (
                            <>
                              {step.label}
                              <button
                                type="button"
                                onClick={() => setShowTokenHelp(!showTokenHelp)}
                                className="text-blue-400 font-normal text-xs hover:text-blue-600 cursor-pointer transition-colors"
                              >
                                having issues?
                              </button>
                            </>
                          ) : (
                            step.label
                          )}
                        </span>
                      </div>
                      {i === 1 && showTokenHelp && (
                        <p className="text-xs text-foreground ml-12 mb-1 leading-relaxed">
                          If you have any preexisting API tokens, delete them first, then create a new one.
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setVideoExpanded(true);
                    setTimeout(() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                        videoRef.current.play().catch(() => {});
                        videoRef.current.playbackRate = 1.1;
                      }
                    }, 400);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-3 mb-4 rounded-xl text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-500/20 active:scale-[0.98] transition-all duration-150"
                >
                  <Play size={14} />
                  watch how to generate a token
                </button>
              </div>
            </div>
          </div>

          <div className="mb-3 animate-drop-in delay-200">
            <div className="flex items-center rounded-xl border border-border bg-card overflow-hidden focus-within:border-foreground/50 transition-colors">
              <span className="pl-3 py-2.5 text-sm text-foreground/50 select-none shrink-0 bg-muted/50 pr-2 border-r border-border">https://</span>
              <input
                type="text"
                value={baseHost}
                onChange={(e) => setBaseHost(e.target.value)}
                placeholder="canvas.stanford.edu"
                autoComplete="new-password"
                name="canvas-add-url-nofill"
                data-1p-ignore
                className="flex-1 px-1.5 py-2.5 bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-5 animate-drop-in delay-200">
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="paste access token"
                autoComplete="new-password"
                name="canvas-add-token-nofill"
                data-1p-ignore
                className="w-full px-3 py-2.5 pr-10 rounded-xl border border-border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 animate-drop-in delay-300">
            <button
              onClick={onSkip}
              className="flex-1 px-4 py-2.5 text-sm text-muted-foreground rounded-xl bg-card btn-elevated-secondary"
            >
              cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={verifying || saving}
              className="flex-1 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 btn-elevated-primary"
            >
              {verifying && <Loader2 size={14} className="animate-spin" />}
              {verifying ? "verifying..." : "connect"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => { setMode("ical"); setError(null); }}
            className="mt-4 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            use calendar feed instead (easier)
          </button>
        </>
      )}

      {/* ===== Course selection (API mode only) ===== */}
      {mode === "api" && courses && (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">
                select courses to sync ({selectedIds.size}/{courses.length})
              </p>
              <button
                type="button"
                onClick={() => {
                  if (selectedIds.size === courses.length) {
                    setSelectedIds(new Set());
                  } else {
                    setSelectedIds(new Set(courses.map((c) => c.id)));
                  }
                }}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors duration-100"
              >
                {selectedIds.size === courses.length ? "deselect all" : "select all"}
              </button>
            </div>
            <div className="max-h-80 overflow-auto rounded-xl border border-border">
              {courses.map((course) => (
                <label
                  key={course.id}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent transition-colors duration-100 cursor-pointer border-b border-border last:border-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(course.id)}
                    onChange={() => toggleCourse(course.id)}
                    className="w-4 h-4 rounded accent-foreground"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-foreground block truncate">{course.name}</span>
                    <span className="text-xs text-muted-foreground block truncate">{course.course_code}</span>
                  </div>
                </label>
              ))}
              {courses.length === 0 && (
                <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                  no active courses found.
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onSkip}
              disabled={saving}
              className="flex-1 px-4 py-2.5 text-sm text-muted-foreground rounded-xl bg-card btn-elevated-secondary disabled:opacity-50"
            >
              cancel
            </button>
            <button
              onClick={handleSaveAndNext}
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold disabled:opacity-50 btn-elevated-primary"
            >
              {saving ? "saving..." : "save"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
