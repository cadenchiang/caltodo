"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useToast } from "@/contexts/ToastContext";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import CoursePicker from "@/components/onboarding/CoursePicker";
import { NumberedSteps, STEP_LINK, StepHeading } from "@/components/onboarding/StepChrome";
import { PROVIDER_LABELS } from "@/lib/copy";

/** Regex for validating a Pensive calendar URL. */
export const PENSIEVE_URL_REGEX = /^https:\/\/api\.pensieve\.co\/api\/calendar\/[^/]+\.ics$/;

/**
 * Validates a Pensive calendar URL.
 *
 * @param url - Raw text from the field
 * @returns An error message, or null when the URL is usable
 */
export function validatePensieveUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return `Please enter your ${PROVIDER_LABELS.pensieve} calendar URL.`;
  if (!PENSIEVE_URL_REGEX.test(trimmed)) {
    return `That ${PROVIDER_LABELS.pensieve} URL does not look right. It should start with https://api.pensieve.co/api/calendar/`;
  }
  return null;
}

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
 * Pensive onboarding step: numbered instructions, a labeled URL field, then
 * a class picker. Validates the URL format before fetching classes.
 *
 * @param onNext - Saves the URL and selection; resolves true on success
 * @param saving - Whether the parent is saving
 * @param initialUrl - Draft URL from an earlier visit
 */
export default function PensieveStep({ onNext, saving, setError, initialUrl, onDraftChange }: PensieveStepProps) {
  const { showToast } = useToast();
  const [url, setUrl] = useState(initialUrl ?? "");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [courses, setCourses] = useState<PensieveCourse[] | null>(null);
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  const [loadingCourses, setLoadingCourses] = useState(false);

  const draftRef = useRef({ url });
  useEffect(() => { draftRef.current = { url }; });
  useEffect(() => {
    return () => { onDraftChange?.(draftRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Validates the URL and loads classes, or saves the selection once loaded. */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    const problem = validatePensieveUrl(trimmed);
    if (problem) {
      setUrlError(problem);
      return;
    }
    setUrlError(null);
    setError(null);

    if (courses) {
      const selected = courses.filter((c) => selectedNames.has(c.name)).map((c) => ({ id: c.name, name: c.name }));
      await onNext({ pensieve_calendar_url: trimmed, selected_pensieve_courses: selected });
      return;
    }

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
        // Nothing to pick from: save the URL and move on.
        await onNext({ pensieve_calendar_url: trimmed });
        return;
      }
      setCourses(data.courses);
      setSelectedNames(new Set());
    } catch (err) {
      if (err instanceof TypeError) showToast("Network error. Check your connection.", { variant: "error", duration: 4000 });
      else showToast(err instanceof Error ? err.message : String(err), { variant: "error", duration: 4000 });
    } finally {
      setLoadingCourses(false);
    }
  }

  function toggleCourse(name: string) {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  const steps = [
    <>
      Sign in to{" "}
      <a href="https://www.pensieve.co" target="_blank" rel="noopener noreferrer" className={STEP_LINK}>
        {PROVIDER_LABELS.pensieve}
      </a>
    </>,
    "Click your profile (bottom left)",
    'Click "Enable calendar URL"',
    "Copy the URL and paste it below",
  ];

  return (
    <form onSubmit={handleSubmit} noValidate>
      <StepHeading provider="pensieve" />

      {!courses && (
        <>
          <NumberedSteps steps={steps} />
          <div className="mb-5">
            <TextField
              label="Calendar URL"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (urlError) setUrlError(null);
              }}
              error={urlError}
              placeholder="https://api.pensieve.co/api/calendar/...ics"
              autoComplete="off"
              name="pensieve-url-nofill"
            />
          </div>
          <Button type="submit" variant="inverted" size="lg" className="w-full" loading={loadingCourses || saving} disabled={!url.trim()}>
            {loadingCourses ? "Loading classes..." : saving ? "Saving..." : "Connect"}
          </Button>
        </>
      )}

      {courses && (
        <>
          <CoursePicker
            courses={courses.map((c) => ({ id: c.name, name: c.name }))}
            selectedIds={selectedNames}
            onToggle={toggleCourse}
            onSetSelection={(ids) => setSelectedNames(new Set(ids))}
          />
          <Button type="submit" variant="inverted" size="lg" className="w-full" loading={saving}>
            {saving ? "Saving..." : selectedNames.size > 0 ? "Save and continue" : "Continue"}
          </Button>
        </>
      )}
    </form>
  );
}
