"use client";

/**
 * Shared edit/done toggle button.
 * Pencil icon when not editing, "Done" pill when editing.
 * Used by the home dashboard and anywhere else that needs an edit mode toggle.
 *
 * @param editing - Whether edit mode is currently active
 * @param onToggle - Callback to toggle edit mode
 */

import { Pencil, Check } from "lucide-react";

interface EditToggleButtonProps {
  editing: boolean;
  onToggle: () => void;
}

export default function EditToggleButton({ editing, onToggle }: EditToggleButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 transition-all duration-200 ${
        editing
          ? "px-3 py-1.5 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.97]"
          : "p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted active:scale-[0.95]"
      }`}
      aria-label={editing ? "Done editing" : "Edit"}
    >
      {editing ? (
        <>
          <Check size={14} />
          Done
        </>
      ) : (
        <Pencil size={16} />
      )}
    </button>
  );
}
