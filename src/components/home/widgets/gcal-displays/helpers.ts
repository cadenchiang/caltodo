/**
 * Shared helpers for Google Calendar display components.
 * Extracted from GoogleCalendarWidget to avoid duplication.
 *
 * @module gcal-display-helpers
 */

import type { GCalEvent } from "@/lib/types";

/** Google Calendar color IDs mapped to hex colors. */
export const GCAL_COLORS: Record<string, string> = {
  "1": "#7986CB", "2": "#33B679", "3": "#8E24AA", "4": "#E67C73",
  "5": "#F6BF26", "6": "#F4511E", "7": "#039BE5", "8": "#616161",
  "9": "#3F51B5", "10": "#0B8043", "11": "#D50000",
};

/**
 * Parses an event start/end string into a local Date.
 * All-day events use "YYYY-MM-DD" which new Date() parses as UTC midnight,
 * shifting back a day in western timezones. Detects date-only strings
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
 * Resolves the display color for a calendar event.
 *
 * @param event - The calendar event
 * @param calendarColors - Map of calendarId to hex color
 * @param fallbackColor - Default color when no mapping exists
 * @returns Hex color string
 */
export function getEventColor(
  event: GCalEvent,
  calendarColors: Record<string, string>,
  fallbackColor: string
): string {
  if (event.colorId) return GCAL_COLORS[event.colorId] || fallbackColor;
  if (event.calendarId && calendarColors[event.calendarId]) return calendarColors[event.calendarId];
  return fallbackColor;
}

/**
 * Formats a relative time string for the next upcoming event.
 *
 * @param diffMs - Milliseconds until event starts (positive = future)
 * @returns Human-readable relative time like "in 5 min" or "now"
 */
export function formatCountdown(diffMs: number): string {
  if (diffMs <= 0) return "now";
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "in <1 min";
  if (mins < 60) return `in ${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  if (hrs < 24 && remainMins === 0) return `in ${hrs} hr`;
  if (hrs < 24) return `in ${hrs} hr ${remainMins} min`;
  return "";
}

/**
 * Groups events by date key (Date.toDateString()).
 *
 * @param events - Array of GCalEvent
 * @returns Map of date string key to events array
 */
export function groupEventsByDay(events: GCalEvent[]): Map<string, GCalEvent[]> {
  const map = new Map<string, GCalEvent[]>();
  for (const event of events) {
    const key = parseEventDate(event.start).toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(event);
  }
  return map;
}

/**
 * Returns a human-readable day label.
 *
 * @param dateKey - Date.toDateString() key
 * @param todayKey - Today's toDateString()
 * @param tomorrowKey - Tomorrow's toDateString()
 * @returns "Today", "Tomorrow", or formatted date
 */
export function dayLabel(dateKey: string, todayKey: string, tomorrowKey: string): string {
  if (dateKey === todayKey) return "Today";
  if (dateKey === tomorrowKey) return "Tomorrow";
  return new Date(dateKey).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Finds the ID of the next upcoming non-all-day event.
 *
 * @param events - Sorted array of GCalEvent
 * @param now - Current time
 * @returns Event ID or null
 */
export function findNextEventId(events: GCalEvent[], now: Date): string | null {
  for (const event of events) {
    if (event.allDay) continue;
    const end = parseEventDate(event.end);
    if (end > now) return event.id;
  }
  return null;
}

/**
 * Formats event time as a short string.
 *
 * @param event - The calendar event
 * @returns "All day" or formatted time like "2:30 PM"
 */
export function formatEventTime(event: GCalEvent): string {
  if (event.allDay) return "All day";
  return new Date(event.start).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}
