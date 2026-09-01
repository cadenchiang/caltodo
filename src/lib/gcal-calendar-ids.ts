/**
 * Reading and writing the set of Google calendars that sync.
 *
 * The ids live in `google_calendar_id`, a single text column that predates
 * multi-calendar support: one calendar is stored as a bare id and several as a
 * JSON array in the same column. Every reader therefore has to handle both
 * shapes, and getting that wrong silently syncs the wrong calendar rather than
 * failing, so the parsing lives here rather than at each call site.
 */

/** The calendar used when the user has never chosen one. */
export const DEFAULT_CALENDAR_ID = "primary";

/** Most calendars the API accepts in one selection. */
export const MAX_SELECTED_CALENDARS = 10;

/**
 * Parses the stored column into a list of calendar ids.
 *
 * @param stored - Raw `google_calendar_id` value, which may be null.
 * @returns The selected ids, or the default when nothing usable is stored.
 * @remarks Falls back rather than throwing: a malformed value should sync the
 *          primary calendar, not stop the integration working.
 */
export function parseCalendarIds(stored: string | null | undefined): string[] {
  if (!stored) return [DEFAULT_CALENDAR_ID];
  if (!stored.startsWith("[")) return [stored];
  try {
    const parsed: unknown = JSON.parse(stored);
    const ids = Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
      : [];
    return ids.length > 0 ? ids : [DEFAULT_CALENDAR_ID];
  } catch {
    return [DEFAULT_CALENDAR_ID];
  }
}

/**
 * Serialises a selection back into the column's two shapes.
 *
 * @param ids - Calendar ids to store.
 * @returns A bare id for one calendar, a JSON array for several.
 * @remarks Keeps a single selection as a bare id so the column stays readable
 *          by anything written before multi-calendar support existed.
 */
export function serialiseCalendarIds(ids: string[]): string {
  const cleaned = ids.map((id) => id.trim()).filter(Boolean);
  if (cleaned.length === 0) return DEFAULT_CALENDAR_ID;
  if (cleaned.length === 1) return cleaned[0];
  return JSON.stringify(cleaned.slice(0, MAX_SELECTED_CALENDARS));
}
