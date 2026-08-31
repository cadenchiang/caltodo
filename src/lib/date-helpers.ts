/**
 * Helper utilities for parsing user-typed date input strings.
 * Used by the DatePicker text input so a date can be typed rather than
 * hunted for in the calendar grid.
 *
 * @module date-helpers
 */

import { parse, isValid, format } from "date-fns";

/** Formats accepted with an explicit four-digit year. */
const EXPLICIT_YEAR_FORMATS = ["MM/dd/yyyy", "M/d/yyyy", "MM-dd-yyyy", "M-d-yyyy"];

/** Month-name formats without a year, e.g. "Feb 25". */
const MONTH_NAME_FORMATS = ["MMM d", "MMM dd", "MMMM d", "MMMM dd"];

/** Month-name formats carrying a year, e.g. "Feb 25, 2027". */
const MONTH_NAME_YEAR_FORMATS = ["MMM d, yyyy", "MMMM d, yyyy", "MMM d yyyy", "MMMM d yyyy"];

/**
 * Start of the current day, used for the "has this date passed" comparison.
 *
 * @returns Today at 00:00 local time
 */
function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Formats a date as the YYYY-MM-DD string the app stores.
 *
 * @param d - Date to format
 * @returns The date in ISO calendar form, in local time
 */
function toIso(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/**
 * Expands a typed two-digit year.
 *
 * @param year - The number as typed
 * @returns A four-digit year
 * @remarks "1/2/29" means 2029, not the year 29. date-fns takes the digits
 *          literally, which produced dates in antiquity.
 */
function expandYear(year: number): number {
  if (year >= 1000) return year;
  if (year >= 100) return year; // Three digits is a typo; leave it to fail validation.
  return 2000 + year;
}

/**
 * Builds a date from calendar parts, rejecting impossible ones.
 *
 * @param year - Four-digit year
 * @param month - Month, 1 through 12
 * @param day - Day of month
 * @returns The date, or null when the parts do not describe a real day
 * @remarks Rolling over (e.g. February 31 becoming March 3) would silently
 *          accept a typo, so the constructed date is checked against the
 *          parts it came from.
 */
function buildDate(year: number, month: number, day: number): Date | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return null;
  }
  return d;
}

/**
 * Moves a year-less date forward when it has already passed.
 *
 * @param month - Month, 1 through 12
 * @param day - Day of month
 * @returns The next occurrence of that month and day, or null if impossible
 * @remarks Typing "9/4" in October means next September, not one a month ago;
 *          a planner's dates are almost always ahead of the user.
 */
function nextOccurrence(month: number, day: number): Date | null {
  const today = startOfToday();
  const thisYear = buildDate(today.getFullYear(), month, day);
  if (thisYear && thisYear >= today) return thisYear;
  return buildDate(today.getFullYear() + 1, month, day);
}

/**
 * Attempts to parse a user-typed date string into a YYYY-MM-DD string.
 *
 * Accepts, in order: "today" and "tomorrow"; ISO "2029-01-02"; numeric
 * "1/2/2029", "1/2/29", "1-2-2029" and year-less "9/4"; and month names
 * "Sep 4" and "Sep 4, 2026".
 *
 * @param input - Raw user input string
 * @returns YYYY-MM-DD string if parseable, or null if not
 * @remarks Forms without a year resolve to the next occurrence, so a date
 *          that has already passed rolls into next year rather than landing
 *          in the past. Impossible dates like "2/31" return null rather than
 *          rolling over into March.
 */
export function parseDateInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Relative words, matching the picker's own preset vocabulary.
  const lower = trimmed.toLowerCase();
  if (lower === "today") return toIso(startOfToday());
  if (lower === "tomorrow") {
    const d = startOfToday();
    d.setDate(d.getDate() + 1);
    return toIso(d);
  }

  // ISO, as pasted from a spreadsheet or another tool.
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
  if (iso) {
    const d = buildDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
    return d ? toIso(d) : null;
  }

  // Numeric month/day with an optional year, separated by / . or -.
  const numeric = /^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{1,4}))?$/.exec(trimmed);
  if (numeric) {
    const month = Number(numeric[1]);
    const day = Number(numeric[2]);
    if (numeric[3] === undefined) {
      const d = nextOccurrence(month, day);
      return d ? toIso(d) : null;
    }
    const d = buildDate(expandYear(Number(numeric[3])), month, day);
    return d ? toIso(d) : null;
  }

  // Month names with a year.
  for (const fmt of MONTH_NAME_YEAR_FORMATS) {
    const parsed = parse(trimmed, fmt, new Date());
    if (isValid(parsed)) return toIso(parsed);
  }

  // Month names without one: same next-occurrence rule as "9/4".
  for (const fmt of MONTH_NAME_FORMATS) {
    const parsed = parse(trimmed, fmt, new Date());
    if (isValid(parsed)) {
      const d = nextOccurrence(parsed.getMonth() + 1, parsed.getDate());
      if (d) return toIso(d);
    }
  }

  // Long-hand formats date-fns can still recognise (e.g. "01/02/2029").
  for (const fmt of EXPLICIT_YEAR_FORMATS) {
    const parsed = parse(trimmed, fmt, new Date());
    if (isValid(parsed)) return toIso(parsed);
  }

  return null;
}
