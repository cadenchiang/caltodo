"use client";

import { useState } from "react";
import { getRepeatLabel } from "@/lib/repeat";

type RepeatUnit = "day" | "week" | "month";

interface RepeatPickerProps {
  interval: number | null;
  unit: RepeatUnit | null;
  onChange: (interval: number | null, unit: RepeatUnit | null) => void;
}

/** Preset repeat options displayed as quick-select buttons. */
const PRESETS: Array<{ label: string; interval: number; unit: RepeatUnit }> = [
  { label: "Daily", interval: 1, unit: "day" },
  { label: "Weekly", interval: 1, unit: "week" },
  { label: "Biweekly", interval: 2, unit: "week" },
  { label: "Monthly", interval: 1, unit: "month" },
];

/**
 * Popover content for choosing a repeat interval.
 * Shows preset buttons (Daily, Weekly, Biweekly, Monthly),
 * a "Custom..." toggle for arbitrary intervals, and a Clear button.
 *
 * @param interval - Current repeat interval or null
 * @param unit - Current repeat unit or null
 * @param onChange - Callback with new interval and unit (both null to clear)
 */
export default function RepeatPicker({ interval, unit, onChange }: RepeatPickerProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customInterval, setCustomInterval] = useState(interval ?? 1);
  const [customUnit, setCustomUnit] = useState<RepeatUnit>(unit ?? "day");

  const currentLabel = interval && unit ? getRepeatLabel(interval, unit) : null;

  /**
   * Checks if a preset matches the current repeat configuration.
   */
  function isPresetActive(p: { interval: number; unit: RepeatUnit }): boolean {
    return interval === p.interval && unit === p.unit;
  }

  return (
    <div className="bg-card rounded-2xl shadow-2xl border border-border p-3 w-56">
      {/* Current selection label */}
      {currentLabel && (
        <div className="text-xs font-medium text-blue-500 mb-2 px-1">
          {currentLabel}
        </div>
      )}

      {/* Preset buttons */}
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              onChange(p.interval, p.unit);
              setShowCustom(false);
            }}
            className={`text-xs py-1.5 px-2 rounded-lg transition-all ${
              isPresetActive(p)
                ? "bg-blue-500 text-white"
                : "bg-accent text-secondary-foreground hover:bg-blue-50 dark:hover:bg-blue-900/30"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom toggle */}
      {!showCustom ? (
        <button
          type="button"
          onClick={() => setShowCustom(true)}
          className="w-full text-xs text-secondary-foreground hover:text-foreground py-1.5 rounded-lg hover:bg-accent transition-all"
        >
          Custom...
        </button>
      ) : (
        <div className="border-t border-border pt-2 mt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-secondary-foreground shrink-0">Every</span>
            <input
              type="number"
              min={1}
              max={365}
              value={customInterval}
              onChange={(e) => setCustomInterval(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-14 px-2 py-1 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              value={customUnit}
              onChange={(e) => setCustomUnit(e.target.value as RepeatUnit)}
              className="flex-1 px-2 py-1 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="day">{customInterval === 1 ? "day" : "days"}</option>
              <option value="week">{customInterval === 1 ? "week" : "weeks"}</option>
              <option value="month">{customInterval === 1 ? "month" : "months"}</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => onChange(customInterval, customUnit)}
            className="w-full mt-2 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 py-1.5 rounded-lg transition-colors"
          >
            Set
          </button>
        </div>
      )}

      {/* Clear button */}
      <button
        type="button"
        onClick={() => {
          onChange(null, null);
          setShowCustom(false);
        }}
        className="mt-2 w-full text-xs text-subtle-foreground hover:text-secondary-foreground py-1.5 rounded-lg hover:bg-accent transition-all"
      >
        Clear repeat
      </button>
    </div>
  );
}
