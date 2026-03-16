"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

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
  const [url, setUrl] = useState(initialUrl ?? "");
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
      setError("Please enter your Pensive calendar URL.");
      return;
    }
    if (!PENSIEVE_URL_REGEX.test(trimmed)) {
      setError("Invalid Pensive URL. It should look like https://api.pensieve.co/api/calendar/...ics");
      return;
    }
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
      setSelectedNames(new Set(data.courses.map((c: PensieveCourse) => c.name)));
    } catch (err) {
      if (err instanceof TypeError) {
        setError("Network error. Check your connection.");
      } else {
        setError(err instanceof Error ? err.message : String(err));
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
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.pensieve.co/api/calendar/...ics"
              autoComplete="off"
              name="pensieve-url-nofill"
              className="w-full px-3 py-2.5 rounded-xl border border-foreground/20 bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors"
            />
          </div>

          {/* Action button */}
          <div className="animate-drop-in delay-300">
            <button
              onClick={handleSaveAndNext}
              disabled={saving || loadingCourses}
              className="w-full px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 btn-elevated-primary"
            >
              {loadingCourses && <Loader2 size={14} className="animate-spin" />}
              {loadingCourses ? "loading courses..." : saving ? "saving..." : "connect"}
            </button>
          </div>
        </>
      )}

      {/* Course selection step */}
      {courses && (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">
                select courses to sync ({selectedNames.size}/{courses.length})
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
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors duration-100"
              >
                {selectedNames.size === courses.length ? "deselect all" : "select all"}
              </button>
            </div>
            <div className="max-h-80 overflow-auto rounded-xl border border-border">
              {courses.map((course) => (
                <label
                  key={course.name}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent transition-colors duration-100 cursor-pointer border-b border-border last:border-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedNames.has(course.name)}
                    onChange={() => toggleCourse(course.name)}
                    className="w-4 h-4 rounded accent-foreground"
                  />
                  <span className="text-sm text-foreground truncate">{course.name}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveAndNext}
            disabled={saving}
            className="w-full px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold disabled:opacity-50 btn-elevated-primary"
          >
            {saving ? "saving..." : selectedNames.size > 0 ? "save & next" : "next"}
          </button>
        </>
      )}
    </div>
  );
}
