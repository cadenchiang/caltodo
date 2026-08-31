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

/** Day-of-week index for Saturday, as returned by Date#getDay. */
const SATURDAY = 6;

/** Day-of-week index for Monday. */
const MONDAY = 1;

/**
 * Days from `from` forward to the next occurrence of `weekday`.
 *
 * Always returns at least 1, so "this weekend" on a Saturday means the
 * weekend after, never today. Landing a preset on the day the user is
 * already looking at would make the chip a no-op.
 *
 * @param from - Reference date
 * @param weekday - Target day index, 0 (Sunday) through 6 (Saturday)
 * @returns A whole number of days between 1 and 7
 */
function daysUntil(from: Date, weekday: number): number {
  const delta = (weekday - from.getDay() + 7) % 7;
  return delta === 0 ? 7 : delta;
}

/**
 * Builds the preset list relative to a reference date.
 *
 * @param now - The date to treat as "today"; defaults to the current date
 * @returns Four presets in display order: Today, Tomorrow, This weekend, Next week
 * @remarks Uses local time throughout, matching the YYYY-MM-DD strings the
 *          picker stores. On a Friday, "This weekend" is tomorrow, so the two
 *          chips resolve to the same date; that is correct, not a bug.
 */
export function getDatePresets(now: Date = new Date()): DatePreset[] {
  const today = startOfDay(now);
  const iso = (d: Date) => format(d, "yyyy-MM-dd");

  return [
    { label: "Today", date: iso(today) },
    { label: "Tomorrow", date: iso(addDays(today, 1)) },
    { label: "This weekend", date: iso(addDays(today, daysUntil(today, SATURDAY))) },
    { label: "Next week", date: iso(addDays(today, daysUntil(today, MONDAY))) },
  ];
}
