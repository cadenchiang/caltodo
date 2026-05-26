"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

/** Regex for validating a Pensieve calendar URL. */
const PENSIEVE_URL_REGEX = /^https:\/\/api\.pensieve\.co\/api\/calendar\/[^/]+\.ics$/;

/** Instruction steps for connecting Pensieve. */
const PENSIEVE_STEPS: Array<{ text: string; href?: string }> = [
  { text: "Log into Pensive", href: "https://www.pensieve.co" },
  { text: "Click on your profile (bottom left)" },
  { text: "Click on \"Enable Calendar URL\"" },
  { text: "Copy and paste the URL below" },
];

interface PensieveCourse {
  name: string;
}

interface PensieveStepProps {
  onNext: (payload: {
    pensieve_calendar_url: string;
    selected_pensieve_courses?: Array<{ id: string; name: string }>;
  }) => Promise<boolean>;
  onSkip: () => void;
  saving: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  /** Persisted draft URL from a previous visit to this step. */
  initialUrl?: string;
  /** Called on unmount to persist draft state across step navigation. */
  onDraftChange?: (draft: { url: string }) => void;
}

/**
 * Pensieve onboarding step with theme-aware styling.
 * Shows numbered instructions and a URL input, then course selection.
 * Validates the URL format client-side before fetching courses.
 *
 * @param onNext - Async callback to save credentials; returns true on success
 * @param onSkip - Callback to skip this step
 * @param saving - Whether a save operation is in progress
 * @param error - Current error message to display
 * @param setError - Callback to set/clear error messages
 */
export default function PensieveStep({ onNext, onSkip, saving, error, setError, initialUrl, onDraftChange }: PensieveStepProps) {
  const { showToast } = useToast();
  const [url, setUrl] = useState(initialUrl ?? "");
  const [urlInvalid, setUrlInvalid] = useState(false);
  const [courses, setCourses] = useState<PensieveCourse[] | null>(null);
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  const [loadingCourses, setLoadingCourses] = useState(false);

  /** Ref tracking latest URL for unmount draft reporting. */
  const draftRef = useRef({ url });
  useEffect(() => { draftRef.current = { url }; });
  /** Reports draft state to parent on unmount so it persists across step navigation. */
  useEffect(() => {
    return () => { onDraftChange?.(draftRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Validates the URL, fetches courses for selection, then saves.
   * If courses are already loaded, saves the selection and advances.
   */
  async function handleSaveAndNext() {
    const trimmed = url.trim();
    if (!trimmed) {
      setUrlInvalid(true);
      showToast("Please enter your Pensive calendar URL.", { variant: "error", duration: 4000 });
      return;
    }
    if (!PENSIEVE_URL_REGEX.test(trimmed)) {
      setUrlInvalid(true);
      showToast("Invalid Pensive URL. It should start with https://api.pensieve.co/api/calendar/", { variant: "error", duration: 4000 });
      return;
    }
    setUrlInvalid(false);
    setError(null);

    // If courses already loaded, save selection and advance
    if (courses) {
      const selected = courses
        .filter((c) => selectedNames.has(c.name))
        .map((c) => ({ id: c.name, name: c.name }));
      await onNext({
        pensieve_calendar_url: trimmed,
        selected_pensieve_courses: selected,
      });
      return;
    }

    // Fetch course preview from the iCal feed
    setLoadingCourses(true);
    try {
      const res = await fetch("/api/pensieve/ical-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to load feed: ${res.status}`);
      }
      const data = await res.json();
      if (data.courses.length === 0) {
        // No courses found — save without selection
        await onNext({ pensieve_calendar_url: trimmed });
        return;
      }
      setCourses(data.courses);
      setSelectedNames(new Set());
    } catch (err) {
      if (err instanceof TypeError) {
        showToast("Network error. Check your connection.", { variant: "error", duration: 4000 });
      } else {
        showToast(err instanceof Error ? err.message : String(err), { variant: "error", duration: 4000 });
      }
    } finally {
      setLoadingCourses(false);
    }
  }

  /**
   * Toggles a course's selected state by name.
   */
  function toggleCourse(name: string) {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <img src="/pensieve-logo.png" alt="Pensive" width={22} height={22} className="shrink-0" />
        <h2 className="text-lg font-bold text-foreground animate-drop-in">Pensive</h2>
      </div>

      {/* URL input step */}
      {!courses && (
        <>
          {/* Numbered instruction steps */}
          <div className="animate-drop-in delay-100">
            <div className="flex flex-col gap-1 mb-4 text-left">
              {PENSIEVE_STEPS.map((step, i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-2">
                  <span className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  {step.href ? (
                    <span className="text-sm font-medium text-foreground">
                      Log into{" "}
                      <a
                        href={step.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                      >
                        Pensive
                      </a>
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-foreground">{step.text}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* URL input */}
          <div className="mb-5 animate-drop-in delay-200">
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (urlInvalid) setUrlInvalid(false);
              }}
              placeholder="https://api.pensieve.co/api/calendar/...ics"
              autoComplete="off"
              name="pensieve-url-nofill"
              className={`w-full px-3 py-2.5 rounded-xl border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none transition-colors ${
                urlInvalid
                  ? "border-red-500 focus:border-red-500"
                  : "border-foreground/20 focus:border-foreground/50"
              }`}
            />
          </div>

          {/* Action button */}
          <div className="animate-drop-in delay-300">
            <button
              onClick={handleSaveAndNext}
              disabled={saving || loadingCourses || !url.trim()}
              className={`w-full px-5 py-2.5 rounded-full text-sm font-semibold border border-transparent flex items-center justify-center gap-2 transition-colors ${
                !url.trim()
                  ? "bg-[#D1D1D6] dark:bg-[#3A3A3C] text-white/70 dark:text-white/40 cursor-not-allowed"
                  : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 disabled:opacity-50"
              }`}
            >
              {loadingCourses && <Loader2 size={14} className="animate-spin" />}
              {loadingCourses ? "Loading courses..." : saving ? "Saving..." : "Connect"}
            </button>
          </div>
        </>
      )}

      {/* Course selection step */}
      {courses && (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground">
                Select Courses to Sync ({selectedNames.size}/{courses.length})
              </p>
              <button
                type="button"
                onClick={() => {
                  if (selectedNames.size === courses.length) {
                    setSelectedNames(new Set());
                  } else {
                    setSelectedNames(new Set(courses.map((c) => c.name)));
                  }
                }}
                className="text-xs font-medium text-[#0e89d6] hover:text-[#3D8FE8] transition-colors"
              >
                {selectedNames.size === courses.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-80 overflow-auto -mx-1 px-1 py-1">
              {courses.map((course) => {
                const selected = selectedNames.has(course.name);
                return (
                  <button
                    key={course.name}
                    type="button"
                    onClick={() => toggleCourse(course.name)}
                    className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl bg-white dark:bg-[#2a2a2c] text-foreground border-2 transition-colors duration-150 focus:outline-none ${
                      selected ? "border-[#0e89d6]" : "border-transparent hover:border-[#0e89d6]/30"
                    }`}
                  >
                    <span className="flex-1 min-w-0 text-sm font-semibold text-foreground truncate">{course.name}</span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      selected ? "bg-[#0e89d6]" : "border border-muted-foreground/30"
                    }`}>
                      {selected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleSaveAndNext}
            disabled={saving}
            className="w-full px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-semibold disabled:opacity-50 btn-elevated-primary"
          >
            {saving ? "Saving..." : selectedNames.size > 0 ? "Save & Next" : "Next"}
          </button>
        </>
      )}
    </div>
  );
}
