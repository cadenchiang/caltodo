"use client";

/**
 * Visual grid picker for selecting a weather display style.
 * Shows a small static CSS preview + label for each display.
 * Selected display gets a blue ring highlight.
 *
 * @param value - Currently selected weather display ID
 * @param onChange - Callback with new display ID when user clicks
 */

import { WEATHER_DISPLAYS } from "@/lib/weather-displays";
import type { WeatherDisplayId } from "@/lib/weather-displays";

interface WeatherDisplayPickerProps {
  value: string;
  onChange: (id: string) => void;
}

/**
 * Renders a tiny static preview for a given weather display ID.
 *
 * @param displayId - The weather display identifier
 * @returns JSX preview element
 */
function DisplayPreview({ displayId }: { displayId: WeatherDisplayId }) {
  switch (displayId) {
    case "standard":
      return (
        <div className="flex flex-col items-start justify-between h-full px-1.5 py-1">
          <span className="text-[6px] text-foreground">City, ST</span>
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-extralight tabular-nums text-foreground leading-none">72°</span>
            <div className="w-3.5 h-3.5 rounded-full bg-muted" />
          </div>
          <div className="flex items-center gap-1 text-[5px] text-foreground">
            <span>Feels 70°</span>
            <span>|</span>
            <span>45%</span>
          </div>
        </div>
      );
    case "minimal":
      return (
        <div className="flex items-center justify-center h-full gap-1.5">
          <span className="text-sm font-extralight tabular-nums text-foreground leading-none">72°</span>
          <div className="w-3 h-3 rounded-full bg-muted" />
        </div>
      );
    case "card":
      return (
        <div className="flex flex-col items-center justify-center h-full gap-0.5">
          <div className="w-5 h-5 rounded-full bg-muted" />
          <span className="text-[10px] font-extralight tabular-nums text-foreground leading-none">72°</span>
          <span className="text-[5px] text-foreground">Sunny</span>
        </div>
      );
    case "gradient":
      return (
        <div
          className="flex flex-col items-start justify-between h-full px-1.5 py-1 rounded-lg"
          style={{ background: "linear-gradient(135deg, #f97316, #facc15)" }}
        >
          <span className="text-[6px] text-white/70">City, ST</span>
          <span className="text-sm font-extralight tabular-nums text-white leading-none">72°</span>
          <span className="text-[5px] text-white/60">Feels 70°</span>
        </div>
      );
    case "detailed":
      return (
        <div className="flex flex-col items-start justify-between h-full px-1.5 py-1">
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-extralight tabular-nums text-foreground leading-none">72°</span>
            <div className="w-3 h-3 rounded-full bg-muted" />
          </div>
          <div className="grid grid-cols-2 gap-0.5 w-full">
            {["FL", "H", "W", "C"].map((s) => (
              <div key={s} className="bg-muted/50 rounded-[2px] px-0.5 py-px">
                <span className="text-[4px] text-foreground">{s}</span>
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function WeatherDisplayPicker({ value, onChange }: WeatherDisplayPickerProps) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {WEATHER_DISPLAYS.map((display) => (
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
            <span className="text-[10px] text-foreground mt-1">{display.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
