/**
 * Google Calendar event creation, editing and deletion for the MCP tools.
 *
 * Kept separate from calendar.ts (reads and recolouring) so each module stays
 * small. Reuses the Calendar OAuth tokens the app already stores.
 *
 * @module mcp/calendar-writes
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { getValidAccessToken } from "@/lib/gcal/token-manager";
import { getSelectedCalendarIds } from "@/lib/mcp/calendar";
import { logger } from "@/lib/logger";

/** Google Calendar API base. */
const GCAL_API_BASE = "https://www.googleapis.com/calendar/v3";

/** Fields accepted when creating or editing an event. */
export interface EventInput {
  title?: string;
  /** RFC3339 start, or a YYYY-MM-DD date for an all-day event. */
  start?: string;
  /** RFC3339 end, or a YYYY-MM-DD date for an all-day event. */
  end?: string;
  description?: string;
  location?: string;
}

/** An event as returned after being written. */
export interface WrittenEvent {
  id: string;
  title: string;
  start: string | null;
  htmlLink: string | null;
}

/** A date with no time component, which Google treats as all-day. */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Obtains a Google access token, or explains why there isn't one.
 *
 * @param client - Supabase client
 * @param userId - caltodo user id
 * @returns A valid access token
 * @throws Error when Google Calendar is not connected
 */
async function requireToken(client: SupabaseClient, userId: string): Promise<string> {
  const token = await getValidAccessToken(client, userId);
  if (!token) {
    throw new Error(
      "Google Calendar is not connected. Connect it in caltodo Settings → Integrations."
    );
  }
  return token;
}

/**
 * Builds the start/end payload Google expects.
 *
 * @param value - RFC3339 timestamp or YYYY-MM-DD date
 * @returns `{ date }` for all-day events, `{ dateTime }` otherwise
 * @remarks Google rejects a mix of the two across start and end, so callers
 *          must use the same shape for both; {@link buildEventBody} enforces it.
 */
export function toTimePayload(value: string): { date: string } | { dateTime: string } {
  return DATE_ONLY.test(value.trim()) ? { date: value.trim() } : { dateTime: value.trim() };
}

/**
 * Builds the request body for a create or patch.
 *
 * @param input - Fields the caller supplied
 * @param requireTimes - True when start and end are mandatory (creating)
 * @returns Body to send to Google
 * @throws Error when required fields are missing, or start and end disagree
 *         about being all-day
 */
export function buildEventBody(
  input: EventInput,
  requireTimes: boolean
): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (input.title !== undefined) {
    const title = input.title.trim();
    if (!title) throw new Error("Event title cannot be empty.");
    body.summary = title;
  }
  if (input.description !== undefined) body.description = input.description;
  if (input.location !== undefined) body.location = input.location;

  if (requireTimes && (!input.start || !input.end)) {
    throw new Error("Creating an event needs both a start and an end.");
  }

  if (input.start) body.start = toTimePayload(input.start);
  if (input.end) body.end = toTimePayload(input.end);

  if (input.start && input.end) {
    const startAllDay = "date" in (body.start as object);
    const endAllDay = "date" in (body.end as object);
    if (startAllDay !== endAllDay) {
      throw new Error(
        "Start and end must both be dates (all-day) or both be date-times."
      );
    }
  }

  if (requireTimes && !body.summary) {
    throw new Error("Creating an event needs a title.");
  }

  if (Object.keys(body).length === 0) {
    throw new Error("Nothing to change. Supply at least one field.");
  }

  return body;
}

/**
 * Maps a Google event onto the shape returned to the assistant.
 *
 * @param raw - Event body from Google
 * @returns Id, title, start and link
 */
function toWritten(raw: Record<string, unknown>): WrittenEvent {
  const start = raw.start as { dateTime?: string; date?: string } | undefined;
  return {
    id: String(raw.id ?? ""),
    title: (raw.summary as string) ?? "(no title)",
    start: start?.dateTime ?? start?.date ?? null,
    htmlLink: (raw.htmlLink as string) ?? null,
  };
}

/**
 * Sends a write to the Calendar API and interprets failures.
 *
 * @param url - Full request URL
 * @param init - Fetch init, including method and body
 * @param context - Values to log on failure
 * @returns Parsed response body, or null for a 204
 * @throws Error describing what Google rejected
 */
async function send(
  url: string,
  init: RequestInit,
  context: Record<string, unknown>
): Promise<Record<string, unknown> | null> {
  const res = await fetch(url, init);

  if (res.status === 404 || res.status === 410) {
    throw new Error("That event no longer exists on this calendar.");
  }
  if (res.status === 403) {
    throw new Error("You do not have permission to change events on that calendar.");
  }
  if (!res.ok) {
    const body = await res.text();
    logger.error("mcp.calendarWrites: request failed", {
      cause: `Google returned ${res.status}: ${body.slice(0, 200)}`,
      ...context,
      impact: "calendar write tool returned an error to the assistant",
    });
    throw new Error(`Google Calendar rejected the change (HTTP ${res.status}).`);
  }

  if (res.status === 204) return null;
  return (await res.json()) as Record<string, unknown>;
}

/**
 * Creates an event.
 *
 * @param userId - caltodo user id
 * @param input - Title, start and end, plus optional description and location
 * @param calendarId - Calendar to write to; defaults to the first selected one
 * @param client - Supabase client, defaults to a service-role admin client (injectable for tests)
 * @returns The created event
 * @throws Error when Calendar is not connected, the input is invalid, or
 *         Google rejects the write
 */
export async function createEvent(
  userId: string,
  input: EventInput,
  calendarId?: string,
  client: SupabaseClient = createAdminClient()
): Promise<WrittenEvent> {
  const body = buildEventBody(input, true);
  const token = await requireToken(client, userId);
  const target = calendarId ?? (await getSelectedCalendarIds(client, userId))[0];

  const raw = await send(
    `${GCAL_API_BASE}/calendars/${encodeURIComponent(target)}/events`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    { userId, calendarId: target }
  );

  logger.info("mcp.calendarWrites: event created", { userId, calendarId: target });
  return toWritten(raw ?? {});
}

/**
 * Edits an existing event.
 *
 * @param userId - caltodo user id
 * @param eventId - Event to change
 * @param input - Fields to change; omitted fields are left alone
 * @param calendarId - Calendar holding the event; defaults to the first selected one
 * @param client - Supabase client, defaults to a service-role admin client (injectable for tests)
 * @returns The event after the change
 * @throws Error when the event is missing, the input is invalid, or Google
 *         rejects the write
 * @remarks Uses PATCH, so untouched fields keep their values.
 */
export async function updateEvent(
  userId: string,
  eventId: string,
  input: EventInput,
  calendarId?: string,
  client: SupabaseClient = createAdminClient()
): Promise<WrittenEvent> {
  const body = buildEventBody(input, false);
  const token = await requireToken(client, userId);
  const target = calendarId ?? (await getSelectedCalendarIds(client, userId))[0];

  // Google keeps deleted events as status "cancelled" and a PATCH revives one,
  // so patching blind both reports success for an event the user deleted and
  // silently puts it back on their calendar. Check first and refuse.
  const existing = await send(
    `${GCAL_API_BASE}/calendars/${encodeURIComponent(target)}/events/${encodeURIComponent(eventId)}`,
    { method: "GET", headers: { Authorization: `Bearer ${token}` } },
    { userId, eventId, calendarId: target }
  );
  if (existing?.status === "cancelled") {
    throw new Error("That event no longer exists on this calendar.");
  }

  const raw = await send(
    `${GCAL_API_BASE}/calendars/${encodeURIComponent(target)}/events/${encodeURIComponent(eventId)}`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    { userId, eventId, calendarId: target }
  );

  logger.info("mcp.calendarWrites: event updated", { userId, eventId, calendarId: target });
  return toWritten(raw ?? {});
}

/**
 * Deletes an event.
 *
 * @param userId - caltodo user id
 * @param eventId - Event to delete
 * @param calendarId - Calendar holding the event; defaults to the first selected one
 * @param client - Supabase client, defaults to a service-role admin client (injectable for tests)
 * @returns Nothing
 * @throws Error when the event is missing or Google rejects the delete
 * @remarks This is not recoverable from caltodo; the event goes to the
 *          calendar's own trash, where only Google can restore it.
 */
export async function deleteEvent(
  userId: string,
  eventId: string,
  calendarId?: string,
  client: SupabaseClient = createAdminClient()
): Promise<void> {
  const token = await requireToken(client, userId);
  const target = calendarId ?? (await getSelectedCalendarIds(client, userId))[0];

  await send(
    `${GCAL_API_BASE}/calendars/${encodeURIComponent(target)}/events/${encodeURIComponent(eventId)}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
    { userId, eventId, calendarId: target }
  );

  logger.info("mcp.calendarWrites: event deleted", { userId, eventId, calendarId: target });
}
