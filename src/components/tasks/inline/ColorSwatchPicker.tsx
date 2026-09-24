"use client";

/**
 * A coloured dot that opens a palette when clicked.
 *
 * Used on each row of the tag and class pickers so a label's colour can be
 * changed where the label is chosen, rather than in a settings page the user
 * would have to know about.
 */

import { useRef, useState } from "react";
import Popover from "@/components/ui/Popover";
import ColorSwatchGrid from "@/components/tasks/shared/ColorSwatchGrid";

interface ColorSwatchPickerProps {
  /** The colour currently shown. */
  color: string;
  /** Accessible name for the dot, e.g. "Colour for Exam". */
  label: string;
  /** Stores a chosen colour, or null to go back to the derived one. */
  onChange: (color: string | null) => void;
  /** Whether a colour has been chosen, which enables "Use default". */
  isStored: boolean;
}

/**
 * Renders the dot and its palette.
 *
 * @param color - Colour currently shown
 * @param label - Accessible name for the dot
 * @param onChange - Receives the picked colour, or null for the default
 * @param isStored - Whether a colour has been chosen for this label
 * @remarks Clicks are stopped before they reach the row, which would
 *          otherwise select it: picking a colour for a tag and adding the
 *          tag to the task are two different intentions.
 */
export default function ColorSwatchPicker({ color, label, onChange, isStored }: ColorSwatchPickerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <span className="relative inline-flex" onClick={(e) => e.stopPropagation()}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        title="Change colour"
        className="w-4 h-4 -m-1 flex items-center justify-center rounded-full hover:bg-foreground/10 transition-colors"
      >
        <span aria-hidden className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      </button>

      <Popover
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
        className="absolute left-0 top-full mt-1 z-[60]"
      >
        <div className="p-2 w-[9.5rem]">
          <ColorSwatchGrid
            value={color}
            onSelect={(c) => {
              onChange(c);
              setOpen(false);
            }}
          />
          {isStored && (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="mt-2 w-full text-2xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Use default
            </button>
          )}
        </div>
      </Popover>
    </span>
  );
}
