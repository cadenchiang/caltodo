/**
 * Google Calendar reads and event recoloring for the MCP tools.
 *
 * Reuses the app's stored OAuth tokens (auto-refreshed by the token manager)
 * and the calendar selection the user made in settings. Uses the Supabase
 * service-role client because MCP requests carry no user session; every read
 * is scoped to a single `user_id`.
 *
 * @module mcp/calendar
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { getValidAccessToken } from "@/lib/gcal/token-manager";
import { describeColor } from "@/lib/mcp/gcal-colors";
import { logger } from "@/lib/logger";

/** Google Calendar API base. */
const GCAL_API_BASE = "https://www.googleapis.com/calendar/v3";

/** Calendar used when the user has no stored selection. */
const DEFAULT_CALENDAR_ID = "primary";

/** Most events to return in one listing. */
const MAX_LIMIT = 50;

/** Default listing size. */
const DEFAULT_LIMIT = 20;

/** Default window when the caller gives no time range, in days. */
const DEFAULT_WINDOW_DAYS = 7;

/** One event as returned to Poke. */
export interface CalendarEventSummary {
  id: string;
  calendarId: string;
  title: string;
  start: string | null;
  allDay: boolean;
  colorId: string | null;
  colorName: string;
}

/** Filters accepted by {@link listCalendarEvents}. */
export interface ListEventsFilters {
  /** ISO start of the range. Defaults to now. */
  timeMin?: string;
  /** ISO end of the range. Defaults to {@link DEFAULT_WINDOW_DAYS} after timeMin. */
  timeMax?: string;
  /** Free-text search passed to Google's `q` parameter. */
  query?: string;
  /** Maximum events to return (1-50). Defaults to 20. */
  limit?: number;
}

/**
 * Reads the calendars the user selected in settings.
 *
 * @param client - Supabase client scoped to read integration_credentials
 * @param userId - caltodo user id
 * @returns Calendar ids to read from; `["primary"]` when nothing is stored
 * @remarks `google_calendar_id` holds either a single id (legacy) or a
 *          JSON-encoded array (current). Unlike getCalendarId, which picks the
 *          first entry for writes, listing spans every selected calendar.
 */
export async function getSelectedCalendarIds(
  client: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data, error } = await client
    .from("integration_credentials")
    .select("google_calendar_id")
    .eq("user_id", userId)
    .single();

  if (error || !data?.google_calendar_id) return [DEFAULT_CALENDAR_ID];

  const stored = data.google_calendar_id as string;
  if (!stored.startsWith("[")) return [stored];

  try {
    const parsed = JSON.parse(stored);
    const ids = Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
      : [];
    return ids.length > 0 ? ids : [DEFAULT_CALENDAR_ID];
  } catch (err) {
    logger.warn("mcp.calendar: unparseable calendar selection", {
      cause: err instanceof Error ? err.message : String(err),
      userId,
      impact: `fell back to ${DEFAULT_CALENDAR_ID}`,
    });
    return [DEFAULT_CALENDAR_ID];
  }
}

/**
 * Obtains a Google access token, or explains why there isn't one.
 *
 * @param client - Supabase client
 * @param userId - caltodo user id
 * @returns A valid access token
 * @throws Error when Google Calendar is not connected or the refresh failed
 */
async function requireAccessToken(
  client: SupabaseClient,
  userId: string
): Promise<string> {
  const token = await getValidAccessToken(client, userId);
  if (!token) {
    logger.warn("mcp.calendar: no Google token", {
      cause: "Google Calendar not connected, or the stored refresh token was rejected",
      userId,
      impact: "calendar tool returned an error to Poke",
    });
    throw new Error(
      "Google Calendar is not connected. Connect it in caltodo Settings → Integrations."
    );
  }
  return token;
}

/** Shape of the Google event fields this module reads. */
interface RawEvent {
  id?: string;
  summary?: string;
  colorId?: string;
  start?: { dateTime?: string; date?: string };
}

/**
 * Lists upcoming events across the user's selected calendars.
 *
 * @param userId - caltodo user id
 * @param filters - Time range, text query and limit
 * @param client - Supabase client, defaults to a service-role admin client (injectable for tests)
 * @returns Events sorted by start time, each with its calendar and current color
 * @throws Error when Calendar is not connected, or every calendar request fails
 * @remarks A single calendar failing is logged and skipped so one broken
 *          calendar does not hide the rest; an error is thrown only when no
 *          calendar could be read at all.
 */
export async function listCalendarEvents(
  userId: string,
  filters: ListEventsFilters = {},
  client: SupabaseClient = createAdminClient()
): Promise<CalendarEventSummary[]> {
  const token = await requireAccessToken(client, userId);
  const calendarIds = await getSelectedCalendarIds(client, userId);

  const timeMin = filters.timeMin ?? new Date().toISOString();
  const timeMax =
    filters.timeMax ??
    new Date(Date.parse(timeMin) + DEFAULT_WINDOW_DAYS * 86_400_000).toISOString();
  const limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(filters.limit ?? DEFAULT_LIMIT)));

  const results = await Promise.all(
    calendarIds.map(async (calendarId) => {
      const params = new URLSearchParams({
        timeMin,
        timeMax,
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: String(limit),
      });
      if (filters.query) params.set("q", filters.query);

      const res = await fetch(
        `${GCAL_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        logger.warn("mcp.calendar: calendar read failed", {
          cause: `Google returned ${res.status}`,
          userId,
          calendarId,
          impact: "this calendar was skipped in the listing",
        });
        return null;
      }

      const body = await res.json();
      const items: RawEvent[] = body.items ?? [];
      return items
        .filter((item): item is RawEvent & { id: string } => typeof item.id === "string")
        .map((item) => ({
          id: item.id,
          calendarId,
          title: item.summary ?? "(no title)",
          start: item.start?.dateTime ?? item.start?.date ?? null,
          allDay: !item.start?.dateTime && !!item.start?.date,
          colorId: item.colorId ?? null,
          colorName: describeColor(item.colorId),
        }));
    })
  );

  if (results.every((r) => r === null)) {
    throw new Error("Could not read any of your Google Calendars.");
  }

  const events = results.filter((r): r is CalendarEventSummary[] => r !== null).flat();
  events.sort((a, b) => (a.start ?? "").localeCompare(b.start ?? ""));

  logger.info("mcp.calendar: listed events", {
    userId,
    calendars: calendarIds.length,
    returned: Math.min(events.length, limit),
  });

  return events.slice(0, limit);
}

/**
 * Sets one event's color.
 *
 * @param userId - caltodo user id
 * @param eventId - Google Calendar event id
 * @param colorId - Palette id "1" through "11", or null to clear the event's
 *                  own color and let it inherit the calendar's
 * @param calendarId - Calendar holding the event; defaults to the first selected calendar
 * @param client - Supabase client, defaults to a service-role admin client (injectable for tests)
 * @returns The event's title and its new color name
 * @throws Error when Calendar is not connected, the event does not exist on
 *         that calendar, or Google rejects the patch
 * @remarks Patches only `colorId`, so the event's time, title, guests and
 *          description are left exactly as they were. A null colorId is sent
 *          explicitly, which is how Google clears a per-event color.
 */
export async function setEventColor(
  userId: string,
  eventId: string,
  colorId: string | null,
  calendarId?: string,
  client: SupabaseClient = createAdminClient()
): Promise<{ title: string; colorName: string }> {
  const token = await requireAccessToken(client, userId);
  const target = calendarId ?? (await getSelectedCalendarIds(client, userId))[0];

  const res = await fetch(
    `${GCAL_API_BASE}/calendars/${encodeURIComponent(target)}/events/${encodeURIComponent(eventId)}`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ colorId }),
    }
  );

  if (res.status === 404 || res.status === 410) {
    logger.warn("mcp.calendar: recolor target missing", {
      cause: `Google returned ${res.status}`,
      userId,
      eventId,
      calendarId: target,
      impact: "set_event_color reported the event was not found",
    });
    throw new Error(
      `No event "${eventId}" on calendar "${target}". List events first to get a valid id.`
    );
  }

  if (!res.ok) {
    const body = await res.text();
    logger.error("mcp.calendar: recolor failed", {
      cause: `Google returned ${res.status}: ${body.slice(0, 200)}`,
      userId,
      eventId,
      calendarId: target,
      colorId,
      impact: "set_event_color returned an error to Poke",
    });
    throw new Error(`Google Calendar rejected the color change (HTTP ${res.status}).`);
  }

  const updated = (await res.json()) as RawEvent;
  logger.info("mcp.calendar: event recolored", { userId, eventId, calendarId: target, colorId });

  return {
    title: updated.summary ?? "(no title)",
    colorName: describeColor(colorId),
  };
}
