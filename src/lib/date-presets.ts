/**
 * Quick-select date presets for the date picker.
 *
 * The calendar grid alone makes the common cases ("today", "tomorrow") a
 * hunt through a month of cells, so the picker offers them as one-tap chips.
 *
 * @module date-presets
 */

import { addDays, format, startOfDay } from "date-fns";

/** One quick-select chip: a label and the date it resolves to. */
export interface DatePreset {
  /** Text shown on the chip. */
  label: string;
  /** Resolved date as YYYY-MM-DD. */
  date: string;
}

/**
 * Builds the preset list relative to a reference date.
 *
 * @param now - The date to treat as "today"; defaults to the current date
 * @returns Two presets in display order: Today, Tomorrow
 * @remarks Uses local time throughout, matching the YYYY-MM-DD strings the
 *          picker stores. Weekday-relative chips ("This weekend", "Next
 *          week") were removed: they resolved to dates the user could not
 *          read off the chip, so the grid is clearer for anything past
 *          tomorrow.
 */
export function getDatePresets(now: Date = new Date()): DatePreset[] {
  const today = startOfDay(now);
  const iso = (d: Date) => format(d, "yyyy-MM-dd");

  return [
    { label: "Today", date: iso(today) },
    { label: "Tomorrow", date: iso(addDays(today, 1)) },
  ];
}
