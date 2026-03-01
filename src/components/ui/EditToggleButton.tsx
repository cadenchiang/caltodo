"use client";

/**
 * Shared edit/done toggle button.
 * Pencil icon when not editing, iOS-style blue pill with "Done" when editing.
 * Used by the home dashboard and anywhere else that needs an edit mode toggle.
 *
 * @param editing - Whether edit mode is currently active
 * @param onToggle - Callback to toggle edit mode
 */

import { Pencil } from "lucide-react";

interface EditToggleButtonProps {
  editing: boolean;
  onToggle: () => void;
  id?: string;
}

export default function EditToggleButton({ editing, onToggle, id }: EditToggleButtonProps) {
  return (
    <button
      id={id}
      onClick={onToggle}
      className={`flex items-center justify-center transition-all duration-200 ${
        editing
          ? "px-5 py-2 text-sm font-semibold rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow-sm active:scale-[0.97]"
          : "p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted active:scale-[0.95]"
      }`}
      aria-label={editing ? "Done editing" : "Edit"}
    >
      {editing ? "Done" : <Pencil size={16} />}
    </button>
  );
}
