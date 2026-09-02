"use client";

/**
 * Calendar "N classes" pill + popup modal.
 *
 * When the user has synced classes, the calendar header shows a pill (e.g.
 * "6 classes"). Clicking it opens a modal holding the connected cards from
 * Settings → Integrations: one dropdown per platform, with that platform's
 * accounts and their classes inside.
 *
 * It is the settings list itself rather than a second rendering of the same
 * data, so a class edited here and a class edited in settings cannot drift
 * apart in either behaviour or appearance. Platforms the user has not
 * connected are left out: this modal is about the classes they have.
 */

import { useCallback, useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, GraduationCap } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import IntegrationSettings, {
  IntegrationProvider,
} from "@/components/settings/IntegrationSettings";

/** Duration of the exit animation in ms — must match .animate-modal-out. */
const EXIT_DURATION = 200;

/**
 * The modal body: the connected integrations, each with its classes.
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
          <IntegrationSettings connectedOnly />
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
