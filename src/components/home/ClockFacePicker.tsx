"use client";

/**
 * Visual grid picker for selecting a clock face style.
 * Shows a small static CSS preview + label for each face.
 * Selected face gets a blue ring highlight.
 *
 * @param value - Currently selected clock face ID
 * @param onChange - Callback with new face ID when user clicks
 */

import { CLOCK_FACES } from "@/lib/clock-faces";
import type { ClockFaceId } from "@/lib/clock-faces";

interface ClockFacePickerProps {
  value: string;
  onChange: (id: string) => void;
}

/**
 * Renders a tiny static preview for a given clock face ID.
 *
 * @param faceId - The clock face identifier
 * @returns JSX preview element
 */
function FacePreview({ faceId }: { faceId: ClockFaceId }) {
  switch (faceId) {
    case "digital":
      return (
        <div className="flex flex-col items-center justify-center h-full gap-1">
          <span className="text-[11px] tabular-nums font-light text-foreground">12:00</span>
          <div className="w-4 h-px bg-border" />
          <span className="text-[7px] text-muted-foreground">Monday</span>
        </div>
      );
    case "analog":
      return (
        <div className="flex items-center justify-center h-full">
          <svg viewBox="0 0 40 40" className="w-10 h-10">
            <circle cx={20} cy={20} r={17} fill="none" className="stroke-border" strokeWidth={1.5} />
            {/* Hour hand pointing at 12 */}
            <line x1={20} y1={20} x2={20} y2={9} className="stroke-foreground" strokeWidth={1.5} strokeLinecap="round" />
            {/* Minute hand pointing at 12 */}
            <line x1={20} y1={20} x2={28} y2={20} className="stroke-foreground" strokeWidth={1} strokeLinecap="round" />
            <circle cx={20} cy={20} r={1.2} className="fill-foreground" />
          </svg>
        </div>
      );
    case "minimal":
      return (
        <div className="flex items-center justify-center h-full">
          <span className="text-sm tabular-nums font-light text-foreground">12:00</span>
        </div>
      );
    case "flip":
      return (
        <div className="flex items-center justify-center h-full gap-0.5">
          {["1", "2"].map((d) => (
            <div key={`h${d}`} className="w-3.5 h-5 rounded-[2px] bg-muted border border-border flex items-center justify-center">
              <span className="text-[8px] tabular-nums text-foreground">{d}</span>
            </div>
          ))}
          <span className="text-[8px] font-bold text-foreground mx-px">:</span>
          {["0", "0"].map((d, i) => (
            <div key={`m${i}`} className="w-3.5 h-5 rounded-[2px] bg-muted border border-border flex items-center justify-center">
              <span className="text-[8px] tabular-nums text-foreground">{d}</span>
            </div>
          ))}
        </div>
      );
    case "stacked":
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <span className="text-sm tabular-nums font-light text-foreground leading-none">12</span>
          <div className="w-3 h-px bg-border my-0.5" />
          <span className="text-[10px] tabular-nums font-light text-foreground leading-none">00</span>
        </div>
      );
    default:
      return null;
  }
}

export default function ClockFacePicker({ value, onChange }: ClockFacePickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">Clock Face</label>
      <div className="grid grid-cols-3 gap-2">
        {CLOCK_FACES.map((face) => (
          <button
            key={face.id}
            type="button"
            onClick={() => onChange(face.id)}
            className={`flex flex-col items-center rounded-xl border p-2 transition-all cursor-pointer ${
              value === face.id
                ? "ring-2 ring-blue-500 border-blue-500"
                : "border-border hover:border-muted-foreground"
            }`}
          >
            <div className="w-full h-12">
              <FacePreview faceId={face.id} />
            </div>
            <span className="text-[10px] text-muted-foreground mt-1">{face.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
