"use client";

import { useState, useRef } from "react";
import { Eye, EyeOff, Lock, Pencil, Loader2, X } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import type { IntegrationCredentials, CredentialsSavePayload } from "@/lib/types";

interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
}

interface CanvasSettingsProps {
  credentials: IntegrationCredentials;
  onUpdate: (updated: IntegrationCredentials) => void;
}

/**
 * Self-contained Canvas settings section with Edit/Save/Cancel and course selection modal.
 * Locked by default. Edit unlocks credential fields and "Verify & Load Courses".
 * Course selection opens as a full-screen modal for easier browsing.
 *
 * @param credentials - Current integration credentials from parent
 * @param onUpdate - Callback with updated credentials after save
 */
export default function CanvasSettings({ credentials, onUpdate }: CanvasSettingsProps) {
  const { showToast } = useToast();
  const [locked, setLocked] = useState(true);
  const [saving, setSaving] = useState(false);

  const [canvasToken, setCanvasToken] = useState(credentials.canvas_token ?? "");
  const [canvasBaseUrl, setCanvasBaseUrl] = useState(credentials.canvas_base_url);
  const [showToken, setShowToken] = useState(false);

  const [courses, setCourses] = useState<CanvasCourse[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [verifying, setVerifying] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);

  const serverState = useRef({
    canvasToken: credentials.canvas_token ?? "",
    canvasBaseUrl: credentials.canvas_base_url,
  });

  /**
   * Verifies the Canvas token by fetching courses from the Canvas API.
   * On success, opens the course selection modal with previous selections pre-checked.
   */
  async function handleVerify() {
    if (!canvasToken.trim()) {
      showToast("Please enter your Canvas access token.");
      return;
    }
    setVerifying(true);
    try {
      const params = new URLSearchParams({
        token: canvasToken.trim(),
        base_url: canvasBaseUrl.trim(),
      });
      const res = await fetch(`/api/canvas/courses?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Verification failed");
      }
      const data = await res.json();
      const fetched: CanvasCourse[] = data.courses;
      setCourses(fetched);
      const prevIds = new Set(credentials.selected_canvas_courses?.map((c) => c.id) ?? []);
      setSelectedIds(prevIds.size > 0 ? prevIds : new Set(fetched.map((c) => c.id)));
      setShowCourseModal(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to verify");
    } finally {
      setVerifying(false);
    }
  }

  /** Toggles a single course's selected state. */
  function toggleCourse(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  /**
   * Saves Canvas credentials and optionally course selection to the API.
   * Only includes course selection if courses were loaded during this edit.
   */
  async function handleSave() {
    setSaving(true);
    const trimmedToken = canvasToken.trim();
    const payload: CredentialsSavePayload = {
      canvas_token: trimmedToken || null,
      canvas_base_url: canvasBaseUrl.trim(),
    };
    if (courses) {
      payload.selected_canvas_courses = courses
        .filter((c) => selectedIds.has(c.id))
        .map((c) => ({ id: c.id, name: c.name }));
    }
    try {
      const res = await fetch("/api/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to save");
      }
      const updated: IntegrationCredentials = await res.json();
      onUpdate(updated);
      serverState.current = {
        canvasToken: updated.canvas_token ?? "",
        canvasBaseUrl: updated.canvas_base_url,
      };
      setCanvasToken(updated.canvas_token ?? "");
      showToast("bCourses settings saved.");
      setLocked(true);
      setCourses(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  /** Reverts form to server state and re-locks the section. */
  function handleCancel() {
    setCanvasToken(serverState.current.canvasToken);
    setCanvasBaseUrl(serverState.current.canvasBaseUrl);
    setShowToken(false);
    setCourses(null);
    setSelectedIds(new Set());
    setLocked(true);
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-foreground">bCourses</h2>
        {locked && (
          <button
            onClick={() => { setLocked(false); setShowToken(false); }}
            className="flex items-center gap-1.5 text-xs text-subtle-foreground hover:text-secondary-foreground transition-colors"
          >
            <Pencil size={12} />
            Edit
          </button>
        )}
      </div>
      <p className="text-xs text-subtle-foreground mb-4">
        Generate a token from{" "}
        <span className="font-medium text-muted-foreground">
          bCourses &gt; Account &gt; Settings &gt; New Access Token
        </span>
        .
      </p>

      {locked ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-muted rounded-xl border border-border">
            <Lock size={14} className="text-subtle-foreground shrink-0" />
            <span className="text-sm text-muted-foreground truncate">
              {canvasToken ? `••••••••${canvasToken.slice(-6)}` : "No token saved"}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5 bg-muted rounded-xl border border-border">
            <Lock size={14} className="text-subtle-foreground shrink-0" />
            <span className="text-sm text-muted-foreground truncate">{canvasBaseUrl}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label htmlFor="canvas-token" className="block text-sm font-medium text-secondary-foreground mb-1">
              Access Token
            </label>
            <div className="relative">
              <input
                id="canvas-token"
                type={showToken ? "text" : "password"}
                value={canvasToken}
                onChange={(e) => setCanvasToken(e.target.value)}
                placeholder="Paste your bCourses access token"
                className="w-full px-3 py-2 pr-10 rounded-xl border border-input-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-blue-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-subtle-foreground hover:text-secondary-foreground transition-colors"
                aria-label={showToken ? "Hide token" : "Show token"}
              >
                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="canvas-url" className="block text-sm font-medium text-secondary-foreground mb-1">
              bCourses URL
            </label>
            <input
              id="canvas-url"
              type="text"
              value={canvasBaseUrl}
              onChange={(e) => setCanvasBaseUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-input-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-blue-400 transition-all"
            />
          </div>

          {/* Verify button / course summary */}
          {!courses ? (
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-blue-200 dark:border-blue-800 transition-colors disabled:opacity-60"
            >
              {verifying && <Loader2 size={14} className="animate-spin" />}
              {verifying ? "Loading courses..." : "Verify & Load Courses"}
            </button>
          ) : (
            <button
              onClick={() => setShowCourseModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-blue-200 dark:border-blue-800 transition-colors"
            >
              {selectedIds.size}/{courses.length} courses selected — tap to change
            </button>
          )}

          {/* Save / Cancel */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60 transition-all"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Syncing courses (when locked) */}
      {locked && credentials.selected_canvas_courses && credentials.selected_canvas_courses.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Syncing {credentials.selected_canvas_courses.length} course{credentials.selected_canvas_courses.length !== 1 ? "s" : ""}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {credentials.selected_canvas_courses.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Course selection modal */}
      {showCourseModal && courses && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col animate-in">
            {/* Modal header */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Select courses ({selectedIds.size}/{courses.length})
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedIds(
                      selectedIds.size === courses.length
                        ? new Set()
                        : new Set(courses.map((c) => c.id))
                    )
                  }
                  className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
                >
                  {selectedIds.size === courses.length ? "Deselect all" : "Select all"}
                </button>
                <button
                  onClick={() => setShowCourseModal(false)}
                  className="p-1 text-subtle-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Course list */}
            <div className="flex-1 overflow-auto">
              {courses.map((course) => (
                <label
                  key={course.id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-accent transition-colors cursor-pointer border-b border-border-subtle last:border-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(course.id)}
                    onChange={() => toggleCourse(course.id)}
                    className="w-4 h-4 rounded accent-blue-500 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-foreground block truncate">{course.name}</span>
                    <span className="text-xs text-subtle-foreground block truncate">{course.course_code}</span>
                  </div>
                </label>
              ))}
              {courses.length === 0 && (
                <div className="px-5 py-8 text-sm text-subtle-foreground text-center">No active courses found.</div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-5 py-4 border-t border-border shrink-0">
              <button
                onClick={() => setShowCourseModal(false)}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
