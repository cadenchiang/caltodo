"use client";

/**
 * Google Classroom setup step.
 *
 * Classroom rides on the Google Calendar OAuth grant rather than having its
 * own connect flow, so this step has two shapes: ask for the extra permission
 * when the grant does not carry it yet, or let the user pick classes when it
 * does.
 */

import { useEffect, useState } from "react";
import { Loader2, Check } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

/** A Classroom course as returned by /api/classroom. */
interface ClassroomCourse {
  id: string;
  name: string;
}

interface ClassroomStepProps {
  onNext: () => Promise<boolean> | void;
  onSkip: () => void;
  /** Label for the secondary action; Settings visits are not "skipping". */
  skipLabel?: string;
}

/** What the step is currently able to do. */
type Phase = "loading" | "needsGoogle" | "needsPermission" | "ready" | "failed";

export default function ClassroomStep({
  onNext,
  onSkip,
  skipLabel = "Skip for now",
}: ClassroomStepProps) {
  const { showToast } = useToast();
  const [phase, setPhase] = useState<Phase>("loading");
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/classroom");
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (res.ok) {
          const list: ClassroomCourse[] = body.courses ?? [];
          setCourses(list);
          // Default to everything selected; opting out is the rarer choice.
          setSelected(new Set(list.map((c) => c.id)));
          setPhase("ready");
          return;
        }

        if (body.needsGoogle) {
          setPhase("needsGoogle");
        } else if (body.needsReconnect) {
          setPhase("needsPermission");
        } else {
          setMessage(body.error ?? "Could not reach Google Classroom.");
          setPhase("failed");
        }
      } catch (err) {
        if (cancelled) return;
        setMessage(err instanceof Error ? err.message : String(err));
        setPhase("failed");
      }
    })();

    return () => { cancelled = true; };
  }, []);

  /** Toggles one course in the selection. */
  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /** Saves the selection, turns syncing on, and advances. */
  async function handleConnect() {
    setSaving(true);
    try {
      const res = await fetch("/api/classroom", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: true,
          courses: courses.filter((c) => selected.has(c.id)),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to save");
      }
      await onNext();
    } catch (err) {
      showToast(err instanceof Error ? err.message : String(err), {
        variant: "error",
        duration: 4000,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <img src="/classroom-logo.png" alt="" className="w-6 h-6 object-contain animate-drop-in" />
        <h2 className="text-lg font-bold text-foreground animate-drop-in">Google Classroom</h2>
      </div>

      {phase === "loading" && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 size={15} className="animate-spin" />
          Checking your Google account…
        </div>
      )}

      {phase === "needsGoogle" && (
        <div className="animate-drop-in delay-100">
          <p className="text-sm text-muted-foreground mb-5">
            Classroom uses the same Google account as Calendar. Connect Google first, then come
            back here to pick your classes.
          </p>
          <a
            href="/api/gcal/auth?classroom=1"
            className="inline-flex w-full items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 transition-colors"
          >
            Connect Google
          </a>
        </div>
      )}

      {phase === "needsPermission" && (
        <div className="animate-drop-in delay-100">
          <p className="text-sm text-muted-foreground mb-5">
            caltodo needs one more permission from Google to read your coursework. It is read-only:
            it can see your classes and assignments, and cannot change anything.
          </p>
          <a
            href="/api/gcal/auth?classroom=1"
            className="inline-flex w-full items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 transition-colors"
          >
            Allow Classroom access
          </a>
        </div>
      )}

      {phase === "failed" && (
        <div className="animate-drop-in delay-100">
          <p className="text-sm text-red-500 mb-5">{message}</p>
          <a
            href="/api/gcal/auth?classroom=1"
            className="inline-flex w-full items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold border border-border text-foreground hover:bg-muted transition-colors"
          >
            Try reconnecting Google
          </a>
        </div>
      )}

      {phase === "ready" && (
        <div className="animate-drop-in delay-100">
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground mb-5">
              No active classes found in your Google Classroom account.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Pick the classes to sync.
              </p>
              <div className="flex flex-col gap-1.5 mb-5 text-left max-h-64 overflow-y-auto">
                {courses.map((course) => {
                  const on = selected.has(course.id);
                  return (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => toggle(course.id)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-border bg-card hover:border-input-border transition-colors cursor-pointer"
                    >
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                          on ? "bg-blue-500 border-blue-500" : "border-input-border"
                        }`}
                      >
                        {on && <Check size={11} className="text-white" />}
                      </span>
                      <span className="text-sm text-foreground truncate">{course.name}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <button
            onClick={handleConnect}
            disabled={saving || courses.length === 0}
            className={`w-full px-5 py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
              courses.length === 0
                ? "bg-[#D1D1D6] dark:bg-[#3A3A3C] text-white/70 dark:text-white/40 cursor-not-allowed"
                : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 disabled:opacity-50"
            }`}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Saving..." : "Connect"}
          </button>
        </div>
      )}

      <button
        onClick={onSkip}
        className="mt-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {skipLabel}
      </button>
    </div>
  );
}
