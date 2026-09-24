/**
 * Conversion and input-sanitising helpers for the 12-hour time picker.
 *
 * The picker stores 24-hour "HH:MM" but shows 12-hour hour, minute, and
 * AM/PM. These helpers keep that conversion, and the rules for what a user
 * may type into the hour and minute fields, out of the component.
 *
 * @module time-input
 */

/** The 12-hour clock components a time is displayed as. */
export interface Time12 {
  /** Hour on a 12-hour clock, 1 through 12. */
  hour12: number;
  /** Minute, 0 through 59. */
  minute: number;
  /** Meridiem. */
  ampm: "AM" | "PM";
}

/** Default shown when no time is set yet: 12:00 AM. */
const DEFAULT_TIME: Time12 = { hour12: 12, minute: 0, ampm: "AM" };

/**
 * Splits a stored 24-hour time into display components.
 *
 * @param value - Time as "HH:MM", or null when unset
 * @returns The 12-hour components; 12:00 AM for null or an unparseable value
 */
export function from24h(value: string | null | undefined): Time12 {
  if (!value) return { ...DEFAULT_TIME };

  const match = /^(\d{1,2}):(\d{2})/.exec(value);
  if (!match) return { ...DEFAULT_TIME };

  const h = Number(match[1]);
  const m = Number(match[2]);
  if (!Number.isFinite(h) || !Number.isFinite(m) || h > 23 || m > 59) {
    return { ...DEFAULT_TIME };
  }

  return {
    hour12: h % 12 === 0 ? 12 : h % 12,
    minute: m,
    ampm: h >= 12 ? "PM" : "AM",
  };
}

/**
 * Builds the stored 24-hour string from display components.
 *
 * @param hour12 - Hour, 1 through 12
 * @param minute - Minute, 0 through 59
 * @param ampm - Meridiem
 * @returns Zero-padded "HH:MM"
 * @remarks 12 AM is midnight (00) and 12 PM is noon (12); both are special
 *          cases that a plain `+12` would get wrong.
 */
export function to24h(hour12: number, minute: number, ampm: "AM" | "PM"): string {
  let h24 = hour12;
  if (ampm === "AM" && hour12 === 12) h24 = 0;
  else if (ampm === "PM" && hour12 !== 12) h24 = hour12 + 12;
  return `${String(h24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * Strips a typed value down to what a time field may hold.
 *
 * @param raw - Whatever the input element now contains
 * @returns At most two digits, with everything else discarded
 * @remarks Runs on every keystroke, so a pasted "7:30pm" becomes "730" and
 *          then "73" rather than being rejected outright.
 */
export function sanitizeTimeDigits(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 2);
}

/**
 * Interprets typed digits as an hour.
 *
 * @param raw - Sanitised digits from the hour field
 * @returns Hour 1 through 12, or null while the field is empty
 * @remarks "0" becomes 12, since a 12-hour clock has no zero hour, and
 *          anything above 12 is clamped rather than rejected so the field
 *          never sits in an invalid state.
 */
export function parseHourInput(raw: string): number | null {
  const digits = sanitizeTimeDigits(raw);
  if (digits === "") return null;
  const n = Number(digits);
  if (n === 0) return 12;
  return Math.min(n, 12);
}

/**
 * Interprets typed digits as a minute.
 *
 * @param raw - Sanitised digits from the minute field
 * @returns Minute 0 through 59, or null while the field is empty
 * @remarks Values above 59 are clamped, so "95" reads as 59.
 */
export function parseMinuteInput(raw: string): number | null {
  const digits = sanitizeTimeDigits(raw);
  if (digits === "") return null;
  return Math.min(Number(digits), 59);
}

/**
 * Steps an hour, wrapping around the 12-hour clock.
 *
 * @param hour12 - Current hour, 1 through 12
 * @param delta - +1 or -1
 * @returns The next hour, wrapping 12 to 1 and 1 to 12
 */
export function stepHour(hour12: number, delta: number): number {
  if (delta > 0) return hour12 >= 12 ? 1 : hour12 + 1;
  return hour12 <= 1 ? 12 : hour12 - 1;
}

/**
 * Steps a minute to the next or previous five-minute mark.
 *
 * @param minute - Current minute, 0 through 59
 * @param delta - +1 or -1
 * @returns The adjacent five-minute mark, wrapping 55 to 0 and 0 to 55
 * @remarks Snaps to the grid rather than adding five, because a typed minute
 *          need not be a multiple of five. Plain subtraction took 3 down to
 *          -2, which is not a minute.
 */
export function stepMinute(minute: number, delta: number): number {
  const floor = Math.floor(minute / 5) * 5;
  if (delta > 0) return (floor + 5) % 60;
  return floor === minute ? (minute === 0 ? 55 : minute - 5) : floor;
}
