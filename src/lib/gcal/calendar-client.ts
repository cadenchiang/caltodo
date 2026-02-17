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
  logger.info("createCaltodoCalendar: calendar created", {
    calendarId: data.id,
  });
  return data.id as string;
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
 * Builds a Google Calendar event payload from a Task.
 * - All-day event if task has due_date but no due_time.
 * - Timed event (30-min duration) if task has due_time.
 * - Completed tasks get "cancelled" status and a checkmark prefix.
 *
 * @param task - The task to convert to a GCal event payload
 * @returns GCalEventPayload ready for the Google Calendar API
 */
export function buildEventPayload(task: Task): GCalEventPayload {
  const isCompleted = task.is_completed;
  const summary = isCompleted ? `✓ ${task.title}` : task.title;

  const descriptionParts: string[] = [];
  if (task.description) descriptionParts.push(task.description);
  if (task.course_name) descriptionParts.push(`Course: ${task.course_name}`);
  if (task.source) descriptionParts.push(`Source: ${task.source}`);
  if (task.source_url) descriptionParts.push(task.source_url);
  descriptionParts.push("Managed by caltodo");
  const description = descriptionParts.join("\n");

  const payload: GCalEventPayload = {
    summary,
    description,
    start: { date: "" },
    end: { date: "" },
  };

  if (isCompleted) {
    payload.status = "cancelled";
  }

  if (task.due_date && task.due_time) {
    // Timed event: combine date + time, 30-min duration
    // Compute end time via simple arithmetic to avoid timezone issues
    const startDateTime = `${task.due_date}T${task.due_time}:00`;
    const [hourStr, minStr] = task.due_time.split(":");
    const totalMin = parseInt(hourStr, 10) * 60 + parseInt(minStr, 10) + DEFAULT_EVENT_DURATION_MIN;
    const endHour = String(Math.floor(totalMin / 60) % 24).padStart(2, "0");
    const endMin = String(totalMin % 60).padStart(2, "0");
    const endDateTime = `${task.due_date}T${endHour}:${endMin}:00`;

    payload.start = { dateTime: startDateTime };
    payload.end = { dateTime: endDateTime };
    payload.transparency = "transparent";
  } else if (task.due_date) {
    // All-day event
    const nextDay = new Date(task.due_date);
    nextDay.setDate(nextDay.getDate() + 1);
    const endDate = nextDay.toISOString().split("T")[0];

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

    // Retry on 429 rate limit with exponential backoff
    if (res.status === 429 && attempt < MAX_RETRIES) {
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
 * @returns true on success, false on failure
 */
export async function updateCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  task: Task
): Promise<boolean> {
  const payload = buildEventPayload(task);

  const res = await fetch(`${GCAL_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

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
