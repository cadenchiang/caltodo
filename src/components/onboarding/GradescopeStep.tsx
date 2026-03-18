"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Loader2, Merge, ShieldCheck, ChevronDown } from "lucide-react";
import { extractCourseCode } from "@/lib/course-name-merge";

/**
 * Collapsible help text for SSO/password issues.
 * Blue clickable link that expands to show explanation and reset link.
 */
function AuthHelpDropdown() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 animate-drop-in">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-sm font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-1 mx-auto"
      >
        don&apos;t see your classes?
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="mt-3 text-center animate-drop-in">
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            if you normally sign in to Gradescope with Google or your school&apos;s SSO, your password
            won&apos;t work here. you need a Gradescope-specific password.
          </p>
          <a
            href="https://www.gradescope.com/reset_password"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
          >
            reset Gradescope password
          </a>
          <p className="text-[11px] text-muted-foreground/60 mt-2">
            then come back and try again with the new password.
          </p>
        </div>
      )}
    </div>
  );
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
  /** Already-selected Canvas courses (for detecting overlaps). */
  existingCanvasCourses?: Array<{ id: number; name: string }>;
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
export default function GradescopeStep({ onNext, onSkip, saving, error, setError, initialEmail, initialPassword, initialCourses, initialSelectedIds, onDraftChange, existingCanvasCourses }: GradescopeStepProps) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [password, setPassword] = useState(initialPassword ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [courses, setCourses] = useState<GradescopeCourse[] | null>(initialCourses ?? null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelectedIds ?? []));
  const [showMergeModal, setShowMergeModal] = useState(false);
  /** Whether the last verification attempt returned 401 (wrong password / SSO user). */
  const [authFailed, setAuthFailed] = useState(false);
  /** Gradescope courses that overlap with already-selected Canvas courses. */
  const [overlappingCourses, setOverlappingCourses] = useState<GradescopeCourse[]>([]);
  /** Tracks the timestamp of the last verification attempt for rate limiting. */
  const lastVerifyRef = useRef<number>(0);

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

  /**
   * Verifies credentials by fetching courses from Gradescope.
   * On success, shows course list with all courses pre-checked.
   */
  async function handleVerify() {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both your email and password.");
      return;
    }

    // Client-side rate limit: 2-second cooldown between attempts
    const now = Date.now();
    if (now - lastVerifyRef.current < 2000) {
      return;
    }
    lastVerifyRef.current = now;

    setVerifying(true);
    setError(null);
    setAuthFailed(false);

    try {
      const res = await fetch("/api/gradescope/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          setAuthFailed(true);
          return;
        }
        if (res.status >= 500 && res.status < 600) {
          throw new Error("Server error. Please try again later.");
        }
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Verification failed: ${res.status}`);
      }
      const data = await res.json();
      const fetchedCourses: GradescopeCourse[] = data.courses;
      setCourses(fetchedCourses);
      setSelectedIds(new Set());

      // Detect overlapping courses with already-selected Canvas courses
      if (existingCanvasCourses && existingCanvasCourses.length > 0) {
        const canvasCodes = new Set(
          existingCanvasCourses
            .map((c) => extractCourseCode(c.name))
            .filter(Boolean) as string[]
        );
        const overlaps = fetchedCourses.filter((gc) => {
          const code = extractCourseCode(gc.name);
          return code && canvasCodes.has(code);
        });
        if (overlaps.length > 0) {
          setOverlappingCourses(overlaps);
          setShowMergeModal(true);
        }
      }
    } catch (err) {
      if (err instanceof TypeError) {
        setError("Network error. Check your connection.");
      } else {
        setError(err instanceof Error ? err.message : String(err));
      }
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
          <p className="text-xs text-muted-foreground mb-4 animate-drop-in delay-100 flex items-center justify-center gap-1">
            <ShieldCheck size={12} />
            Your password is encrypted with AES-256. No one can see it — not even us.
          </p>

          <div className="flex flex-col gap-3 mb-5 animate-drop-in delay-200">
            <input
              type="text"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="school email"
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-form-type="other"
              data-lpignore="true"
              data-1p-ignore
              name="gs-email-nofill"
              className="w-full px-3 py-2.5 rounded-xl border border-foreground/20 bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors"
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
                className="w-full px-3 py-2.5 pr-10 rounded-xl border border-foreground/20 bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors"
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

          <div className="animate-drop-in delay-300">
            <button
              onClick={handleVerify}
              disabled={verifying || saving}
              className="w-full px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 btn-elevated-primary"
            >
              {verifying && <Loader2 size={14} className="animate-spin" />}
              {verifying ? "verifying..." : "connect"}
            </button>
          </div>

          {authFailed && (
            <AuthHelpDropdown />
          )}
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
                <div className="px-3 py-4">
                  <AuthHelpDropdown />
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSaveAndNext}
            disabled={saving}
            className="w-full px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold disabled:opacity-50 btn-elevated-primary"
          >
            {saving ? "saving..." : selectedIds.size > 0 ? "save & next" : "next"}
          </button>
        </>
      )}
      {/* Merge confirmation modal */}
      {showMergeModal && overlappingCourses.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-2xl shadow-2xl border border-border p-5 max-w-sm w-full mx-4 animate-drop-in">
            <div className="flex items-center gap-2 mb-3">
              <Merge size={18} className="text-teal-500" />
              <h3 className="text-sm font-bold text-foreground">Merge with bCourses?</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              These Gradescope courses match classes you already have from bCourses. Would you like to sync them together?
            </p>
            <div className="rounded-xl border border-border mb-4 max-h-40 overflow-auto">
              {overlappingCourses.map((gc) => (
                <div key={gc.id} className="flex items-center gap-2 px-3 py-2 border-b border-border last:border-0">
                  <span className="text-sm text-foreground truncate">{gc.name}</span>
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-600/40 dark:text-emerald-400 shrink-0">Gradescope</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowMergeModal(false)}
                className="flex-1 px-3 py-2 text-sm text-muted-foreground rounded-xl bg-card border border-border hover:bg-accent transition-colors"
              >
                No thanks
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedIds((prev) => {
                    const next = new Set(prev);
                    overlappingCourses.forEach((c) => next.add(c.id));
                    return next;
                  });
                  setShowMergeModal(false);
                }}
                className="flex-1 px-3 py-2 text-sm font-semibold rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 btn-elevated-primary"
              >
                Merge & select
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
