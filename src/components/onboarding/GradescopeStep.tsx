"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowDown, Eye, EyeOff, Loader2, Play, X } from "lucide-react";

/** Clickable chapter timestamps for the Gradescope instruction video. */
const GRADESCOPE_CHAPTERS: Array<{ label: string; time: number }> = [
  { label: "Reset password", time: 0 },
  { label: "Ignore \"you must be logged out to access this page\"", time: 5 },
  { label: "Check your email", time: 15 },
  { label: "Set new password", time: 23 },
  { label: "Sign in", time: 33 },
];

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

interface GradescopeCourse {
  id: string;
  name: string;
  shortName: string;
}

interface GradescopeStepProps {
  onNext: (payload: {
    gradescope_email: string;
    gradescope_password: string;
    selected_gradescope_courses: Array<{ id: string; name: string }>;
  }) => Promise<boolean>;
  onSkip: () => void;
  saving: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  /** Persisted draft state from a previous visit to this step. */
  initialEmail?: string;
  initialPassword?: string;
  initialCourses?: GradescopeCourse[] | null;
  initialSelectedIds?: string[];
  /** Called on unmount to persist draft state across step navigation. */
  onDraftChange?: (draft: { email: string; password: string; courses: GradescopeCourse[] | null; selectedIds: string[] }) => void;
}

/**
 * Gradescope onboarding step with theme-aware styling.
 * Flow: enter email/password -> verify -> select courses -> save.
 *
 * @param onNext - Async callback to save credentials; returns true on success
 * @param onSkip - Callback to skip this step
 * @param saving - Whether a save operation is in progress
 * @param error - Current error message to display
 * @param setError - Callback to set/clear error messages
 */
export default function GradescopeStep({ onNext, onSkip, saving, error, setError, initialEmail, initialPassword, initialCourses, initialSelectedIds, onDraftChange }: GradescopeStepProps) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [password, setPassword] = useState(initialPassword ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [courses, setCourses] = useState<GradescopeCourse[] | null>(initialCourses ?? null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelectedIds ?? []));
  const [videoExpanded, setVideoExpanded] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  /** Ref tracking latest state for unmount draft reporting. */
  const draftRef = useRef({ email, password, courses, selectedIds: Array.from(selectedIds) });
  useEffect(() => {
    draftRef.current = { email, password, courses, selectedIds: Array.from(selectedIds) };
  });
  /** Reports draft state to parent on unmount so it persists across step navigation. */
  useEffect(() => {
    return () => { onDraftChange?.(draftRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Updates current playback time for step highlighting. Stops video at 42s. */
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setVideoTime(videoRef.current.currentTime);
      if (videoRef.current.currentTime >= 42) {
        videoRef.current.pause();
        videoRef.current.currentTime = 42;
      }
    }
  }, []);

  /**
   * Determines which step is currently active based on video playback time.
   *
   * @returns Index of the active step, or -1 if video is not playing
   */
  function getActiveStepIndex(): number {
    if (!videoExpanded) return -1;
    for (let i = GRADESCOPE_CHAPTERS.length - 1; i >= 0; i--) {
      if (videoTime >= GRADESCOPE_CHAPTERS[i].time) return i;
    }
    return 0;
  }

  /**
   * Verifies credentials by fetching courses from Gradescope.
   * On success, shows course list with all courses pre-checked.
   */
  async function handleVerify() {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both your email and password.");
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const res = await fetch("/api/gradescope/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Verification failed: ${res.status}`);
      }
      const data = await res.json();
      const fetchedCourses: GradescopeCourse[] = data.courses;
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
  function toggleCourse(id: string) {
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
      gradescope_email: email.trim(),
      gradescope_password: password.trim(),
      selected_gradescope_courses: selected,
    });
    if (!ok) return;
  }

  const activeStep = getActiveStepIndex();

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <svg width="22" height="22" viewBox="0 0 14 14" fill="none" className="shrink-0">
          <rect width="14" height="14" rx="3" fill="#3AADA8" />
          <rect x="1.5" y="8.5" width="2" height="3.5" rx="0.5" fill="white" />
          <rect x="4.5" y="6.5" width="2" height="5.5" rx="0.5" fill="white" />
          <rect x="7.5" y="4.5" width="2" height="7.5" rx="0.5" fill="white" />
          <rect x="10.5" y="2.5" width="2" height="9.5" rx="0.5" fill="white" />
        </svg>
        <h2 className="text-lg font-bold text-foreground animate-drop-in">Gradescope</h2>
      </div>

      {/* Login inputs (no courses loaded yet) */}
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
                    {GRADESCOPE_CHAPTERS.map((step, i) => {
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
                              ? "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400"
                              : "text-foreground hover:text-foreground hover:bg-accent"
                          }`}
                        >
                          <span className="tabular-nums text-xs font-mono opacity-60 shrink-0 w-8 text-right">
                            {formatTimestamp(step.time)}
                          </span>
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isActive
                                ? "bg-teal-500 text-white"
                                : "bg-foreground text-background"
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span className={`text-sm leading-tight ${isActive ? "font-semibold" : "font-medium"}`}>
                            {i === 0 ? (
                              <a
                                href="https://www.gradescope.com/reset_password"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline"
                              >
                                Reset password
                              </a>
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
                    <div className="rounded-xl overflow-hidden shadow-lg border border-border">
                      <video
                        ref={videoRef}
                        src="/gradescope-instructions.mp4"
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
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 flex items-center gap-1 mx-auto"
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
                  {GRADESCOPE_CHAPTERS.map((step, i) => (
                    <div key={step.time}>
                      <div className="flex items-center gap-3 px-2 py-2">
                        <span className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                          {i === 0 ? (
                            <>
                              <a
                                href="https://www.gradescope.com/reset_password"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline"
                              >
                                Reset password
                              </a>
                              <button
                                type="button"
                                onClick={() => setShowWhy(!showWhy)}
                                className="text-blue-400 font-normal text-xs hover:text-blue-600 cursor-pointer transition-colors"
                              >
                                why?
                              </button>
                            </>
                          ) : (
                            step.label
                          )}
                          {i === GRADESCOPE_CHAPTERS.length - 1 && (
                            <ArrowDown size={14} className="text-muted-foreground" />
                          )}
                        </span>
                      </div>
                      {i === 0 && showWhy && (
                        <p className="text-xs text-foreground ml-12 mb-1 leading-relaxed">
                          Your CalNet ID password doesn&apos;t work here — Gradescope needs its own separate password. Your password is encrypted with AES-256 and stored securely. No one — not even us — can see your credentials.
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
                  className="w-full flex items-center gap-2.5 px-3.5 py-3 mb-4 rounded-xl text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 hover:bg-teal-100 dark:hover:bg-teal-500/20 active:scale-[0.98] transition-all duration-150"
                >
                  <Play size={14} />
                  watch how to reset your password
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mb-5 animate-drop-in delay-200">
            <input
              type="text"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-form-type="other"
              data-lpignore="true"
              data-1p-ignore
              name="gs-email-nofill"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                autoComplete="new-password"
                data-form-type="other"
                data-lpignore="true"
                data-1p-ignore
                name="gs-pass-nofill"
                className="w-full px-3 py-2.5 pr-10 rounded-xl border border-border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 animate-drop-in delay-300">
            <button
              onClick={onSkip}
              className="flex-1 px-4 py-2.5 text-sm text-muted-foreground rounded-xl bg-card btn-elevated-secondary"
            >
              skip
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
        </>
      )}

      {/* Course selection (after verification) */}
      {courses && (
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
                    {course.shortName && (
                      <span className="text-xs text-muted-foreground block truncate">{course.shortName}</span>
                    )}
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
              onClick={async () => {
                // Skip saves credentials but with empty course selection
                await onNext({
                  gradescope_email: email.trim(),
                  gradescope_password: password.trim(),
                  selected_gradescope_courses: [],
                });
              }}
              disabled={saving}
              className="flex-1 px-4 py-2.5 text-sm text-muted-foreground rounded-xl bg-card btn-elevated-secondary disabled:opacity-50"
            >
              skip
            </button>
            <button
              onClick={handleSaveAndNext}
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold disabled:opacity-50 btn-elevated-primary"
            >
              {saving ? "saving..." : selectedIds.size > 0 ? "save & next" : "next"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
