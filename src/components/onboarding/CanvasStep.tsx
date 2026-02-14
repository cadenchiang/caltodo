"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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
}

/**
 * Canvas onboarding step with token verification and course selection.
 * Flow: enter token -> click "Verify & Load Courses" -> show course checkboxes -> save.
 *
 * @param onNext - Async callback to save credentials; returns true on success
 * @param onSkip - Callback to skip this step
 * @param saving - Whether a save operation is in progress
 * @param error - Current error message to display
 * @param setError - Callback to set/clear error messages
 */
export default function CanvasStep({ onNext, onSkip, saving, error, setError }: CanvasStepProps) {
  const [canvasToken, setCanvasToken] = useState("");
  const [canvasBaseUrl, setCanvasBaseUrl] = useState("https://bcourses.berkeley.edu");
  const [showToken, setShowToken] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [courses, setCourses] = useState<CanvasCourse[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  /**
   * Verifies the token by fetching courses from Canvas.
   * On success, shows course list with all courses pre-checked.
   */
  async function handleVerify() {
    if (!canvasToken.trim()) {
      setError("Please enter your Canvas access token.");
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
      // Pre-check all courses
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

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-1">Canvas Integration</h2>
      <p className="text-sm text-muted-foreground mb-4">
        We need a personal access token from Canvas (bCourses) to read your assignments.
      </p>

      {/* Instructions */}
      <div className="bg-blue-50/60 rounded-xl px-4 py-3 mb-5 text-xs text-secondary-foreground leading-relaxed">
        <p className="font-semibold text-secondary-foreground mb-2">How to get your token:</p>
        <ol className="list-decimal list-inside flex flex-col gap-1.5">
          <li>Open <a href="https://bcourses.berkeley.edu/profile/settings" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">bCourses Settings</a> (Profile icon &rarr; Settings)</li>
          <li>Scroll down to <span className="font-medium text-secondary-foreground">Approved Integrations</span></li>
          <li>Click <span className="font-medium text-secondary-foreground">+ New Access Token</span></li>
          <li>Set purpose to <span className="italic">toodoocal</span>, leave expiry blank</li>
          <li>Click <span className="font-medium text-secondary-foreground">Generate Token</span></li>
          <li>Copy the token and paste it below &mdash; <span className="text-amber-600 font-medium">you won&apos;t be able to see it again</span></li>
        </ol>
      </div>

      {/* Token + URL inputs */}
      {!courses && (
        <>
          <div className="flex flex-col gap-3 mb-5">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Canvas Base URL</label>
              <input
                type="url"
                value={canvasBaseUrl}
                onChange={(e) => setCanvasBaseUrl(e.target.value)}
                placeholder="https://bcourses.berkeley.edu"
                className="w-full px-3 py-2.5 rounded-xl bg-input-bg text-sm text-foreground placeholder-subtle-foreground focus:outline-none focus:bg-input-bg-focus transition-all"
              />
              <p className="text-xs text-subtle-foreground mt-1">
                Change this only if your school doesn&apos;t use bCourses.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Access Token</label>
              <div className="relative">
                <input
                  type={showToken ? "text" : "password"}
                  value={canvasToken}
                  onChange={(e) => setCanvasToken(e.target.value)}
                  placeholder="Paste your Canvas access token here"
                  className="w-full px-3 py-2.5 pr-10 rounded-xl bg-input-bg text-sm text-foreground placeholder-subtle-foreground focus:outline-none focus:bg-input-bg-focus transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-subtle-foreground hover:text-secondary-foreground transition-colors"
                >
                  {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
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

      {/* Course selection */}
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
                    <span className="text-xs text-subtle-foreground block truncate">{course.course_code}</span>
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
