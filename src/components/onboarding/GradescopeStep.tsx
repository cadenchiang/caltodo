"use client";

import { useState, useRef } from "react";
import { Eye, EyeOff, Loader2, Play } from "lucide-react";

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
}

/**
 * Gradescope onboarding step with always-white styling.
 * Flow: enter email/password -> verify -> select courses -> save.
 *
 * @param onNext - Async callback to save credentials; returns true on success
 * @param onSkip - Callback to skip this step
 * @param saving - Whether a save operation is in progress
 * @param error - Current error message to display
 * @param setError - Callback to set/clear error messages
 */
export default function GradescopeStep({ onNext, onSkip, saving, error, setError }: GradescopeStepProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [courses, setCourses] = useState<GradescopeCourse[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [videoExpanded, setVideoExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
      setSelectedIds(new Set(fetchedCourses.map((c) => c.id)));
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

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <svg width="22" height="22" viewBox="0 0 14 14" fill="none" className="shrink-0">
          <rect width="14" height="14" rx="3" fill="#3AADA8" />
          <rect x="1.5" y="8.5" width="2" height="3.5" rx="0.5" fill="white" />
          <rect x="4.5" y="6.5" width="2" height="5.5" rx="0.5" fill="white" />
          <rect x="7.5" y="4.5" width="2" height="7.5" rx="0.5" fill="white" />
          <rect x="10.5" y="2.5" width="2" height="9.5" rx="0.5" fill="white" />
        </svg>
        <h2 className="text-lg font-bold text-gray-800 animate-drop-in">Gradescope</h2>
      </div>

      {/* Login inputs (no courses loaded yet) */}
      {!courses && (
        <>
          <p className="text-sm text-gray-500 mb-1 animate-drop-in delay-100">
            sign in with your Gradescope email and password.
          </p>
          <p className="text-xs text-gray-400 mb-4 animate-drop-in delay-100">
            if you use CalNet SSO, you&apos;ll need to create a Gradescope-specific password first.
            go to{" "}
            <a href="https://www.gradescope.com/reset_password" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
              Reset Password
            </a>{" "}
            and enter your Berkeley email — this won&apos;t affect your CalNet login.
          </p>

          {/* Video section with smooth expand/collapse */}
          <div className="animate-drop-in delay-150">
            {/* Button - collapses when video expanded */}
            <div
              className="grid overflow-hidden transition-[grid-template-rows,opacity] duration-500"
              style={{
                gridTemplateRows: videoExpanded ? "0fr" : "1fr",
                opacity: videoExpanded ? 0 : 1,
                transitionTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)",
              }}
            >
              <div className="min-h-0 overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setVideoExpanded(true);
                    setTimeout(() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                        videoRef.current.play().catch(() => {});
                      }
                    }, 400);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 mb-4 rounded-xl text-xs text-gray-500 bg-white btn-elevated-secondary"
                >
                  <Play size={14} />
                  watch how to sign in
                </button>
              </div>
            </div>

            {/* Video - expands smoothly from 0 height, breaks out of container */}
            <div
              className="grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-500"
              style={{
                gridTemplateRows: videoExpanded ? "1fr" : "0fr",
                opacity: videoExpanded ? 1 : 0,
                marginLeft: videoExpanded ? "-6rem" : "0",
                marginRight: videoExpanded ? "-6rem" : "0",
                transitionTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)",
              }}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="rounded-xl overflow-hidden shadow-lg mb-3">
                  <video
                    ref={videoRef}
                    src="/gradescope-instructions.mp4"
                    loop
                    muted
                    playsInline
                    controls
                    className="w-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setVideoExpanded(false);
                    videoRef.current?.pause();
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors mb-4"
                >
                  hide video
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
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors"
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
                className="w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-300 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
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

      {/* Course selection (after verification) */}
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
            <div className="max-h-48 overflow-auto rounded-xl border border-gray-100">
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
                    {course.shortName && (
                      <span className="text-xs text-gray-400 block truncate">{course.shortName}</span>
                    )}
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
              onClick={() => {
                setCourses(null);
                setSelectedIds(new Set());
              }}
              className="flex-1 px-4 py-2.5 text-sm text-gray-400 rounded-xl bg-white btn-elevated-secondary"
            >
              back
            </button>
            <button
              onClick={handleSaveAndNext}
              disabled={saving || selectedIds.size === 0}
              className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-semibold disabled:opacity-50 btn-elevated-primary"
            >
              {saving ? "saving..." : "save & next"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
