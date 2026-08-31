"use client";

/**
 * A dropdown row that can be picked or deleted.
 *
 * Used by the tag and class pickers, where the list is derived from the
 * user's tasks and the only way to retire an entry is to edit every task
 * carrying it. That is a wide change, so the delete arms on the first click
 * and only runs on the second.
 */

import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";

/** How long an armed delete waits for the confirming click, in ms. */
const ARM_TIMEOUT_MS = 3000;

interface DeletableOptionProps {
  /** Text shown for the option. */
  label: string;
  /** Whether this option is the current selection. */
  selected?: boolean;
  /** Called when the row itself is clicked. */
  onSelect: () => void;
  /** Called on the confirming click. Omit to render a plain, undeletable row. */
  onDelete?: () => void;
  /** Tooltip for the delete control before it is armed. */
  deleteHint?: string;
}

/**
 * Renders one option with an optional two-step delete control.
 *
 * @param label - Option text
 * @param selected - Highlights the row as the current selection
 * @param onSelect - Runs when the row is clicked
 * @param onDelete - Runs on the second click of the delete control
 * @param deleteHint - Tooltip shown before the control is armed
 * @remarks The armed state disarms itself after {@link ARM_TIMEOUT_MS} and on
 *          unmount, so a dropdown reopened later never starts one click away
 *          from deleting something.
 */
export default function DeletableOption({
  label,
  selected = false,
  onSelect,
  onDelete,
  deleteHint = "Delete",
}: DeletableOptionProps) {
  const [armed, setArmed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending disarm so a row unmounting mid-countdown cannot fire a
  // state update afterwards.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  /** Arms the control, or performs the delete when already armed. */
  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!onDelete) return;

    if (armed) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setArmed(false);
      onDelete();
      return;
    }

    setArmed(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setArmed(false), ARM_TIMEOUT_MS);
  }

  return (
    <div className="group/opt flex items-center w-full hover:bg-accent transition-colors">
      <button
        type="button"
        onClick={onSelect}
        className={`flex-1 min-w-0 text-left px-4 py-1.5 text-sm transition-colors truncate ${
          selected ? "text-blue-500 font-medium" : "text-foreground"
        }`}
      >
        {label}
      </button>

      {onDelete && (
        <button
          type="button"
          onClick={handleDeleteClick}
          title={armed ? "Click again to delete" : deleteHint}
          aria-label={armed ? `Confirm delete ${label}` : `Delete ${label}`}
          className={`shrink-0 mr-2 px-1.5 py-1 rounded-md transition-all ${
            armed
              ? "text-white bg-red-500 hover:bg-red-600 text-[11px] font-semibold"
              : // Hidden until hover on pointer devices, always shown on touch,
                // where there is no hover to reveal it.
                "text-muted-foreground hover:text-red-500 opacity-0 group-hover/opt:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
          }`}
        >
          {armed ? "Delete?" : <Trash2 size={13} />}
        </button>
      )}
    </div>
  );
}
