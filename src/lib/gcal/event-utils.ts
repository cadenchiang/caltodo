/**
 * Shared utilities for Google Calendar event display.
 * Used by calendar views and the GCal widget.
 *
 * @module gcal/event-utils
 */

/** Google Calendar color IDs mapped to hex colors. */
export const GCAL_COLORS: Record<string, string> = {
  "1": "#7986CB", "2": "#33B679", "3": "#8E24AA", "4": "#E67C73",
  "5": "#F6BF26", "6": "#F4511E", "7": "#039BE5", "8": "#616161",
  "9": "#3F51B5", "10": "#0B8043", "11": "#D50000",
};

/**
 * Parses an event start/end string into a local Date.
 * All-day events use "YYYY-MM-DD" which new Date() parses as UTC midnight,
 * shifting back a day in western timezones. This detects date-only strings
 * and constructs local midnight instead.
 *
 * @param dateStr - ISO datetime string or YYYY-MM-DD date string
 * @returns Date object in local timezone
 */
export function parseEventDate(dateStr: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(dateStr);
}

/**
 * Converts a hex color to an rgba string at the given opacity.
 *
 * @param hex - Hex color string (e.g. "#3b82f6")
 * @param opacity - Opacity between 0 and 1
 * @returns rgba string
 */
export function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Blends a hex color toward white by a given amount, returning a solid hex.
 * Unlike rgba opacity, the result is fully opaque.
 *
 * @param hex - Hex color string (e.g. "#4285F4")
 * @param amount - Blend amount: 0 = original, 1 = pure white
 * @returns Solid hex color string
 */
export function lightenHex(hex: string, amount: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`;
}

/**
 * Blends a hex color toward a target color by a given amount.
 * Used to fade past events toward the background without transparency.
 *
 * @param hex - Source hex color
 * @param target - Target hex color to blend toward (e.g. background)
 * @param amount - Blend factor 0-1 (0 = original, 1 = fully target)
 * @returns Blended hex color
 */
export function blendHex(hex: string, target: string, amount: number): string {
  const c = hex.replace("#", "");
  const t = target.replace("#", "");
  const r = Math.round(parseInt(c.substring(0, 2), 16) * (1 - amount) + parseInt(t.substring(0, 2), 16) * amount);
  const g = Math.round(parseInt(c.substring(2, 4), 16) * (1 - amount) + parseInt(t.substring(2, 4), 16) * amount);
  const b = Math.round(parseInt(c.substring(4, 6), 16) * (1 - amount) + parseInt(t.substring(4, 6), 16) * amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * Formats a 24-hour time string to compact 12-hour format.
 * e.g. "00:00" -> "12a", "13:30" -> "1:30p", "09:00" -> "9a"
 *
 * @param time24 - "HH:MM" format
 * @returns Compact formatted time string
 */
export function formatTimeCompact(time24: string): string {
  const [h, m] = time24.split(":");
  const hour = parseInt(h, 10);
  const minute = m;
  const suffix = hour >= 12 ? "p" : "a";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  if (minute === "00") return `${h12}${suffix}`;
  return `${h12}:${minute}${suffix}`;
}

/**
 * Resolves the display color for a GCal event.
 * Priority: event colorId -> calendar color -> fallback.
 *
 * @param colorId - The event's colorId (may be null)
 * @param calendarColor - The calendar's background color
 * @param fallback - Default color if neither is set
 * @returns Hex color string
 */
export function getEventColor(
  colorId: string | null,
  calendarColor?: string,
  fallback: string = "#8B8FE8"
): string {
  if (colorId && GCAL_COLORS[colorId]) return GCAL_COLORS[colorId];
  if (calendarColor) return calendarColor;
  return fallback;
}

/**
 * Formats an event's time for compact display in calendar views.
 * Returns "All day" for all-day events, or a compact time like "8am", "2:30pm".
 *
 * @param start - ISO datetime or YYYY-MM-DD string
 * @param allDay - Whether the event is all-day
 * @returns Formatted time string
 */
export function formatEventTime(start: string, allDay: boolean): string {
  if (allDay) return "All day";
  const d = new Date(start);
  const h = d.getHours();
  const m = d.getMinutes();
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  if (m === 0) return `${h12}${suffix}`;
  return `${h12}:${String(m).padStart(2, "0")}${suffix}`;
}

/**
 * Returns the YYYY-MM-DD date key for a GCal event's start time.
 *
 * @param start - ISO datetime or YYYY-MM-DD string
 * @returns Date string in YYYY-MM-DD format
 */
export function getEventDateKey(start: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(start)) return start;
  const d = new Date(start);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
