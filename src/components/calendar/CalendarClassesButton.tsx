"use client";

/**
 * Calendar "N classes" pill + popup modal.
 *
 * When the user has synced classes, the calendar header shows a pill (e.g.
 * "6 classes"). Clicking it opens a modal — the same class view/edit UI as
 * Settings → Classes (IntegrationClasses) — plus a per-platform status row
 * showing what's synced and a "Sync later" prompt for what isn't.
 */

import { useCallback, useMemo, useState, useEffect } from "react";
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

  const platforms: Array<{
    key: string;
    label: string;
    logo: React.ReactNode;
    synced: boolean;
  }> = [
    {
      key: "canvas",
      label: "Canvas",
      logo: <img src="/canvas-logo.png" alt="" className="w-6 h-6 object-contain" />,
      synced: !!credentials.canvas_token || !!credentials.canvas_ical_url,
    },
    {
      key: "gradescope",
      label: "Gradescope",
      logo: <img src="/gradescope-logo.png" alt="" className="w-5 h-5 object-contain" />,
      synced: !!credentials.gradescope_email,
    },
    {
      key: "pensieve",
      label: "Pensive",
      logo: <img src="/pensieve-logo.png" alt="" className="w-5 h-5 object-contain" />,
      synced: !!credentials.pensieve_calendar_url,
    },
    {
      key: "brightspace",
      label: "Brightspace",
      logo: (
        <span className="w-6 h-6 rounded-md bg-white flex items-center justify-center overflow-hidden">
          <img src="/brightspace-logo.svg" alt="" className="w-full h-full object-contain" />
        </span>
      ),
      synced: !!credentials.brightspace_calendar_url,
    },
    {
      key: "blackboard",
      label: "Blackboard",
      logo: <img src="/blackboard-logo.svg" alt="" className="w-5 h-5 object-contain" />,
      synced: !!credentials.blackboard_calendar_url,
    },
  ];

  return (
    <div className="mt-5 border-t border-border pt-4">
      <p className="text-xs font-medium text-foreground mb-2">Connected platforms</p>
      {/* Same card language as Settings > Integrations: logo tile, name, and a
          status pill, rather than a bare two-column list of names. */}
      <div className="flex flex-col gap-2">
        {platforms.map((p) => (
          <div
            key={p.key}
            className="flex items-center gap-3 px-3 py-2 rounded-xl border border-border bg-card"
          >
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
              {p.logo}
            </div>
            <span className="flex-1 min-w-0 text-sm font-medium text-foreground truncate">
              {p.label}
            </span>
            {p.synced ? (
              <span className="shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                Synced
              </span>
            ) : (
              <a
                href="/app/settings?section=integrations"
                className="shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-lg border border-blue-200 dark:border-blue-500/30 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
              >
                Connect
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Duration of the exit animation in ms — must match .animate-modal-out. */
const EXIT_DURATION = 200;

/**
 * The modal body: the editable class list + platform status.
 *
 * Entry animation runs from the CSS classes applied on mount. Closing is
 * driven by the parent, which keeps the modal mounted for {@link EXIT_DURATION}
 * with `closing` set so the exit animation can play before unmount.
 *
 * @param closing - True while the exit animation should be playing
 * @param onClose - Starts the close sequence (backdrop click, X, or Escape)
 */
function ClassesModal({ closing, onClose }: { closing: boolean; onClose: () => void }) {
  // Close on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop — fades with the card rather than snapping on and off. */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${
          closing ? "animate-backdrop-out" : "animate-backdrop-in"
        }`}
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-popover border border-border shadow-xl p-6 ${
          closing ? "animate-dialog-out" : "animate-dialog-in"
        }`}
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
  const [closing, setClosing] = useState(false);

  /**
   * Starts the close sequence: flags the modal as closing so its exit
   * animation plays, then unmounts it once the animation has finished.
   */
  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setOpen(false);
    }, EXIT_DURATION);
  }, []);

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
      {open && <ClassesModal closing={closing} onClose={handleClose} />}
    </>
  );
}
