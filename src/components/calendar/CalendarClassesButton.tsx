"use client";

/**
 * Calendar "N classes" pill + popup modal.
 *
 * When the user has synced classes, the calendar header shows a pill (e.g.
 * "6 classes"). Clicking it opens a modal — the same class view/edit UI as
 * Settings → Classes (IntegrationClasses) — plus a per-platform status row
 * showing what's synced and a "Sync later" prompt for what isn't.
 */

import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, GraduationCap } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import {
  IntegrationProvider,
  IntegrationClasses,
  useCredentials,
} from "@/components/settings/IntegrationSettings";

/** Per-platform sync status derived from the user's stored credentials. */
function PlatformStatus() {
  const { credentials } = useCredentials();

  const platforms: { key: string; label: string; synced: boolean }[] = [
    { key: "canvas", label: "Canvas / bCourses", synced: !!credentials.canvas_token || !!credentials.canvas_ical_url },
    { key: "gradescope", label: "Gradescope", synced: !!credentials.gradescope_email },
    { key: "pensieve", label: "Pensive", synced: !!credentials.pensieve_calendar_url },
  ];

  return (
    <div className="mt-5 border-t border-border pt-4">
      <p className="text-xs font-medium text-subtle-foreground mb-2">Connected platforms</p>
      <div className="flex flex-col gap-1.5">
        {platforms.map((p) => (
          <div key={p.key} className="flex items-center justify-between text-sm">
            <span className="text-foreground">{p.label}</span>
            {p.synced ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                Synced
              </span>
            ) : (
              <a
                href="/app/settings?section=integrations"
                className="text-xs font-medium text-[#0e89d6] hover:text-[#3D8FE8] transition-colors"
              >
                Sync later →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** The modal body: the editable class list + platform status. */
function ClassesModal({ onClose }: { onClose: () => void }) {
  // Close on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-popover border border-border shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Your classes</h2>
            <p className="text-xs text-subtle-foreground">Choose which classes to sync assignments from.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 -mr-1 text-subtle-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <IntegrationProvider>
          <IntegrationClasses />
          <PlatformStatus />
        </IntegrationProvider>
      </div>
    </div>,
    document.body
  );
}

/**
 * The pill shown in the calendar header. Renders nothing until at least one
 * class is synced.
 */
export default function CalendarClassesButton() {
  const { tasks } = useTaskContext();
  const [open, setOpen] = useState(false);

  // Count distinct synced classes by course name.
  const classCount = useMemo(() => {
    const names = new Set<string>();
    for (const t of tasks) {
      if (t.source && t.course_name && !t.dismissed_at) names.add(t.course_name);
    }
    return names.size;
  }, [tasks]);

  if (classCount === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="View and edit your synced classes"
        className="hidden md:inline-flex items-center gap-1.5 ml-2 shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent active:scale-95 transition-all"
      >
        <GraduationCap size={14} className="text-muted-foreground" />
        {classCount} {classCount === 1 ? "class" : "classes"}
      </button>
      {open && <ClassesModal onClose={() => setOpen(false)} />}
    </>
  );
}
