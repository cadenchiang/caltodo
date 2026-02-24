/**
 * Google Calendar REST API client for creating, updating, and deleting events.
 * Uses raw fetch — no external dependencies required.
 * Events are placed in a dedicated "caltodo" calendar, not the user's primary.
 *
 * @module gcal/calendar-client
 */

import { logger } from "@/lib/logger";
import type { Task, GCalCalendarEntry } from "@/lib/types";

/** Base URL for the Google Calendar API v3. */
const GCAL_API_BASE = "https://www.googleapis.com/calendar/v3";

/** Default duration in minutes for timed events. */
const DEFAULT_EVENT_DURATION_MIN = 30;

/** Name for the dedicated caltodo calendar. */
const CALTODO_CALENDAR_NAME = "caltodo";

/** Preferred calendar color (Citron). */
const PREFERRED_COLOR_ID = "11";

/** All 24 Google Calendar color IDs in preference order (citron first). */
const ALL_COLOR_IDS = [
  "11", "9", "10", "7", "8", "13", "14", "15", "16", "6", "12",
  "17", "18", "23", "24", "2", "4", "5", "3", "22", "21", "1", "20", "19",
];

/**
 * Google Calendar event payload shape (subset of fields we use).
 */
export interface GCalEventPayload {
  summary: string;
  description?: string;
  start: { date: string } | { dateTime: string; timeZone?: string };
  end: { date: string } | { dateTime: string; timeZone?: string };
  status?: string;
  transparency?: string;
  attendees?: Array<{ email: string }>;
}

/**
 * Creates a dedicated "caltodo" secondary calendar on the user's Google account.
 *
 * @param accessToken - Valid Google OAuth2 access token
 * @returns The new calendar's ID, or null on failure
 */
export async function createCaltodoCalendar(
  accessToken: string
): Promise<string | null> {
  const res = await fetch(`${GCAL_API_BASE}/calendars`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: CALTODO_CALENDAR_NAME,
      description: "Tasks synced from caltodo",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    logger.error("createCaltodoCalendar: failed to create calendar", {
      status: res.status,
      body,
    });
    return null;
  }

  const data = await res.json();
  const calendarId = data.id as string;
  logger.info("createCaltodoCalendar: calendar created", { calendarId });

  // Set calendar color (citron by default, or first unused color)
  await setCalendarColor(accessToken, calendarId);

  return calendarId;
}

/**
 * Sets the color of a calendar in the user's calendar list.
 * Defaults to citron; if already in use, picks the first unused color.
 *
 * @param accessToken - Valid Google OAuth2 access token
 * @param calendarId - The calendar ID to colorize
 */
async function setCalendarColor(accessToken: string, calendarId: string): Promise<void> {
  // Fetch existing calendars to see which colors are in use
  const usedColors = new Set<string>();
  try {
    const listRes = await fetch(`${GCAL_API_BASE}/users/me/calendarList`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (listRes.ok) {
      const listData = await listRes.json();
      for (const cal of listData.items ?? []) {
        if (cal.colorId && cal.id !== calendarId) {
          usedColors.add(cal.colorId);
        }
      }
    }
  } catch {
    // Non-critical — fall back to citron
  }

  // Pick citron if available, otherwise first unused color
  let colorId = PREFERRED_COLOR_ID;
  if (usedColors.has(PREFERRED_COLOR_ID)) {
    colorId = ALL_COLOR_IDS.find((id) => !usedColors.has(id)) ?? PREFERRED_COLOR_ID;
  }

  try {
    const patchRes = await fetch(
      `${GCAL_API_BASE}/users/me/calendarList/${encodeURIComponent(calendarId)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ colorId }),
      }
    );
    if (patchRes.ok) {
      logger.info("setCalendarColor: color set", { calendarId, colorId });
    } else {
      const body = await patchRes.text();
      logger.warn("setCalendarColor: failed to set color", { status: patchRes.status, body });
    }
  } catch (err) {
    logger.warn("setCalendarColor: error", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Deletes the dedicated "caltodo" calendar from the user's Google account.
 * This also deletes all events in the calendar.
 *
 * @param accessToken - Valid Google OAuth2 access token
 * @param calendarId - The calendar ID to delete
 * @returns true on success, false on failure
 */
export async function deleteCaltodoCalendar(
  accessToken: string,
  calendarId: string
): Promise<boolean> {
  const res = await fetch(`${GCAL_API_BASE}/calendars/${encodeURIComponent(calendarId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status === 204 || res.status === 404 || res.status === 410) {
    logger.info("deleteCaltodoCalendar: calendar deleted", { calendarId });
    return true;
  }

  const body = await res.text();
  logger.error("deleteCaltodoCalendar: failed to delete calendar", {
    status: res.status,
    calendarId,
    body,
  });
  return false;
}

/**
 * Lists all writable calendars from the user's Google Calendar account.
 * Filters to calendars where the user has "owner" or "writer" access.
 *
 * @param accessToken - Valid Google OAuth2 access token
 * @returns Array of writable calendar entries, or null on API failure
 */
export async function listWritableCalendars(
  accessToken: string
): Promise<GCalCalendarEntry[] | null> {
  const res = await fetch(`${GCAL_API_BASE}/users/me/calendarList`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    logger.error("listWritableCalendars: failed to fetch calendar list", {
      status: res.status,
      body,
    });
    return null;
  }

  const data = await res.json();
  const items: Array<Record<string, unknown>> = data.items ?? [];

  const writable = items
    .filter(
      (cal) => cal.accessRole === "owner" || cal.accessRole === "writer"
    )
    .map((cal) => ({
      id: cal.id as string,
      summary: (cal.summary as string) ?? "(No name)",
      primary: !!(cal.primary as boolean),
      backgroundColor: (cal.backgroundColor as string) ?? "#4285f4",
      accessRole: cal.accessRole as string,
    }));

  logger.info("listWritableCalendars: fetched calendars", {
    total: items.length,
    writable: writable.length,
  });

  return writable;
}

/**
 * Formats a 24h time string (e.g. "14:30") to 12h format (e.g. "2:30 PM").
 *
 * @param time24 - Time in "HH:MM" format
 * @returns Formatted time string like "2:30 PM"
 */
function formatTime12h(time24: string): string {
  const [hourStr, minStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const min = minStr ?? "00";
  if (isNaN(hour)) return time24;
  const ampm = hour >= 12 ? "PM" : "AM";
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${min} ${ampm}`;
}

/**
 * Builds a Google Calendar event payload from a Task.
 * Always creates an all-day event. If the task has a due_time, it is
 * appended to the title as "[due @ 11:59 PM]".
 * Completed tasks get "cancelled" status and a checkmark prefix.
 *
 * @param task - The task to convert to a GCal event payload
 * @returns GCalEventPayload ready for the Google Calendar API
 */
export function buildEventPayload(task: Task): GCalEventPayload {
  const isCompleted = task.is_completed;
  let title = task.title;
  if (task.due_time) {
    title += ` [due @ ${formatTime12h(task.due_time)}]`;
  }
  const summary = isCompleted
    ? `✓ ${title.split("").join("\u0336")}\u0336`
    : title;

  // Build description with clear sections separated by blank lines
  const sections: string[] = [];

  // Section 1: Course + source tag
  if (task.course_name) sections.push(task.course_name);

  // Section 2: Assignment description
  if (task.description) sections.push(task.description);

  // Section 3: Link
  if (task.source_url) sections.push(task.source_url);

  const description = sections.join("\n\n");

  const payload: GCalEventPayload = {
    summary,
    description,
    start: { date: "" },
    end: { date: "" },
  };

  if (isCompleted) {
    payload.status = "cancelled";
  }

  if (task.due_date) {
    // Use noon local time to avoid DST boundary edge cases where
    // new Date("YYYY-MM-DD") (UTC midnight) + getDate/setDate (local tz)
    // + toISOString (UTC) can produce the wrong end date.
    const nextDay = new Date(task.due_date + "T12:00:00");
    nextDay.setDate(nextDay.getDate() + 1);
    const y = nextDay.getFullYear();
    const m = String(nextDay.getMonth() + 1).padStart(2, "0");
    const d = String(nextDay.getDate()).padStart(2, "0");
    const endDate = `${y}-${m}-${d}`;

    payload.start = { date: task.due_date };
    payload.end = { date: endDate };
    payload.transparency = "transparent";
  }

  return payload;
}

/** Max retry attempts for rate-limited (429) requests. */
const MAX_RETRIES = 3;

/** Base delay in ms for exponential backoff on 429. */
const RETRY_BASE_DELAY_MS = 1000;

/**
 * Creates a new event on the specified Google Calendar.
 * Strips `status: "cancelled"` from the payload since Google Calendar API
 * rejects cancelled status on POST — only PATCH supports it.
 * Retries on 429 rate limit with exponential backoff.
 *
 * @param accessToken - Valid Google OAuth2 access token
 * @param calendarId - The calendar ID to create the event on
 * @param task - The task to create as a calendar event
 * @returns The created event's Google Calendar ID, or null on failure
 */
export async function createCalendarEvent(
  accessToken: string,
  calendarId: string,
  task: Task
): Promise<string | null> {
  const payload = buildEventPayload(task);

  // Google Calendar API rejects status:"cancelled" on create (POST).
  // The checkmark prefix in summary is sufficient for visual indication.
  if (payload.status === "cancelled") {
    delete payload.status;
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(`${GCAL_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      logger.info("createCalendarEvent: event created", {
        taskId: task.id,
        googleEventId: data.id,
      });
      return data.id as string;
    }

    // Retry on rate limit (429 or 403 rateLimitExceeded) with exponential backoff
    const isRateLimited = res.status === 429 ||
      (res.status === 403 && (await res.clone().text()).includes("rateLimitExceeded"));
    if (isRateLimited && attempt < MAX_RETRIES) {
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
      logger.warn("createCalendarEvent: rate limited, retrying", {
        taskId: task.id,
        attempt: attempt + 1,
        delayMs: delay,
      });
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }

    const body = await res.text();
    logger.error("createCalendarEvent: API call failed", {
      status: res.status,
      taskId: task.id,
      calendarId,
      body,
    });
    return null;
  }

  return null;
}

/**
 * Updates an existing event on the specified Google Calendar.
 *
 * @param accessToken - Valid Google OAuth2 access token
 * @param calendarId - The calendar ID containing the event
 * @param eventId - The Google Calendar event ID to update
 * @param task - The task with updated data
 * @returns true on success, false on failure, "not_found" if event was deleted externally
 */
export async function updateCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  task: Task
): Promise<boolean | "not_found"> {
  const payload = buildEventPayload(task);

  const res = await fetch(`${GCAL_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  // Event was deleted externally — return special value so caller can re-create
  if (res.status === 404 || res.status === 410) {
    logger.warn("updateCalendarEvent: event not found (deleted externally)", {
      eventId,
      taskId: task.id,
    });
    return "not_found";
  }

  if (!res.ok) {
    const body = await res.text();
    logger.error("updateCalendarEvent: API call failed", {
      status: res.status,
      eventId,
      taskId: task.id,
      body,
    });
    return false;
  }

  logger.info("updateCalendarEvent: event updated", {
    taskId: task.id,
    eventId,
  });
  return true;
}

/**
 * Deletes an event from the specified Google Calendar.
 *
 * @param accessToken - Valid Google OAuth2 access token
 * @param calendarId - The calendar ID containing the event
 * @param eventId - The Google Calendar event ID to delete
 * @returns true on success (or 404/410 = already deleted), false on other errors
 */
export async function deleteCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<boolean> {
  const res = await fetch(`${GCAL_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // 204 = deleted, 404/410 = already gone — both are success
  if (res.status === 204 || res.status === 404 || res.status === 410) {
    logger.info("deleteCalendarEvent: event deleted", { eventId });
    return true;
  }

  const body = await res.text();
  logger.error("deleteCalendarEvent: API call failed", {
    status: res.status,
    eventId,
    body,
  });
  return false;
}
