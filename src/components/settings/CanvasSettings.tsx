"use client";

import { useState, useRef } from "react";
import { Eye, EyeOff, Lock, Pencil, Loader2 } from "lucide-react";
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
 * Self-contained Canvas settings section with Edit/Save/Cancel and course selection.
 * Locked by default. Edit unlocks credential fields and "Verify & Load Courses".
 *
 * @param credentials - Current integration credentials from parent
 * @param onUpdate - Callback with updated credentials after save
 */
export default function CanvasSettings({ credentials, onUpdate }: CanvasSettingsProps) {
  const [locked, setLocked] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [canvasToken, setCanvasToken] = useState(credentials.canvas_token ?? "");
  const [canvasBaseUrl, setCanvasBaseUrl] = useState(credentials.canvas_base_url);
  const [showToken, setShowToken] = useState(false);

  const [courses, setCourses] = useState<CanvasCourse[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [verifying, setVerifying] = useState(false);

  const serverState = useRef({
    canvasToken: credentials.canvas_token ?? "",
    canvasBaseUrl: credentials.canvas_base_url,
  });

  /**
   * Verifies the Canvas token by fetching courses from the Canvas API.
   * On success, shows course checkboxes with previous selections pre-checked.
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
        throw new Error(body.error || "Verification failed");
      }
      const data = await res.json();
      const fetched: CanvasCourse[] = data.courses;
      setCourses(fetched);
      const prevIds = new Set(credentials.selected_canvas_courses?.map((c) => c.id) ?? []);
      setSelectedIds(prevIds.size > 0 ? prevIds : new Set(fetched.map((c) => c.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify");
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
    setError(null);
    setSuccess(null);
    const payload: CredentialsSavePayload = {
      canvas_token: canvasToken || null,
      canvas_base_url: canvasBaseUrl,
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
      setSuccess("Canvas settings saved.");
      setLocked(true);
      setCourses(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
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
    setError(null);
    setSuccess(null);
    setLocked(true);
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-foreground">bCourses (Canvas)</h2>
        {locked && (
          <button
            onClick={() => { setLocked(false); setShowToken(false); setSuccess(null); }}
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
                placeholder="Paste your Canvas access token"
                className="w-full px-3 py-2 pr-10 rounded-xl border border-input-border text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-blue-400 transition-all"
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
              Canvas URL
            </label>
            <input
              id="canvas-url"
              type="text"
              value={canvasBaseUrl}
              onChange={(e) => setCanvasBaseUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-input-border text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-blue-400 transition-all"
            />
          </div>

          {/* Course management */}
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
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-secondary-foreground">
                  Select courses ({selectedIds.size}/{courses.length})
                </p>
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
              </div>
              <div className="max-h-48 overflow-auto rounded-xl border border-border">
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
                  <div className="px-3 py-4 text-sm text-subtle-foreground text-center">No active courses found.</div>
                )}
              </div>
            </div>
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
        <div className="mt-3 p-3 bg-muted rounded-xl">
          <p className="text-xs font-medium text-muted-foreground mb-1">Syncing courses:</p>
          <p className="text-sm text-secondary-foreground">
            {credentials.selected_canvas_courses.map((c) => c.name).join(", ")}
          </p>
        </div>
      )}

      {error && <div className="mt-3 bg-red-50 dark:bg-red-900/20 text-red-500 text-sm p-3 rounded-xl">{error}</div>}
      {success && <div className="mt-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-sm p-3 rounded-xl">{success}</div>}
    </section>
  );
}
