"use client";

import { useState, useRef } from "react";
import { Eye, EyeOff, Lock, Pencil, Loader2 } from "lucide-react";
import type { IntegrationCredentials, CredentialsSavePayload } from "@/lib/types";

interface GradescopeCourse {
  id: string;
  name: string;
  shortName: string;
}

interface GradescopeSettingsProps {
  credentials: IntegrationCredentials;
  onUpdate: (updated: IntegrationCredentials) => void;
}

/**
 * Self-contained Gradescope settings section with Edit/Save/Cancel and course selection.
 * Locked by default. Edit unlocks credential fields and "Verify & Load Courses".
 *
 * @param credentials - Current integration credentials from parent
 * @param onUpdate - Callback with updated credentials after save
 */
export default function GradescopeSettings({ credentials, onUpdate }: GradescopeSettingsProps) {
  const [locked, setLocked] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [gradescopeEmail, setGradescopeEmail] = useState(credentials.gradescope_email ?? "");
  const [gradescopePassword, setGradescopePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [courses, setCourses] = useState<GradescopeCourse[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [verifying, setVerifying] = useState(false);

  const serverState = useRef({
    gradescopeEmail: credentials.gradescope_email ?? "",
  });

  /**
   * Verifies Gradescope credentials by fetching courses.
   * Uses form credentials if password is provided, otherwise stored credentials.
   * On success, shows course checkboxes with previous selections pre-checked.
   */
  async function handleVerify() {
    setVerifying(true);
    setError(null);
    try {
      const body: Record<string, string> = {};
      if (gradescopePassword.trim()) {
        body.email = gradescopeEmail.trim();
        body.password = gradescopePassword.trim();
      }
      const res = await fetch("/api/gradescope/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Verification failed");
      }
      const data = await res.json();
      const fetched: GradescopeCourse[] = data.courses;
      setCourses(fetched);
      const prevIds = new Set(credentials.selected_gradescope_courses?.map((c) => c.id) ?? []);
      setSelectedIds(prevIds.size > 0 ? prevIds : new Set(fetched.map((c) => c.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify");
    } finally {
      setVerifying(false);
    }
  }

  /** Toggles a single course's selected state. */
  function toggleCourse(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  /**
   * Saves Gradescope credentials and optionally course selection to the API.
   * Only includes password if the user entered a new one.
   * Only includes course selection if courses were loaded during this edit.
   */
  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    const payload: CredentialsSavePayload = {
      gradescope_email: gradescopeEmail || null,
    };
    if (gradescopePassword) {
      payload.gradescope_password = gradescopePassword;
    }
    if (courses) {
      payload.selected_gradescope_courses = courses
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
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      const updated: IntegrationCredentials = await res.json();
      onUpdate(updated);
      serverState.current.gradescopeEmail = updated.gradescope_email ?? "";
      setGradescopeEmail(updated.gradescope_email ?? "");
      setGradescopePassword("");
      setSuccess("Gradescope settings saved.");
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
    setGradescopeEmail(serverState.current.gradescopeEmail);
    setGradescopePassword("");
    setShowPassword(false);
    setCourses(null);
    setSelectedIds(new Set());
    setError(null);
    setSuccess(null);
    setLocked(true);
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-gray-800">Gradescope</h2>
        {locked && (
          <button
            onClick={() => { setLocked(false); setShowPassword(false); setSuccess(null); }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Pencil size={12} />
            Edit
          </button>
        )}
      </div>
      <p className="text-xs text-gray-400 mb-4">
        CalNet SSO users must set a Gradescope-specific password via{" "}
        <a
          href="https://www.gradescope.com/reset_password"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 underline"
        >
          Forgot Password
        </a>{" "}
        first.
      </p>

      {locked ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
            <Lock size={14} className="text-gray-400 shrink-0" />
            <span className="text-sm text-gray-500 truncate">
              {gradescopeEmail || "No email saved"}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
            <Lock size={14} className="text-gray-400 shrink-0" />
            <span className="text-sm text-gray-500">
              {credentials.has_gradescope_password ? "Password saved" : "No password saved"}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label htmlFor="gs-email" className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              id="gs-email"
              type="email"
              value={gradescopeEmail}
              onChange={(e) => setGradescopeEmail(e.target.value)}
              placeholder="your-email@berkeley.edu"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
            />
          </div>
          <div>
            <label htmlFor="gs-password" className="block text-sm font-medium text-gray-600 mb-1">
              Password
              {credentials.has_gradescope_password && (
                <span className="ml-2 text-xs text-emerald-500 font-normal">(saved)</span>
              )}
            </label>
            <div className="relative">
              <input
                id="gs-password"
                type={showPassword ? "text" : "password"}
                value={gradescopePassword}
                onChange={(e) => setGradescopePassword(e.target.value)}
                placeholder={
                  credentials.has_gradescope_password
                    ? "Leave blank to keep existing password"
                    : "Enter your Gradescope password"
                }
                className="w-full px-3 py-2 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Course management */}
          {!courses ? (
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-blue-500 hover:bg-blue-50 border border-blue-200 transition-colors disabled:opacity-60"
            >
              {verifying && <Loader2 size={14} className="animate-spin" />}
              {verifying ? "Loading courses..." : "Verify & Load Courses"}
            </button>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">
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
              <div className="max-h-48 overflow-auto rounded-xl border border-gray-100">
                {courses.map((course) => (
                  <label
                    key={course.id}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(course.id)}
                      onChange={() => toggleCourse(course.id)}
                      className="w-4 h-4 rounded accent-blue-500"
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
                  <div className="px-3 py-4 text-sm text-gray-400 text-center">No active courses found.</div>
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
              className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Syncing courses (when locked) */}
      {locked && credentials.selected_gradescope_courses && credentials.selected_gradescope_courses.length > 0 && (
        <div className="mt-3 p-3 bg-gray-50 rounded-xl">
          <p className="text-xs font-medium text-gray-500 mb-1">Syncing courses:</p>
          <p className="text-sm text-gray-700">
            {credentials.selected_gradescope_courses.map((c) => c.name).join(", ")}
          </p>
        </div>
      )}

      {error && <div className="mt-3 bg-red-50 text-red-500 text-sm p-3 rounded-xl">{error}</div>}
      {success && <div className="mt-3 bg-emerald-50 text-emerald-600 text-sm p-3 rounded-xl">{success}</div>}
    </section>
  );
}
