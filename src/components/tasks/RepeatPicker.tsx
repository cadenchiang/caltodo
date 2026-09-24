"use client";

import { format } from "date-fns";
import { getRepeatLabel } from "@/lib/repeat";

type RepeatUnit = "day" | "week" | "month";

interface RepeatOption {
  label: string;
  interval: number | null;
  unit: RepeatUnit | null;
}

interface RepeatPickerProps {
  interval: number | null;
  unit: RepeatUnit | null;
  onChange: (interval: number | null, unit: RepeatUnit | null) => void;
  /** Selected due date — used to generate context-aware labels. */
  dueDate: string | null;
  /** Called when user selects "Custom..." to open the custom recurrence modal. */
  onCustom: () => void;
}

/**
 * Returns ordinal suffix for a number (1st, 2nd, 3rd, 4th, etc.).
 *
 * @param n - Positive integer
 * @returns Ordinal suffix string ("st", "nd", "rd", or "th")
 */
function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

/**
 * Builds context-aware repeat options based on the selected due date.
 * Mirrors Google Calendar's repeat dropdown style.
 *
 * @param dueDate - YYYY-MM-DD string or null
 * @returns Array of repeat option objects
 */
function getRepeatOptions(dueDate: string | null): RepeatOption[] {
  const options: RepeatOption[] = [
    { label: "Does not repeat", interval: null, unit: null },
    { label: "Daily", interval: 1, unit: "day" },
  ];

  if (dueDate) {
    const d = new Date(dueDate + "T00:00:00");
    const dayName = format(d, "EEEE");
    const dayOfMonth = d.getDate();
    const suffix = getOrdinalSuffix(dayOfMonth);

    options.push({ label: `Weekly on ${dayName}`, interval: 1, unit: "week" });
    options.push({
      label: `Monthly on the ${dayOfMonth}${suffix}`,
      interval: 1,
      unit: "month",
    });
  } else {
    options.push({ label: "Weekly", interval: 1, unit: "week" });
    options.push({ label: "Monthly", interval: 1, unit: "month" });
  }

  return options;
}

/**
 * Google Calendar-style repeat dropdown.
 * Shows contextual preset options (Does not repeat, Daily, Weekly on X, etc.)
 * and a "Custom..." option that opens the custom recurrence modal.
 *
 * @param interval - Current repeat interval or null
 * @param unit - Current repeat unit or null
 * @param onChange - Callback with new interval and unit
 * @param dueDate - Selected due date for contextual labels
 * @param onCustom - Callback to open the custom recurrence modal
 */
export default function RepeatPicker({
  interval,
  unit,
  onChange,
  dueDate,
  onCustom,
}: RepeatPickerProps) {
  const options = getRepeatOptions(dueDate);

  /** Checks if an option matches the current repeat configuration. */
  function isActive(opt: RepeatOption): boolean {
    return interval === opt.interval && unit === opt.unit;
  }

  // If current config doesn't match any preset, it's a custom value
  const hasCustomValue =
    interval !== null &&
    unit !== null &&
    !options.some((o) => o.interval === interval && o.unit === unit);

  return (
    <div className="bg-popover rounded-xl shadow-2xl border border-border py-1 w-64 animate-in fade-in zoom-in-95 duration-100">
      {options.map((opt) => (
        <button
          key={opt.label}
          type="button"
          onClick={() => onChange(opt.interval, opt.unit)}
          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
            isActive(opt)
              ? "bg-accent font-medium text-foreground"
              : "text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {opt.label}
        </button>
      ))}

      {/* Show current custom value if it doesn't match a preset */}
      {hasCustomValue && (
        <button
          type="button"
          onClick={onCustom}
          className="w-full text-left px-4 py-2.5 text-sm bg-accent font-medium text-foreground"
        >
          {getRepeatLabel(interval!, unit!)}
        </button>
      )}

      <div className="border-t border-border mt-1 pt-1">
        <button
          type="button"
          onClick={onCustom}
          className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Custom...
        </button>
      </div>
    </div>
  );
}
