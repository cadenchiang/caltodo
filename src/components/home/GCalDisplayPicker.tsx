"use client";

/**
 * Visual grid picker for selecting a Google Calendar display style.
 * Shows a small static preview + label for each display.
 * Selected display gets a blue ring highlight.
 *
 * @param value - Currently selected display ID
 * @param onChange - Callback with new display ID when user clicks
 */

import { GCAL_DISPLAYS } from "@/lib/gcal-displays";
import type { GCalDisplayId } from "@/lib/gcal-displays";

interface GCalDisplayPickerProps {
  value: string;
  onChange: (id: string) => void;
}

/**
 * Renders a tiny static preview for a given display ID.
 *
 * @param displayId - The display identifier
 * @returns JSX preview element
 */
function DisplayPreview({ displayId }: { displayId: GCalDisplayId }) {
  switch (displayId) {
    case "list":
      return (
        <div className="flex flex-col gap-1 h-full justify-center px-1">
          <div className="flex items-center gap-1">
            <span className="text-[7px] text-blue-500 font-semibold">Today</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1 bg-muted/50 rounded p-0.5">
              <div className="w-0.5 h-3 rounded-full bg-blue-400" />
              <div className="flex-1 space-y-0.5">
                <div className="h-1 w-3/4 bg-foreground/20 rounded" />
                <div className="h-0.5 w-1/2 bg-foreground/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      );

    case "compact":
      return (
        <div className="flex flex-col gap-0.5 h-full justify-center px-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-blue-400" />
              <div className="h-1 flex-1 bg-foreground/15 rounded" />
              <div className="h-1 w-3 bg-foreground/10 rounded" />
            </div>
          ))}
        </div>
      );

    case "cards":
      return (
        <div className="flex flex-col gap-1 h-full justify-center px-1">
          {[["#4285F4", "70%"], ["#33B679", "60%"]].map(([color, w], i) => (
            <div
              key={i}
              className="rounded p-1"
              style={{
                backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                borderLeft: `2px solid ${color}`,
              }}
            >
              <div className="h-1 rounded" style={{ width: w, backgroundColor: "var(--foreground)", opacity: 0.2 }} />
              <div className="h-0.5 w-1/3 mt-0.5 rounded" style={{ backgroundColor: "var(--foreground)", opacity: 0.1 }} />
            </div>
          ))}
        </div>
      );

    case "timeline":
      return (
        <div className="relative h-full flex flex-col justify-center px-1">
          <div className="absolute left-[4px] top-2 bottom-2 w-px bg-border" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-1.5 py-0.5 relative">
              <div className="w-[7px] h-[7px] rounded-full bg-blue-400 border border-blue-400 z-10 shrink-0" />
              <div className="flex-1 space-y-0.5">
                <div className="h-1 w-3/4 bg-foreground/15 rounded" />
                <div className="h-0.5 w-1/3 bg-foreground/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      );

    case "agenda":
      return (
        <div className="flex flex-col h-full justify-center px-0.5">
          {[1, 2].map((i) => (
            <div key={i} className={`flex items-center gap-1 py-1 ${i > 1 ? "border-t border-border/50" : ""}`}>
              <div className="w-4 text-center shrink-0">
                <div className="text-[7px] font-semibold text-foreground/60">{i === 1 ? "9" : "2"}</div>
                <div className="text-[5px] text-muted-foreground">{i === 1 ? "AM" : "PM"}</div>
              </div>
              <div className="w-px self-stretch bg-blue-400 rounded-full" />
              <div className="flex-1">
                <div className="h-1 w-3/4 bg-foreground/15 rounded" />
              </div>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}

export default function GCalDisplayPicker({ value, onChange }: GCalDisplayPickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">Display Style</label>
      <div className="grid grid-cols-3 gap-2">
        {GCAL_DISPLAYS.map((display) => (
          <button
            key={display.id}
            type="button"
            onClick={() => onChange(display.id)}
            className={`flex flex-col items-center rounded-xl border p-2 transition-all cursor-pointer ${
              value === display.id
                ? "ring-2 ring-blue-500 border-blue-500"
                : "border-border hover:border-muted-foreground"
            }`}
          >
            <div className="w-full h-12">
              <DisplayPreview displayId={display.id} />
            </div>
            <span className="text-[10px] text-muted-foreground mt-1">{display.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
