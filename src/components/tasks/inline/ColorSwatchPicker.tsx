"use client";

/**
 * A coloured dot that opens a palette when clicked.
 *
 * Used on each row of the tag and class pickers so a label's colour can be
 * changed where the label is chosen, rather than in a settings page the user
 * would have to know about.
 */

import { useRef, useState } from "react";
import { Check } from "lucide-react";
import { TASK_COLORS } from "@/lib/constants";
import Popover from "@/components/ui/Popover";

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
        <div className="bg-popover rounded-xl shadow-2xl border border-border p-2 w-[9.5rem]">
          <div className="grid grid-cols-5 gap-1.5">
            {TASK_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                aria-label={`Use ${c}`}
                className="w-6 h-6 rounded-full flex items-center justify-center ring-offset-2 ring-offset-popover hover:ring-2 hover:ring-foreground/30 transition-shadow"
                style={{ backgroundColor: c }}
              >
                {c.toLowerCase() === color.toLowerCase() && <Check size={12} className="text-white" strokeWidth={3} />}
              </button>
            ))}
          </div>
          {isStored && (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="mt-2 w-full text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Use default
            </button>
          )}
        </div>
      </Popover>
    </span>
  );
}
