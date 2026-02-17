"use client";

import { useState, useRef } from "react";
import { Eye, EyeOff, Lock, Pencil, Loader2, Play, Check } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import CourseSelectModal from "@/components/ui/CourseSelectModal";
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
 * Self-contained Gradescope settings section with Edit/Save/Cancel and course selection modal.
 * Locked by default. Edit unlocks credential fields and "Verify & Load Courses".
 * Course selection opens as a full-screen modal for easier browsing.
 *
 * @param credentials - Current integration credentials from parent
 * @param onUpdate - Callback with updated credentials after save
 */
export default function GradescopeSettings({ credentials, onUpdate }: GradescopeSettingsProps) {
  const { showToast } = useToast();
  const [locked, setLocked] = useState(true);
  const [saving, setSaving] = useState(false);

  const [gradescopeEmail, setGradescopeEmail] = useState(credentials.gradescope_email ?? "");
  const [gradescopePassword, setGradescopePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [courses, setCourses] = useState<GradescopeCourse[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [verifying, setVerifying] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [coursesFromSaved, setCoursesFromSaved] = useState(false);
  const [videoExpanded, setVideoExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const serverState = useRef({
    gradescopeEmail: credentials.gradescope_email ?? "",
  });

  /**
   * Verifies Gradescope credentials by fetching courses.
   * Uses form credentials if password is provided, otherwise stored credentials.
   * On success, opens the course selection modal with previous selections pre-checked.
   */
  async function handleVerify() {
    setVerifying(true);
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
      setCoursesFromSaved(false);
      const prevIds = new Set(credentials.selected_gradescope_courses?.map((c) => c.id) ?? []);
      setSelectedIds(prevIds.size > 0 ? prevIds : new Set(fetched.map((c) => c.id)));
      setShowCourseModal(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to verify");
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
      showToast("Gradescope settings saved.");
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
    setGradescopeEmail(serverState.current.gradescopeEmail);
    setGradescopePassword("");
    setShowPassword(false);
    setCourses(null);
    setSelectedIds(new Set());
    setCoursesFromSaved(false);
    setLocked(true);
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-foreground">Gradescope</h2>
        {locked && (
          <button
            onClick={() => {
              setLocked(false);
              setShowPassword(false);
              // Pre-load saved courses for immediate summary display
              if (credentials.selected_gradescope_courses && credentials.selected_gradescope_courses.length > 0) {
                const saved = credentials.selected_gradescope_courses;
                setCourses(saved.map((c) => ({ id: c.id, name: c.name, shortName: "" })));
                setSelectedIds(new Set(saved.map((c) => c.id)));
                setCoursesFromSaved(true);
              }
            }}
            className="flex items-center gap-1.5 text-xs text-subtle-foreground hover:text-secondary-foreground transition-colors"
          >
            <Pencil size={12} />
            Edit
          </button>
        )}
      </div>
      <p className="text-xs text-subtle-foreground mb-4">
        If you use CalNet SSO, you&apos;ll need to create a Gradescope-specific password first.
        Go to{" "}
        <a
          href="https://www.gradescope.com/reset_password"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 underline"
        >
          Reset Password
        </a>{" "}
        and enter your Berkeley email — this won&apos;t affect your CalNet login.
      </p>

      {/* Video tutorial with smooth expand/collapse */}
      <div className="mb-4">
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
              className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 active:scale-[0.98] transition-all duration-150"
            >
              <Play size={14} />
              watch how to sign in
            </button>
          </div>
        </div>

        <div
          className="grid overflow-hidden transition-[grid-template-rows,opacity] duration-500"
          style={{
            gridTemplateRows: videoExpanded ? "1fr" : "0fr",
            opacity: videoExpanded ? 1 : 0,
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
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              hide video
            </button>
          </div>
        </div>
      </div>

      {locked ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-muted rounded-xl border border-border">
            <Lock size={14} className="text-subtle-foreground shrink-0" />
            <span className="text-sm text-muted-foreground truncate flex-1">
              {gradescopeEmail || "No email saved"}
            </span>
            {gradescopeEmail && <Check size={14} className="text-emerald-500 shrink-0" />}
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5 bg-muted rounded-xl border border-border">
            <Lock size={14} className="text-subtle-foreground shrink-0" />
            <span className="text-sm text-muted-foreground flex-1">
              {credentials.has_gradescope_password ? "••••••••••••" : "No password saved"}
            </span>
            {credentials.has_gradescope_password && <Check size={14} className="text-emerald-500 shrink-0" />}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label htmlFor="gs-email" className="block text-sm font-medium text-secondary-foreground mb-1">
              Email
            </label>
            <input
              id="gs-email"
              type="email"
              value={gradescopeEmail}
              onChange={(e) => setGradescopeEmail(e.target.value)}
              placeholder="your-email@berkeley.edu"
              className="w-full px-3 py-2 rounded-xl border border-input-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-blue-400 transition-all"
            />
          </div>
          <div>
            <label htmlFor="gs-password" className="block text-sm font-medium text-secondary-foreground mb-1">
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
                className="w-full px-3 py-2 pr-10 rounded-xl border border-input-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-blue-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-subtle-foreground hover:text-secondary-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
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
              onClick={() => {
                // If courses were pre-loaded from saved state, fetch full list from API
                if (coursesFromSaved) {
                  handleVerify();
                } else {
                  setShowCourseModal(true);
                }
              }}
              disabled={verifying}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-blue-200 dark:border-blue-800 transition-colors disabled:opacity-60"
            >
              {verifying && <Loader2 size={14} className="animate-spin" />}
              {verifying ? "Loading courses..." : `${selectedIds.size}/${courses.length} courses selected — tap to change`}
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
      {locked && credentials.selected_gradescope_courses && credentials.selected_gradescope_courses.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Syncing {credentials.selected_gradescope_courses.length} course{credentials.selected_gradescope_courses.length !== 1 ? "s" : ""}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {credentials.selected_gradescope_courses.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300"
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Course selection modal */}
      {courses && (
        <CourseSelectModal
          open={showCourseModal}
          onClose={() => setShowCourseModal(false)}
          title="Select Gradescope Courses"
          courses={courses.map((c) => ({ id: c.id, name: c.name, subtitle: c.shortName }))}
          selectedIds={selectedIds}
          onToggle={toggleCourse}
          onSelectAll={() => setSelectedIds(new Set(courses.map((c) => c.id)))}
          onDeselectAll={() => setSelectedIds(new Set())}
        />
      )}
    </section>
  );
}
