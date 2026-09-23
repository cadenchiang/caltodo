"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useToast } from "@/contexts/ToastContext";
import Button from "@/components/ui/Button";
import CanvasFeedForm, { MODE_SWITCH_LINK } from "@/components/onboarding/CanvasFeedForm";
import CanvasTokenForm from "@/components/onboarding/CanvasTokenForm";
import CoursePicker from "@/components/onboarding/CoursePicker";
import { baseUrlFromHost, normalizeCanvasHost } from "@/components/onboarding/HostField";
import { StepHeading } from "@/components/onboarding/StepChrome";
import { CLASS_NOUN_PLURAL } from "@/lib/copy";

interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
}

interface ICalCourse {
  name: string;
}

/**
 * Generates a stable positive numeric ID from a course name (djb2), for
 * feed courses that have no Canvas numeric id.
 *
 * @param name - Course name
 * @returns Positive 32-bit integer derived from the name
 */
export function stableIdFromName(name: string): number {
  let hash = 5381;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) + hash + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Draft the step reports on unmount so navigating back restores it. */
export interface CanvasDraft {
  token: string;
  /** Full https base URL, "" when no host has been entered. */
  baseUrl: string;
  courses: CanvasCourse[] | null;
  selectedIds: number[];
  icalUrl: string;
  icalCourses: ICalCourse[] | null;
  icalSelectedNames: string[];
  mode: "ical" | "api";
}

interface CanvasStepProps {
  onNext: (payload: {
    canvas_token?: string;
    canvas_base_url?: string;
    canvas_ical_url?: string;
    selected_canvas_courses?: Array<{ id: number; name: string }>;
  }) => Promise<boolean>;
  onSkip: () => void;
  saving: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  initialToken?: string;
  initialBaseUrl?: string;
  initialCourses?: CanvasCourse[] | null;
  initialSelectedIds?: number[];
  initialIcalUrl?: string;
  initialIcalCourses?: ICalCourse[] | null;
  initialIcalSelectedNames?: string[];
  initialMode?: "ical" | "api";
  /** Canvas host for the school picked earlier, used when the draft has none. */
  schoolCanvasHost?: string;
  onDraftChange?: (draft: CanvasDraft) => void;
}

/**
 * Canvas onboarding step. Default mode pastes the calendar feed URL; the
 * advanced mode takes the school's Canvas host plus an API token and then
 * offers a class picker.
 *
 * @param schoolCanvasHost - Prefills the host field from the school step
 * @param initialBaseUrl - Draft base URL; its host wins over schoolCanvasHost
 */
export default function CanvasStep({
  onNext, saving, setError,
  initialToken, initialBaseUrl, initialCourses, initialSelectedIds,
  initialIcalUrl, initialIcalCourses, initialIcalSelectedNames, initialMode,
  schoolCanvasHost, onDraftChange,
}: CanvasStepProps) {
  const { showToast } = useToast();
  const [mode, setMode] = useState<"ical" | "api">(initialMode ?? "ical");

  const [icalUrl, setIcalUrl] = useState(initialIcalUrl ?? "");
  const [icalCourses, setIcalCourses] = useState<ICalCourse[] | null>(initialIcalCourses ?? null);
  const [icalSelectedNames, setIcalSelectedNames] = useState<Set<string>>(new Set(initialIcalSelectedNames ?? []));
  const [icalLoading, setIcalLoading] = useState(false);

  const [token, setToken] = useState(initialToken ?? "");
  const [host, setHost] = useState(() => normalizeCanvasHost(initialBaseUrl ?? "") || schoolCanvasHost || "");
  const [verifying, setVerifying] = useState(false);
  const [courses, setCourses] = useState<CanvasCourse[] | null>(initialCourses ?? null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set(initialSelectedIds ?? []));

  const draftRef = useRef<CanvasDraft>({
    token, baseUrl: baseUrlFromHost(host), courses, selectedIds: [], icalUrl, icalCourses, icalSelectedNames: [], mode,
  });
  useEffect(() => {
    draftRef.current = {
      token,
      baseUrl: baseUrlFromHost(host),
      courses,
      selectedIds: Array.from(selectedIds),
      icalUrl,
      icalCourses,
      icalSelectedNames: Array.from(icalSelectedNames),
      mode,
    };
  });
  useEffect(() => {
    return () => { onDraftChange?.(draftRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Surfaces a validation problem as an error toast. */
  function warn(message: string) {
    showToast(message, { variant: "error", duration: 4000 });
  }

  /** Reports a fetch failure: network errors get a friendlier line. */
  function reportFailure(err: unknown) {
    if (err instanceof TypeError) warn("Network error. Check your connection.");
    else warn(err instanceof Error ? err.message : String(err));
  }

  /** Loads class names from the feed so the user can pick which to sync. */
  async function loadFeedCourses() {
    setError(null);
    setIcalLoading(true);
    try {
      const res = await fetch("/api/canvas/ical-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: icalUrl.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to load feed: ${res.status}`);
      }
      const data = await res.json();
      setIcalCourses(data.courses);
      setIcalSelectedNames(new Set());
    } catch (err) {
      reportFailure(err);
    } finally {
      setIcalLoading(false);
    }
  }

  /** Saves the feed URL and the picked classes. */
  async function saveFeed(e: FormEvent) {
    e.preventDefault();
    if (!icalCourses) return;
    const selected = icalCourses
      .filter((c) => icalSelectedNames.has(c.name))
      .map((c) => ({ id: stableIdFromName(c.name), name: c.name }));
    await onNext({ canvas_ical_url: icalUrl.trim(), selected_canvas_courses: selected });
  }

  /** Verifies the token against the host by listing courses. */
  async function verifyToken() {
    setVerifying(true);
    setError(null);
    try {
      // The token goes in the body, never the URL, so it cannot be logged.
      const res = await fetch("/api/canvas/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), base_url: baseUrlFromHost(host) }),
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid access token.");
        if (res.status >= 500) throw new Error("Server error. Please try again later.");
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Verification failed: ${res.status}`);
      }
      const data = await res.json();
      setCourses(data.courses);
      setSelectedIds(new Set());
    } catch (err) {
      reportFailure(err);
    } finally {
      setVerifying(false);
    }
  }

  /** Saves the token, host and picked classes. */
  async function saveToken(e: FormEvent) {
    e.preventDefault();
    if (!courses) return;
    const selected = courses.filter((c) => selectedIds.has(c.id)).map((c) => ({ id: c.id, name: c.name }));
    await onNext({ canvas_token: token.trim(), canvas_base_url: baseUrlFromHost(host), selected_canvas_courses: selected });
  }

  const toggleIn = <T,>(set: (fn: (prev: Set<T>) => Set<T>) => void) => (id: T) =>
    set((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div>
      <StepHeading provider="canvas" />

      {mode === "ical" && !icalCourses && (
        <CanvasFeedForm
          url={icalUrl}
          onUrlChange={setIcalUrl}
          onSubmit={loadFeedCourses}
          onInvalid={warn}
          loading={icalLoading}
          saving={saving}
          onUseToken={() => { setMode("api"); setError(null); }}
        />
      )}

      {mode === "ical" && icalCourses && (
        <form onSubmit={saveFeed} noValidate>
          <CoursePicker
            courses={icalCourses.map((c) => ({ id: c.name, name: c.name }))}
            selectedIds={icalSelectedNames}
            onToggle={toggleIn(setIcalSelectedNames)}
            onSetSelection={(ids) => setIcalSelectedNames(new Set(ids))}
            emptyState={
              <div className="px-3 py-4 bg-card rounded-xl">
                <p className="text-sm text-foreground font-semibold mb-2">No {CLASS_NOUN_PLURAL} found in your calendar feed.</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This usually means no assignments have been posted yet. You can continue and pick {CLASS_NOUN_PLURAL} later in Settings.
                </p>
              </div>
            }
          />
          <Button type="submit" variant="inverted" size="lg" className="w-full" loading={saving}>
            {saving ? "Saving..." : icalSelectedNames.size > 0 ? "Save and continue" : "Continue"}
          </Button>
        </form>
      )}

      {mode === "api" && !courses && (
        <>
          <CanvasTokenForm
            host={host}
            onHostChange={setHost}
            token={token}
            onTokenChange={setToken}
            onSubmit={verifyToken}
            onInvalid={warn}
            verifying={verifying}
            saving={saving}
          />
          <div className="text-center">
            <button type="button" onClick={() => { setMode("ical"); setError(null); }} className={MODE_SWITCH_LINK}>
              Use the calendar feed instead (easier)
            </button>
          </div>
        </>
      )}

      {mode === "api" && courses && (
        <form onSubmit={saveToken} noValidate>
          <CoursePicker
            courses={courses.map((c) => ({ id: c.id, name: c.name, detail: c.course_code }))}
            selectedIds={selectedIds}
            onToggle={toggleIn(setSelectedIds)}
            onSetSelection={(ids) => setSelectedIds(new Set(ids))}
            emptyState={<p className="px-3 py-4 text-sm text-muted-foreground text-center">No active {CLASS_NOUN_PLURAL} found.</p>}
          />
          <Button type="submit" variant="inverted" size="lg" className="w-full" loading={saving}>
            {saving ? "Saving..." : selectedIds.size > 0 ? "Save and continue" : "Continue"}
          </Button>
        </form>
      )}
    </div>
  );
}
