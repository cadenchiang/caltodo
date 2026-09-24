/**
 * Conversions for the email digest hour, which is stored in UTC
 * (`integration_credentials.email_digest_hour`) but chosen in local time.
 *
 * @module notifications/digest-hour
 */

/** Every hour of the day, for the hour select. */
export const HOURS: readonly number[] = Array.from({ length: 24 }, (_, i) => i);

/**
 * Wraps an hour into 0..23.
 *
 * @param hour - Any integer, possibly negative or over 23
 * @returns The same hour on a 24-hour clock
 */
export function wrapHour(hour: number): number {
  return ((hour % 24) + 24) % 24;
}

/**
 * Converts a stored UTC hour to the local hour for display.
 *
 * @param utcHour - Hour 0..23 in UTC
 * @param offsetMinutes - `new Date().getTimezoneOffset()` (minutes behind UTC; positive in the Americas)
 * @returns Local hour 0..23
 * @remarks Only whole-hour offsets are represented; a half-hour zone rounds
 *          toward the nearest hour, which is the precision the column has.
 */
export function utcHourToLocal(utcHour: number, offsetMinutes: number): number {
  return wrapHour(utcHour - Math.round(offsetMinutes / 60));
}

/**
 * Converts a chosen local hour to the UTC hour to store.
 *
 * @param localHour - Hour 0..23 in local time
 * @param offsetMinutes - `new Date().getTimezoneOffset()`
 * @returns UTC hour 0..23
 */
export function localHourToUtc(localHour: number, offsetMinutes: number): number {
  return wrapHour(localHour + Math.round(offsetMinutes / 60));
}

/**
 * Formats an hour on a 12-hour clock.
 *
 * @param hour - 0..23
 * @returns "12 AM", "7 AM", "12 PM", "3 PM", ...
 */
export function formatHour(hour: number): string {
  const h = wrapHour(hour);
  const period = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12} ${period}`;
}
