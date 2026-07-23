/**
 * Helper utilities for parsing user-typed date input strings.
 * Used by the DatePicker text input to accept various date formats.
 *
 * @module date-helpers
 */

import { parse, isValid, format } from "date-fns";

/**
 * Attempts to parse a user-typed date string into a YYYY-MM-DD string.
 * Supports formats: MM/DD/YYYY, MM-DD-YYYY, MMM D (e.g. "Feb 25"),
 * and MMMM D (e.g. "February 25"). If no year is given, defaults to
 * the current year (or next year if the date has passed).
 *
 * @param input - Raw user input string
 * @returns YYYY-MM-DD string if parseable, or null if invalid
 */
export function parseDateInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const now = new Date();
  const currentYear = now.getFullYear();

  // Try MM/DD/YYYY or MM-DD-YYYY
  const slashFormats = ["MM/dd/yyyy", "M/d/yyyy", "MM-dd-yyyy", "M-d-yyyy"];
  for (const fmt of slashFormats) {
    const parsed = parse(trimmed, fmt, now);
    if (isValid(parsed)) {
      return format(parsed, "yyyy-MM-dd");
    }
  }

  // Try "MMM d" (e.g. "Feb 25") — defaults to current year
  const shortMonthFormats = ["MMM d", "MMM dd", "MMMM d", "MMMM dd"];
  for (const fmt of shortMonthFormats) {
    const parsed = parse(trimmed, fmt, now);
    if (isValid(parsed)) {
      // If the parsed date is before TODAY, use next year. Compare against the
      // start of today, not `now` (which includes the current time) — otherwise
      // typing today's own month/day after midnight always rolled to next year.
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let result = new Date(currentYear, parsed.getMonth(), parsed.getDate());
      if (result < startOfToday) {
        result = new Date(currentYear + 1, parsed.getMonth(), parsed.getDate());
      }
      return format(result, "yyyy-MM-dd");
    }
  }

  // Try "MMM d, yyyy" and "MMMM d, yyyy"
  const fullFormats = ["MMM d, yyyy", "MMMM d, yyyy"];
  for (const fmt of fullFormats) {
    const parsed = parse(trimmed, fmt, now);
    if (isValid(parsed)) {
      return format(parsed, "yyyy-MM-dd");
    }
  }

  return null;
}
