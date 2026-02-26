"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
}

interface AddCanvasStepProps {
  onNext: (payload: {
    label: string;
    base_url: string;
    token: string;
    selected_courses: Array<{ id: number; name: string }>;
  }) => Promise<boolean>;
  onSkip: () => void;
  saving: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

/**
 * Setup flow for adding an additional Canvas account.
 * Similar to CanvasStep but with editable label and base URL fields.
 *
 * Flow: enter label + base URL + token -> verify -> select courses -> save.
 *
 * @param onNext - Async callback to save the account; returns true on success
 * @param onSkip - Callback to cancel and go back
 * @param saving - Whether a save operation is in progress
 * @param error - Current error message to display
 * @param setError - Callback to set/clear error messages
 */
export default function AddCanvasStep({ onNext, onSkip, saving, error, setError }: AddCanvasStepProps) {
  const { showToast } = useToast();
  const [label, setLabel] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [courses, setCourses] = useState<CanvasCourse[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  /**
   * Verifies the token by fetching courses from the Canvas instance.
   * On success, shows course list for selection.
   */
  async function handleVerify() {
    if (!label.trim()) {
      showToast("Please enter a label for this Canvas account.");
      return;
    }
    if (!baseUrl.trim()) {
      showToast("Please enter the Canvas base URL.");
      return;
    }
    if (!token.trim()) {
      showToast("Please enter your Canvas access token.");
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        token: token.trim(),
        base_url: baseUrl.trim(),
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
   *
   * @param id - Course ID to toggle
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
   * Saves the account with selected courses and advances.
   */
  async function handleSaveAndNext() {
    if (!courses) return;
    const selected = courses
      .filter((c) => selectedIds.has(c.id))
      .map((c) => ({ id: c.id, name: c.name }));

    await onNext({
      label: label.trim(),
      base_url: baseUrl.trim(),
      token: token.trim(),
      selected_courses: selected,
    });
  }

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <img src="/canvas-logo.png" alt="Canvas" width={22} height={22} className="shrink-0 object-contain" />
        <h2 className="text-lg font-bold text-gray-800 animate-drop-in">Add Canvas Account</h2>
      </div>

      {!courses && (
        <>
          <p className="text-sm text-gray-500 mb-5 animate-drop-in delay-100">
            Connect an additional Canvas instance (e.g. another school).
          </p>

          {/* Label input */}
          <div className="mb-3 animate-drop-in delay-150">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="label (e.g. Stanford Canvas)"
              autoComplete="new-password"
              name="canvas-add-label-nofill"
              data-1p-ignore
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors"
            />
          </div>

          {/* Base URL input */}
          <div className="mb-3 animate-drop-in delay-200">
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="base URL (e.g. https://canvas.stanford.edu)"
              autoComplete="new-password"
              name="canvas-add-url-nofill"
              data-1p-ignore
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors"
            />
          </div>

          {/* Token input */}
          <div className="mb-5 animate-drop-in delay-300">
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="paste access token"
                autoComplete="new-password"
                name="canvas-add-token-nofill"
                data-1p-ignore
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

          <div className="flex gap-3 animate-drop-in" style={{ animationDelay: "350ms" }}>
            <button
              onClick={onSkip}
              className="flex-1 px-4 py-2.5 text-sm text-gray-400 rounded-xl bg-white btn-elevated-secondary"
            >
              cancel
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
              onClick={onSkip}
              disabled={saving}
              className="flex-1 px-4 py-2.5 text-sm text-gray-400 rounded-xl bg-white btn-elevated-secondary disabled:opacity-50"
            >
              cancel
            </button>
            <button
              onClick={handleSaveAndNext}
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-semibold disabled:opacity-50 btn-elevated-primary"
            >
              {saving ? "saving..." : selectedIds.size > 0 ? "save" : "save"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
