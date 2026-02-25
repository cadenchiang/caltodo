"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Eye, EyeOff, Loader2, Play, X } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

/**
 * Instruction steps for generating a bCourses access token.
 * Each step maps to a timestamp in the instruction video.
 *
 * @property label - Step description shown to the user
 * @property time - Video timestamp in seconds for this step
 */
const TOKEN_STEPS: Array<{ label: string; time: number }> = [
  { label: "open bCourses settings", time: 0 },
  { label: "create + new access token", time: 5 },
  { label: "set expiration to max (120 days)", time: 12 },
  { label: "copy your token", time: 18 },
];

interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
}

interface CanvasStepProps {
  onNext: (payload: {
    canvas_token: string;
    canvas_base_url: string;
    selected_canvas_courses: Array<{ id: number; name: string }>;
  }) => Promise<boolean>;
  onSkip: () => void;
  saving: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  /** Persisted draft state from a previous visit to this step. */
  initialToken?: string;
  initialBaseUrl?: string;
  initialCourses?: CanvasCourse[] | null;
  initialSelectedIds?: number[];
  /** Called on unmount to persist draft state across step navigation. */
  onDraftChange?: (draft: { token: string; baseUrl: string; courses: CanvasCourse[] | null; selectedIds: number[] }) => void;
}

/**
 * Formats a timestamp in seconds to "M:SS" display format.
 *
 * @param seconds - Time in seconds
 * @returns Formatted string like "0:00", "0:15", "1:00"
 */
function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Canvas onboarding step with always-white styling.
 * Displays numbered instruction steps that transition to a side-by-side
 * layout with video timestamps when the tutorial video is expanded.
 *
 * Flow: enter token -> verify -> select courses -> save.
 *
 * @param onNext - Async callback to save credentials; returns true on success
 * @param onSkip - Callback to skip this step
 * @param saving - Whether a save operation is in progress
 * @param error - Current error message to display
 * @param setError - Callback to set/clear error messages
 */
export default function CanvasStep({ onNext, onSkip, saving, error, setError, initialToken, initialBaseUrl, initialCourses, initialSelectedIds, onDraftChange }: CanvasStepProps) {
  const { showToast } = useToast();
  const [canvasToken, setCanvasToken] = useState(initialToken ?? "");
  const [canvasBaseUrl, setCanvasBaseUrl] = useState(initialBaseUrl ?? "https://bcourses.berkeley.edu");
  const [showToken, setShowToken] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [courses, setCourses] = useState<CanvasCourse[] | null>(initialCourses ?? null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set(initialSelectedIds ?? []));
  const [videoExpanded, setVideoExpanded] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [showTokenHelp, setShowTokenHelp] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  /** Ref tracking latest state for unmount draft reporting. */
  const draftRef = useRef({ token: canvasToken, baseUrl: canvasBaseUrl, courses, selectedIds: Array.from(selectedIds) });
  useEffect(() => {
    draftRef.current = { token: canvasToken, baseUrl: canvasBaseUrl, courses, selectedIds: Array.from(selectedIds) };
  });
  /** Reports draft state to parent on unmount so it persists across step navigation. */
  useEffect(() => {
    return () => { onDraftChange?.(draftRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Updates current playback time for step highlighting. Ends video at 28s. */
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

  /**
   * Determines which step is currently active based on video playback time.
   *
   * @returns Index of the active step, or -1 if video is not playing
   */
  function getActiveStepIndex(): number {
    if (!videoExpanded) return -1;
    for (let i = TOKEN_STEPS.length - 1; i >= 0; i--) {
      if (videoTime >= TOKEN_STEPS[i].time) return i;
    }
    return 0;
  }

  /**
   * Verifies the token by fetching courses from Canvas.
   * On success, shows course list with all courses pre-checked.
   */
  async function handleVerify() {
    if (!canvasToken.trim()) {
      showToast("Please enter your bCourses access token.");
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        token: canvasToken.trim(),
        base_url: canvasBaseUrl.trim(),
      });
      const res = await fetch(`/api/canvas/courses?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Verification failed: ${res.status}`);
      }
      const data = await res.json();
      const fetchedCourses: CanvasCourse[] = data.courses;
      setCourses(fetchedCourses);
      setSelectedIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setVerifying(false);
    }
  }

  /**
   * Toggles a course's selected state.
   */
  function toggleCourse(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  /**
   * Saves credentials and selected courses, then advances to next step.
   */
  async function handleSaveAndNext() {
    if (!courses) return;
    const selected = courses
      .filter((c) => selectedIds.has(c.id))
      .map((c) => ({ id: c.id, name: c.name }));

    const ok = await onNext({
      canvas_token: canvasToken.trim(),
      canvas_base_url: canvasBaseUrl.trim(),
      selected_canvas_courses: selected,
    });
    if (!ok) return;
  }

  const activeStep = getActiveStepIndex();

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <img src="/bcourses-logo.png" alt="bCourses" width={22} height={22} className="shrink-0" />
        <h2 className="text-lg font-bold text-gray-800 animate-drop-in">bCourses</h2>
      </div>

      {!courses && (
        <>
          {/* Steps + video section */}
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
                  {/* Steps — stacked above on mobile, sidebar on desktop */}
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
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          <span className="tabular-nums text-xs font-mono opacity-60 shrink-0 w-8 text-right">
                            {formatTimestamp(step.time)}
                          </span>
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isActive
                                ? "bg-blue-500 text-white"
                                : "bg-gray-800 text-white"
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span className={`text-sm leading-tight ${isActive ? "font-semibold" : "font-medium"}`}>
                            {i === 0 ? (
                              <>
                                open{" "}
                                <a
                                  href="https://bcourses.berkeley.edu/profile/settings"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 underline"
                                >
                                  bCourses settings
                                </a>
                              </>
                            ) : (
                              step.label
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Video on the right */}
                  <div className="flex-1 min-w-0">
                    <div className="rounded-xl overflow-hidden shadow-lg">
                      <video
                        ref={videoRef}
                        src="/bcourses-instructions.mp4"
                        muted
                        playsInline
                        controls
                        onTimeUpdate={handleTimeUpdate}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setVideoExpanded(false);
                    videoRef.current?.pause();
                  }}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4 flex items-center gap-1 mx-auto"
                >
                  <X size={14} />
                  hide video
                </button>
              </div>
            </div>

            {/* Collapsed: big vertical numbered steps */}
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
                        <span className="w-7 h-7 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                          {i === 0 ? (
                            <>
                              Open{" "}
                              <a
                                href="https://bcourses.berkeley.edu/profile/settings"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline"
                              >
                                bCourses Settings
                              </a>
                            </>
                          ) : i === 1 ? (
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
                        <p className="text-xs text-black ml-12 mb-1 leading-relaxed">
                          If you have any preexisting API tokens, delete them first, then create a new one.
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Watch video button */}
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
                  className="w-full flex items-center gap-2.5 px-3.5 py-3 mb-4 rounded-xl text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 active:scale-[0.98] transition-all duration-150"
                >
                  <Play size={14} />
                  watch how to generate a token
                </button>
              </div>
            </div>
          </div>

          <div className="mb-5 animate-drop-in delay-200">
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={canvasToken}
                onChange={(e) => setCanvasToken(e.target.value)}
                placeholder="paste access token"
                autoComplete="off"
                name="canvas-token-nofill"
                className="w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-300 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800 transition-colors"
              >
                {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 animate-drop-in delay-300">
            <button
              onClick={onSkip}
              className="flex-1 px-4 py-2.5 text-sm text-gray-400 rounded-xl bg-white btn-elevated-secondary"
            >
              skip
            </button>
            <button
              onClick={handleVerify}
              disabled={verifying || saving}
              className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 btn-elevated-primary"
            >
              {verifying && <Loader2 size={14} className="animate-spin" />}
              {verifying ? "verifying..." : "connect"}
            </button>
          </div>
        </>
      )}

      {/* Course selection */}
      {courses && (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">
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
            <div className="max-h-80 overflow-auto rounded-xl border border-gray-100">
              {courses.map((course) => (
                <label
                  key={course.id}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors duration-100 cursor-pointer border-b border-gray-100 last:border-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(course.id)}
                    onChange={() => toggleCourse(course.id)}
                    className="w-4 h-4 rounded accent-gray-800"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-800 block truncate">{course.name}</span>
                    <span className="text-xs text-gray-400 block truncate">{course.course_code}</span>
                  </div>
                </label>
              ))}
              {courses.length === 0 && (
                <div className="px-3 py-4 text-sm text-gray-400 text-center">
                  no active courses found.
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={async () => {
                // Skip saves credentials but with empty course selection
                await onNext({
                  canvas_token: canvasToken.trim(),
                  canvas_base_url: canvasBaseUrl.trim(),
                  selected_canvas_courses: [],
                });
              }}
              disabled={saving}
              className="flex-1 px-4 py-2.5 text-sm text-gray-400 rounded-xl bg-white btn-elevated-secondary disabled:opacity-50"
            >
              skip
            </button>
            <button
              onClick={handleSaveAndNext}
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-semibold disabled:opacity-50 btn-elevated-primary"
            >
              {saving ? "saving..." : selectedIds.size > 0 ? "save & next" : "next"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
