"use client";

/**
 * Reusable color picker panel with preset swatches + ColorWheel.
 * Used in widget settings and anywhere else a color picker is needed.
 * Shows a grid of preset colors first, then an expandable ColorWheel
 * for custom color selection.
 *
 * @param value - Current hex color value
 * @param onChange - Callback fired when color changes
 */

import { useState } from "react";
import ColorWheel from "@/components/ui/ColorWheel";
import { TASK_COLORS } from "@/lib/constants";

interface ColorPickerPanelProps {
  /** Current selected hex color. */
  value: string;
  /** Callback fired on color change. */
  onChange: (color: string) => void;
}

export default function ColorPickerPanel({ value, onChange }: ColorPickerPanelProps) {
  const [showWheel, setShowWheel] = useState(false);

  return (
    <div className="space-y-3">
      {/* Preset swatches */}
      <div className="grid grid-cols-6 gap-2 justify-items-center">
        {TASK_COLORS.map((c) => {
          const isSelected = value.toUpperCase() === c.toUpperCase();
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className={`w-7 h-7 rounded-full transition-all duration-150 cursor-pointer ${
                isSelected
                  ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900 scale-110"
                  : "hover:scale-110"
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          );
        })}
        {/* Custom color toggle */}
        <button
          type="button"
          onClick={() => setShowWheel((prev) => !prev)}
          className={`w-7 h-7 rounded-full transition-all duration-150 cursor-pointer hover:scale-110 overflow-hidden ${
            showWheel ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900" : ""
          }`}
          aria-label="Custom color"
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: "conic-gradient(from 0deg, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))",
            }}
          />
        </button>
      </div>

      {/* ColorWheel for custom colors */}
      {showWheel && (
        <div className="flex justify-center pt-1">
          <ColorWheel value={value || "#000000"} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
