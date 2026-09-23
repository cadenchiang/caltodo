"use client";

import { useState, type FormEvent } from "react";
import { useToast } from "@/contexts/ToastContext";
import Button from "@/components/ui/Button";
import CanvasFeedForm, { MODE_SWITCH_LINK } from "@/components/onboarding/CanvasFeedForm";
import CanvasTokenForm from "@/components/onboarding/CanvasTokenForm";
import CoursePicker from "@/components/onboarding/CoursePicker";
import { baseUrlFromHost } from "@/components/onboarding/HostField";
import { StepHeading } from "@/components/onboarding/StepChrome";
import { ACTIONS, CLASS_NOUN_PLURAL } from "@/lib/copy";

interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
}

interface AddCanvasStepProps {
  onNext: (payload: {
    label: string;
    base_url: string;
    token?: string;
    ical_url?: string;
    selected_courses?: Array<{ id: number; name: string }>;
  }) => Promise<boolean>;
  onSkip: () => void;
  saving: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

/**
 * Derives an account label from a base URL ("canvas.stanford.edu" becomes
 * "Canvas (stanford)").
 *
 * @param url - Base URL or any URL on the Canvas host
 * @returns The label, or "Canvas" when the URL cannot be parsed
 */
export function deriveCanvasLabel(url: string): string {
  try {
    const parts = new URL(url.trim()).hostname.split(".");
    if (parts.length >= 2) return `Canvas (${parts[parts.length - 2]})`;
  } catch {
    // Fall through to the default label.
  }
  return "Canvas";
}

/**
 * Setup flow for an additional Canvas account, reached from Settings.
 * Same two modes as the primary step: calendar feed (default) or API token
 * with a class picker.
 *
 * @param onSkip - Cancel; returns to Settings
 */
export default function AddCanvasStep({ onNext, onSkip, saving, setError }: AddCanvasStepProps) {
  const { showToast } = useToast();
  const [mode, setMode] = useState<"ical" | "api">("ical");
  const [icalUrl, setIcalUrl] = useState("");
  const [host, setHost] = useState("");
  const [token, setToken] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [courses, setCourses] = useState<CanvasCourse[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  function warn(message: string) {
    showToast(message, { variant: "error", duration: 4000 });
  }

  /** Saves the feed URL, deriving the base URL and label from its host. */
  async function saveFeed() {
    const url = icalUrl.trim();
    let base: string;
    try {
      const parsed = new URL(url);
      base = `${parsed.protocol}//${parsed.hostname}`;
    } catch {
      warn("Could not parse the URL. Please check it and try again.");
      return;
    }
    setError(null);
    await onNext({ label: deriveCanvasLabel(base), base_url: base, ical_url: url });
  }

  /** Verifies the token by listing courses on the host. */
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
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Verification failed: ${res.status}`);
      }
      const data = await res.json();
      setCourses(data.courses);
      setSelectedIds(new Set());
    } catch (err) {
      warn(err instanceof Error ? err.message : String(err));
    } finally {
      setVerifying(false);
    }
  }

  /** Saves the token account with the picked classes. */
  async function saveToken(e: FormEvent) {
    e.preventDefault();
    if (!courses) return;
    const base = baseUrlFromHost(host);
    const selected = courses.filter((c) => selectedIds.has(c.id)).map((c) => ({ id: c.id, name: c.name }));
    await onNext({ label: deriveCanvasLabel(base), base_url: base, token: token.trim(), selected_courses: selected });
  }

  const cancel = (
    <div className="mt-3 text-center">
      <Button variant="ghost" size="sm" onClick={onSkip} disabled={saving}>
        {ACTIONS.cancel}
      </Button>
    </div>
  );

  return (
    <div>
      <StepHeading provider="canvas" title="Add another Canvas account" />

      {mode === "ical" && (
        <>
          <CanvasFeedForm
            url={icalUrl}
            onUrlChange={setIcalUrl}
            onSubmit={saveFeed}
            onInvalid={warn}
            loading={false}
            saving={saving}
            onUseToken={() => { setMode("api"); setError(null); }}
          />
          {cancel}
        </>
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
            hostHint="The address you use to open Canvas at this school."
            namePrefix="canvas-add"
          />
          <div className="text-center">
            <button type="button" onClick={() => { setMode("ical"); setError(null); }} className={MODE_SWITCH_LINK}>
              Use the calendar feed instead (easier)
            </button>
          </div>
          {cancel}
        </>
      )}

      {mode === "api" && courses && (
        <form onSubmit={saveToken} noValidate>
          <CoursePicker
            courses={courses.map((c) => ({ id: c.id, name: c.name, detail: c.course_code }))}
            selectedIds={selectedIds}
            onToggle={(id) =>
              setSelectedIds((prev) => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              })
            }
            onSetSelection={(ids) => setSelectedIds(new Set(ids))}
            emptyState={<p className="px-3 py-4 text-sm text-muted-foreground text-center">No active {CLASS_NOUN_PLURAL} found.</p>}
          />
          <Button type="submit" variant="inverted" size="lg" className="w-full" loading={saving}>
            {saving ? "Saving..." : ACTIONS.save}
          </Button>
          {cancel}
        </form>
      )}
    </div>
  );
}
