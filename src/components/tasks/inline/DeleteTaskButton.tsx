"use client";

/**
 * Two-step delete control for the task detail panel.
 *
 * The panel has no confirmation dialog, so the button arms on the first
 * click and only deletes on the second. Mounted with the task's id as its
 * key, so switching tasks remounts it and it can never arrive already armed.
 */

import { useState } from "react";
import { Trash2 } from "lucide-react";

interface DeleteTaskButtonProps {
  /** Runs on the confirming click. */
  onConfirm: () => void;
}

/**
 * Renders the delete control.
 *
 * @param onConfirm - Called on the second click
 * @remarks Disarms on blur, so tabbing away or clicking elsewhere leaves
 *          nothing one keystroke from deleting the task.
 */
export default function DeleteTaskButton({ onConfirm }: DeleteTaskButtonProps) {
  const [armed, setArmed] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        if (!armed) {
          setArmed(true);
          return;
        }
        onConfirm();
      }}
      onBlur={() => setArmed(false)}
      className={`rounded-lg transition-colors ${
        armed
          ? "px-2 py-1 text-xs font-semibold text-white bg-red-500 hover:bg-red-600"
          : "p-1.5 text-muted-foreground hover:text-red-500 hover:bg-foreground/[0.05]"
      }`}
      aria-label={armed ? "Confirm delete task" : "Delete task"}
      title={armed ? "Click again to delete" : "Delete"}
    >
      {armed ? "Delete?" : <Trash2 size={17} strokeWidth={2} />}
    </button>
  );
}
