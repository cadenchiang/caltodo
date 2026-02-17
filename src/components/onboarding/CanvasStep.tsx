"use client";

import { useState, useRef } from "react";
import { Eye, EyeOff, Loader2, Play } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

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
 * Canvas onboarding step with always-white styling.
 * Flow: enter token -> verify -> select courses -> save.
 *
 * @param onNext - Async callback to save credentials; returns true on success
 * @param onSkip - Callback to skip this step
 * @param saving - Whether a save operation is in progress
 * @param error - Current error message to display
 * @param setError - Callback to set/clear error messages
 */
export default function CanvasStep({ onNext, onSkip, saving, error, setError }: CanvasStepProps) {
  const { showToast } = useToast();
  const [canvasToken, setCanvasToken] = useState("");
  const [canvasBaseUrl, setCanvasBaseUrl] = useState("https://bcourses.berkeley.edu");
  const [showToken, setShowToken] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [courses, setCourses] = useState<CanvasCourse[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [videoExpanded, setVideoExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <img src="/bcourses-logo.png" alt="bCourses" width={22} height={22} className="shrink-0" />
        <h2 className="text-lg font-bold text-gray-800 animate-drop-in">bCourses</h2>
      </div>

      {!courses && (
        <>
          <p className="text-sm text-gray-500 mb-2 animate-drop-in delay-100">
            paste your access token from{" "}
            <a href="https://bcourses.berkeley.edu/profile/settings" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
              bCourses Settings
            </a>{" "}
            &gt; Approved Integrations &gt; + New Access Token.
          </p>
          <p className="text-xs text-gray-400 mb-4 animate-drop-in delay-100">
            set the expiration to the <strong className="text-gray-500">maximum (120 days)</strong> so your token lasts the full semester.
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
                  className="w-full flex items-center gap-2.5 px-3.5 py-3 mb-4 rounded-xl text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 active:scale-[0.98] transition-all duration-150"
                >
                  <Play size={14} />
                  watch how to generate a token
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
                    src="/bcourses-instructions.mp4"
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
