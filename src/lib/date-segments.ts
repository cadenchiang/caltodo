/**
 * Segment model for the date picker's MM / DD / YYYY entry boxes.
 *
 * The picker takes a date as three separate boxes rather than one free-text
 * field, so the expected order and width are visible before anything is
 * typed. This module holds the pure part of that: what a keystroke is allowed
 * to do to a segment, and when three segments add up to a real calendar day.
 * Validity itself is delegated to `parseDateInput`, so typed dates and pasted
 * ones are judged by exactly one set of rules.
 *
 * @module date-segments
 */

import { parseDateInput } from "@/lib/date-helpers";

/** Which of the three boxes a value belongs to. */
export type DateField = "month" | "day" | "year";

/** The boxes in the order they are shown and tabbed through. */
export const DATE_FIELDS: DateField[] = ["month", "day", "year"];

/** Digits each box holds before it is full and focus moves on. */
export const FIELD_LENGTH: Record<DateField, number> = {
  month: 2,
  day: 2,
  year: 4,
};

/** The three boxes' current text, exactly as typed. */
export type DateSegments = Record<DateField, string>;

/** Every box empty. */
export const EMPTY_SEGMENTS: DateSegments = { month: "", day: "", year: "" };

/**
 * Strips a typed value down to what a box may hold.
 *
 * @param raw - Text from the input, which may contain anything the user typed
 * @param field - Which box it belongs to
 * @returns Digits only, truncated to that box's width
 * @remarks Non-digits are dropped rather than rejected, so typing "5/" into
 *          the month box leaves "5" instead of refusing the keystroke.
 *          An empty result is legitimate: it is how a box is cleared.
 */
export function sanitizeSegment(raw: string, field: DateField): string {
  return raw.replace(/\D/g, "").slice(0, FIELD_LENGTH[field]);
}

/**
 * Reports whether a box holds its full width of digits.
 *
 * @param segments - Current text of all three boxes
 * @param field - Which box to check
 * @returns True when the box is full, which is when focus advances
 */
export function isFieldFull(segments: DateSegments, field: DateField): boolean {
  return segments[field].length === FIELD_LENGTH[field];
}

/**
 * Reports whether all three boxes are full.
 *
 * @param segments - Current text of all three boxes
 * @returns True when there is a complete date to judge
 * @remarks Complete is not the same as valid: "02/31/2026" is complete and
 *          still not a day.
 */
export function isComplete(segments: DateSegments): boolean {
  return DATE_FIELDS.every((f) => isFieldFull(segments, f));
}

/**
 * Reports whether any box has been typed into.
 *
 * @param segments - Current text of all three boxes
 * @returns True when at least one box holds a digit
 */
export function isEmpty(segments: DateSegments): boolean {
  return DATE_FIELDS.every((f) => segments[f] === "");
}

/**
 * Resolves three full boxes to the date string the app stores.
 *
 * @param segments - Current text of all three boxes
 * @returns YYYY-MM-DD, or null when incomplete or not a real calendar day
 * @remarks Returns null while the date is still being typed, so a partial
 *          "5/2/20" is treated as unfinished rather than as an error. Years
 *          below 1000 are rejected: a four-digit year starting with a zero is
 *          a typo, and letting it through would silently store a date in
 *          antiquity. February 29 in a common year is rejected too, by
 *          `parseDateInput`, rather than rolling over into March.
 */
export function segmentsToIso(segments: DateSegments): string | null {
  if (!isComplete(segments)) return null;
  if (Number(segments.year) < 1000) return null;
  return parseDateInput(`${segments.month}/${segments.day}/${segments.year}`);
}

/**
 * Splits a pasted date across the boxes.
 *
 * @param text - Pasted text, e.g. "5/2/2026", "05-02-2026" or "05022026"
 * @param field - The box the paste landed in
 * @returns Boxes filled from that one onward, or null when there is nothing
 *          to fill (no digits in the pasted text)
 * @remarks Pasting a whole date into the month box is the common case, so the
 *          digits are laid into the remaining boxes in order rather than
 *          crammed into the one that received them.
 */
export function segmentsFromPaste(text: string, field: DateField): DateSegments | null {
  const digits = text.replace(/\D/g, "");
  if (!digits) return null;

  const next = { ...EMPTY_SEGMENTS };
  let rest = digits;
  for (const f of DATE_FIELDS.slice(DATE_FIELDS.indexOf(field))) {
    next[f] = rest.slice(0, FIELD_LENGTH[f]);
    rest = rest.slice(FIELD_LENGTH[f]);
  }
  return next;
}

/**
 * Splits a stored date back into the three boxes.
 *
 * @param iso - A YYYY-MM-DD string, or null for a date that is not set
 * @returns The boxes pre-filled with that date, or all empty
 * @remarks Malformed input yields empty boxes rather than throwing: the
 *          picker must still open when a row holds an unexpected value.
 */
export function segmentsFromIso(iso: string | null): DateSegments {
  const match = iso ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso) : null;
  if (!match) return { ...EMPTY_SEGMENTS };
  return { month: match[2], day: match[3], year: match[1] };
}
