"use client";

/**
 * Google Classroom integration card.
 *
 * Classroom rides on the Google Calendar OAuth grant, so there is no separate
 * connect flow — but holding the scope is not consent to sync, so coursework
 * stays off until the user turns it on here and picks their classes.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { ChevronDown, Check, RefreshCw } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useCredentials } from "@/components/settings/IntegrationSettings";

/** A Classroom course as returned by /api/classroom. */
interface ClassroomCourse {
  id: string;
  name: string;
}

/** Shape of the course listing response. */
interface CoursesResponse {
  courses?: ClassroomCourse[];
  error?: string;
  needsReconnect?: boolean;
  needsGoogle?: boolean;
}

/**
 * Fetches the course list, preserving the API's guidance on failure.
 *
 * @param url - Endpoint to read
 * @returns Parsed body, including the needsReconnect/needsGoogle hints
 * @throws Error carrying the API's message, tagged with the hint flags
 */
async function fetchCourses(url: string): Promise<CoursesResponse> {
  const res = await fetch(url);
  const body = (await res.json().catch(() => ({}))) as CoursesResponse;
  if (!res.ok) {
    const err = new Error(body.error || "Failed to load Classroom courses") as Error & {
      needsReconnect?: boolean;
      needsGoogle?: boolean;
    };
    err.needsReconnect = body.needsReconnect;
    err.needsGoogle = body.needsGoogle;
    throw err;
  }
  return body;
}

export default function GoogleClassroomSettings() {
  const router = useRouter();
  const { showToast } = useToast();
  const { credentials, refresh } = useCredentials();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const enabled = credentials.classroom_enabled === true;
  const selected = credentials.selected_classroom_courses ?? null;

  // Only ask Google for courses once the user has opened the card and turned
  // the integration on — no point spending a round trip otherwise.
  const { data, error, isLoading } = useSWR<CoursesResponse>(
    open && enabled ? "/api/classroom" : null,
    fetchCourses
  );

  const courses = data?.courses ?? [];
  const selectedIds = new Set((selected ?? []).map((c) => c.id));
  const fetchError = error as (Error & { needsReconnect?: boolean }) | undefined;

  /**
   * Saves a change to the integration.
   *
   * @param patch - Fields to persist
   */
  async function save(patch: { enabled?: boolean; courses?: ClassroomCourse[] }) {
    setSaving(true);
    try {
      const res = await fetch("/api/classroom", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to save");
      }
      await refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save Classroom settings");
    } finally {
      setSaving(false);
    }
  }

  /** Toggles one course in the selection. */
  function toggleCourse(course: ClassroomCourse) {
    const next = selectedIds.has(course.id)
      ? (selected ?? []).filter((c) => c.id !== course.id)
      : [...(selected ?? []), course];
    void save({ courses: next });
  }

  const subtitle = !enabled
    ? "Coursework and due dates"
    : selected === null
      ? "All classes"
      : `${selected.length} class${selected.length === 1 ? "" : "es"}`;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm dark:shadow-none overflow-hidden">
      <div
        onClick={() => { if (enabled) setOpen((v) => !v); }}
        className={`w-full flex items-center gap-2.5 sm:gap-3.5 px-3 sm:px-4 py-3.5 text-left transition-colors ${
          enabled ? "hover:bg-muted/40 cursor-pointer" : ""
        }`}
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <img src="/classroom-logo.png" alt="" className="w-6 h-6 object-contain" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground whitespace-nowrap">
            Google Classroom
          </p>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        </div>

        {enabled ? (
          <>
            <span className="hidden sm:inline text-xs font-medium px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
              Connected
            </span>
            <ChevronDown
              size={16}
              className={`text-muted-foreground shrink-0 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </>
        ) : (
          <button
            onClick={() => router.push("/app/onboarding?setup=classroom")}
            className="text-xs font-semibold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors shrink-0 cursor-pointer"
          >
            Connect
          </button>
        )}
      </div>

      <div
        className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="overflow-hidden">
          <div className="px-3 sm:px-4 pb-4 space-y-4 border-t border-border pt-4">
            {enabled && (
              <div>
                <p className="text-xs font-medium text-foreground mb-1.5">Classes</p>

                {isLoading ? (
                  <p className="text-xs text-muted-foreground py-2">Loading your classes…</p>
                ) : fetchError ? (
                  <div className="text-xs py-2">
                    <p className="text-red-500 mb-1.5">{fetchError.message}</p>
                    {fetchError.needsReconnect && (
                      <a
                        href="/api/gcal/auth?classroom=1"
                        className="inline-flex items-center gap-1.5 font-medium text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <RefreshCw size={12} />
                        Reconnect Google to allow Classroom
                      </a>
                    )}
                  </div>
                ) : courses.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">
                    No active classes found in Google Classroom.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {courses.map((course) => {
                      // null selection means "not chosen yet", which syncs everything.
                      const isOn = selected === null || selectedIds.has(course.id);
                      return (
                        <li key={course.id}>
                          <button
                            type="button"
                            onClick={() => toggleCourse(course)}
                            disabled={saving}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border bg-background hover:border-input-border transition-colors text-left cursor-pointer disabled:opacity-60"
                          >
                            <span
                              className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                                isOn
                                  ? "bg-blue-500 border-blue-500"
                                  : "border-input-border"
                              }`}
                            >
                              {isOn && <Check size={11} className="text-white" />}
                            </span>
                            <span className="text-sm text-foreground truncate">
                              {course.name}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            <button
              onClick={() => void save({ enabled: false })}
              disabled={saving}
              className="text-xs font-medium text-muted-foreground hover:text-red-500 transition-colors cursor-pointer disabled:opacity-60"
            >
              Turn off Classroom sync
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
