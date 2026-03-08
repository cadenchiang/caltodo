/**
 * Google Calendar CRUD operations for syncing tasks to a dedicated calendar.
 * Creates, updates, and deletes GCal events linked to caltodo tasks.
 *
 * @module gcal/calendar-sync
 */

import { logger } from "@/lib/logger";
import type { Task } from "@/lib/types";

/** Base URL for the Google Calendar API v3. */
const GCAL_API_BASE = "https://www.googleapis.com/calendar/v3";

/** Max retry attempts for rate-limited (429) requests. */
const MAX_RETRIES = 3;

/** Base delay in ms for exponential backoff on 429. */
const RETRY_BASE_DELAY_MS = 1000;

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
 * Completed tasks get a checkmark prefix with strikethrough title.
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
    ? `\u2713 ${title.split("").join("\u0336")}\u0336`
    : title;

  const sections: string[] = [];
  if (task.course_name) sections.push(task.course_name);
  if (task.description) sections.push(task.description);
  if (task.source_url) sections.push(task.source_url);
  const description = sections.join("\n\n");

  const payload: GCalEventPayload = {
    summary,
    description,
    start: { date: "" },
    end: { date: "" },
  };

  if (task.due_date) {
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

/**
 * Creates a new event on the specified Google Calendar.
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
  if (payload.status === "cancelled") delete payload.status;

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
      logger.info("createCalendarEvent: event created", { taskId: task.id, googleEventId: data.id });
      return data.id as string;
    }

    const isRateLimited = res.status === 429 ||
      (res.status === 403 && (await res.clone().text()).includes("rateLimitExceeded"));
    if (isRateLimited && attempt < MAX_RETRIES) {
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
      logger.warn("createCalendarEvent: rate limited, retrying", { taskId: task.id, attempt: attempt + 1, delayMs: delay });
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }

    const body = await res.text();
    logger.error("createCalendarEvent: API call failed", { status: res.status, taskId: task.id, body });
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

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(`${GCAL_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 404 || res.status === 410) {
      logger.warn("updateCalendarEvent: event not found", { eventId, taskId: task.id });
      return "not_found";
    }

    const isRateLimited = res.status === 429 ||
      (res.status === 403 && (await res.clone().text()).includes("rateLimitExceeded"));
    if (isRateLimited && attempt < MAX_RETRIES) {
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }

    if (!res.ok) {
      const body = await res.text();
      logger.error("updateCalendarEvent: API call failed", { status: res.status, eventId, taskId: task.id, body });
      return false;
    }

    logger.info("updateCalendarEvent: event updated", { taskId: task.id, eventId });
    return true;
  }
  return false;
}

/**
 * Deletes an event from the specified Google Calendar.
 *
 * @param accessToken - Valid Google OAuth2 access token
 * @param calendarId - The calendar ID containing the event
 * @param eventId - The Google Calendar event ID to delete
 * @returns true on success (or already deleted), false on error
 */
export async function deleteCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<boolean> {
  const res = await fetch(`${GCAL_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 204 || res.status === 404 || res.status === 410) {
    logger.info("deleteCalendarEvent: event deleted", { eventId });
    return true;
  }

  const body = await res.text();
  logger.error("deleteCalendarEvent: API call failed", { status: res.status, eventId, body });
  return false;
}
