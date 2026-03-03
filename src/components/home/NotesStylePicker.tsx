"use client";

/**
 * Visual grid picker for selecting a notes background style.
 * Shows a small static CSS preview + label for each style.
 * Selected style gets a blue ring highlight.
 *
 * @param value - Currently selected notes style ID
 * @param onChange - Callback with new style ID when user clicks
 */

import { NOTES_STYLES } from "@/lib/notes-styles";
import type { NotesStyleId } from "@/lib/notes-styles";

interface NotesStylePickerProps {
  value: string;
  onChange: (id: string) => void;
}

/**
 * Renders a tiny static preview for a given notes style ID.
 *
 * @param styleId - The notes style identifier
 * @returns JSX preview element
 */
function StylePreview({ styleId }: { styleId: NotesStyleId }) {
  const lineColor = "rgb(var(--color-border) / 0.5)";

  switch (styleId) {
    case "blank":
      return (
        <div className="flex flex-col items-start justify-start h-full px-1.5 py-1 gap-1">
          <div className="h-[3px] w-10 rounded-sm bg-foreground/20" />
          <div className="h-[3px] w-8 rounded-sm bg-foreground/15" />
          <div className="h-[3px] w-11 rounded-sm bg-foreground/10" />
        </div>
      );
    case "lined":
      return (
        <div className="flex flex-col h-full px-1.5 py-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 border-b border-border/50 flex items-end">
              {i < 3 && (
                <div
                  className="h-[2px] rounded-sm bg-foreground/15 mb-px"
                  style={{ width: `${[70, 55, 80][i]}%` }}
                />
              )}
            </div>
          ))}
        </div>
      );
    case "grid":
      return (
        <div
          className="h-full w-full px-1.5 py-1"
          style={{
            backgroundImage: `linear-gradient(${lineColor} 1px, transparent 1px), linear-gradient(90deg, ${lineColor} 1px, transparent 1px)`,
            backgroundSize: "8px 8px",
          }}
        >
          <div className="flex flex-col gap-1 pt-0.5">
            <div className="h-[2px] w-8 rounded-sm bg-foreground/15" />
            <div className="h-[2px] w-10 rounded-sm bg-foreground/10" />
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function NotesStylePicker({ value, onChange }: NotesStylePickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">Paper Style</label>
      <div className="grid grid-cols-3 gap-2">
        {NOTES_STYLES.map((style) => (
          <button
            key={style.id}
            type="button"
            onClick={() => onChange(style.id)}
            className={`flex flex-col items-center rounded-xl border p-2 transition-all cursor-pointer ${
              value === style.id
                ? "ring-2 ring-blue-500 border-blue-500"
                : "border-border hover:border-muted-foreground"
            }`}
          >
            <div className="w-full h-12">
              <StylePreview styleId={style.id} />
            </div>
            <span className="text-[10px] text-muted-foreground mt-1">{style.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
