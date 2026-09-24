"use client";

/**
 * Shared edit / done toggle button.
 *
 * Pencil mode: 30 px circle, icon only, right-aligned with the widget
 * grid edge. Done mode: 30 px tall pill in blue with the "Done" label.
 * Both states snap to the same right edge so toggling never shifts
 * the layout below.
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
      style={editing ? { height: 30 } : { width: 30, height: 30 }}
      className={`flex items-center justify-center text-sm font-semibold shrink-0 ${
        editing
          ? "px-4 rounded-xl bg-blue-500 text-white hover:bg-blue-500/90 shadow-sm"
          : "rounded-full bg-transparent text-foreground hover:bg-foreground/[0.04]"
      }`}
      aria-label={editing ? "Done editing" : "Edit"}
    >
      {editing ? "Done" : <Pencil size={16} strokeWidth={2.25} />}
    </button>
  );
}
