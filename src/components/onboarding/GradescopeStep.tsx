"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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
 * Gradescope onboarding step with credential verification and course selection.
 * Flow: enter email/password -> click "Verify & Load Courses" -> show course checkboxes -> save.
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
      <h2 className="text-lg font-bold text-foreground mb-1">Gradescope Integration</h2>
      <p className="text-sm text-muted-foreground mb-4">
        We&apos;ll sign into Gradescope on your behalf to pull your upcoming assignments.
      </p>

      {/* Instructions for CalNet users */}
      <div className="bg-emerald-50/60 rounded-xl px-4 py-3 mb-5 text-xs text-secondary-foreground leading-relaxed">
        <p className="font-semibold text-secondary-foreground mb-2">Important for CalNet (Berkeley) users:</p>
        <p className="mb-1.5">
          If you normally log into Gradescope via &quot;School Credentials&quot; / CalNet SSO, you&apos;ll need to set a
          Gradescope-specific password first:
        </p>
        <ol className="list-decimal list-inside flex flex-col gap-1.5">
          <li>Go to <a href="https://www.gradescope.com/reset_password" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">gradescope.com/reset_password</a></li>
          <li>Enter your <span className="font-medium text-secondary-foreground">@berkeley.edu</span> email</li>
          <li>Check your email and set a new password</li>
          <li>Use that email &amp; password below</li>
        </ol>
        <p className="mt-2 text-subtle-foreground">
          Your credentials are encrypted and only used to fetch assignments.
        </p>
      </div>

      {/* Email + Password inputs (before verification) */}
      {!courses && (
        <>
          <div className="flex flex-col gap-3 mb-5">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@berkeley.edu"
                className="w-full px-3 py-2.5 rounded-xl bg-input-bg text-sm text-foreground placeholder-subtle-foreground focus:outline-none focus:bg-input-bg-focus transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your Gradescope password"
                  className="w-full px-3 py-2.5 pr-10 rounded-xl bg-input-bg text-sm text-foreground placeholder-subtle-foreground focus:outline-none focus:bg-input-bg-focus transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-subtle-foreground hover:text-secondary-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onSkip}
              className="flex-1 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleVerify}
              disabled={verifying || saving}
              className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {verifying && <Loader2 size={14} className="animate-spin" />}
              {verifying ? "Verifying..." : "Verify & Load Courses"}
            </button>
          </div>
        </>
      )}

      {/* Course selection (after verification) */}
      {courses && (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-secondary-foreground">
                Select courses to sync ({selectedIds.size}/{courses.length})
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
                className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
              >
                {selectedIds.size === courses.length ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="max-h-48 overflow-auto rounded-xl bg-input-bg border border-border">
              {courses.map((course) => (
                <label
                  key={course.id}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent transition-colors cursor-pointer border-b border-border-subtle last:border-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(course.id)}
                    onChange={() => toggleCourse(course.id)}
                    className="w-4 h-4 rounded accent-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-foreground block truncate">{course.name}</span>
                    {course.shortName && (
                      <span className="text-xs text-subtle-foreground block truncate">{course.shortName}</span>
                    )}
                  </div>
                </label>
              ))}
              {courses.length === 0 && (
                <div className="px-3 py-4 text-sm text-subtle-foreground text-center">
                  No active courses found.
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
              className="flex-1 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSaveAndNext}
              disabled={saving || selectedIds.size === 0}
              className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save & Next"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
