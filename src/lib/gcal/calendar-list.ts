/**
 * Lists ALL Google Calendars for the authenticated user (not just writable).
 * Used by the widget calendar picker to let users choose which calendars' events to display.
 *
 * @module gcal/calendar-list
 */

import { logger } from "@/lib/logger";
import type { GCalCalendarEntry } from "@/lib/types";

/** Base URL for the Google Calendar API v3. */
const GCAL_API_BASE = "https://www.googleapis.com/calendar/v3";

/** Display name for the dedicated calendar caltodo writes synced assignments into. */
export const CALTODO_CALENDAR_SUMMARY = "caltodo";

/** Description set on the calendar at create-time. */
const CALTODO_CALENDAR_DESCRIPTION =
  "Synced assignments and deadlines from caltodo. Changes made here won't sync back.";

/**
 * Lists all calendars from the user's Google Calendar account.
 * Unlike listWritableCalendars, this includes reader and freeBusyReader calendars
 * (holidays, subscribed, shared read-only, etc.).
 * Results are sorted: primary calendar first, then alphabetical by summary.
 *
 * @param accessToken - Valid Google OAuth2 access token
 * @returns Array of all calendar entries sorted primary-first then alphabetical, or null on API failure
 */
export async function listAllCalendars(
  accessToken: string
): Promise<GCalCalendarEntry[] | null> {
  const res = await fetch(`${GCAL_API_BASE}/users/me/calendarList`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    logger.error("listAllCalendars: failed to fetch calendar list", {
      status: res.status,
      body,
    });
    return null;
  }

  const data = await res.json();
  const items: Array<Record<string, unknown>> = data.items ?? [];

  const calendars: GCalCalendarEntry[] = items.map((cal) => ({
    id: cal.id as string,
    summary: (cal.summary as string) ?? "(No name)",
    primary: !!(cal.primary as boolean),
    backgroundColor: (cal.backgroundColor as string) ?? "#4285f4",
    accessRole: cal.accessRole as string,
  }));

  // Sort: primary first, then alphabetical by summary
  calendars.sort((a, b) => {
    if (a.primary && !b.primary) return -1;
    if (!a.primary && b.primary) return 1;
    return a.summary.localeCompare(b.summary);
  });

  logger.info("listAllCalendars: fetched calendars", {
    total: calendars.length,
  });

  return calendars;
}

/**
 * Finds an existing calendar named "caltodo" in the user's account or
 * creates one if none exists. Returns the calendar ID.
 *
 * caltodo pushes synced assignments into a dedicated calendar so they
 * stay isolated from the user's personal events — that way the user can
 * hide, color, or share them independently. Without this, sync writes
 * landed in the user's primary calendar (the bug we're fixing here).
 *
 * @param accessToken - Valid Google OAuth2 access token (calendar scope)
 * @returns The calendar ID, or null on API failure
 */
export async function findOrCreateCaltodoCalendar(
  accessToken: string,
): Promise<string | null> {
  const existing = await listAllCalendars(accessToken);
  if (existing) {
    const match = existing.find(
      (c) =>
        c.summary.trim().toLowerCase() === CALTODO_CALENDAR_SUMMARY &&
        (c.accessRole === "owner" || c.accessRole === "writer"),
    );
    if (match) {
      logger.info("findOrCreateCaltodoCalendar: matched existing calendar", {
        calendarId: match.id,
      });
      return match.id;
    }
  }

  const timeZone = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  })();

  const res = await fetch(`${GCAL_API_BASE}/calendars`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: CALTODO_CALENDAR_SUMMARY,
      description: CALTODO_CALENDAR_DESCRIPTION,
      timeZone,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    logger.error("findOrCreateCaltodoCalendar: failed to create calendar", {
      status: res.status,
      body,
    });
    return null;
  }

  const data = (await res.json()) as { id?: string };
  if (!data.id) {
    logger.error("findOrCreateCaltodoCalendar: create response missing id", { data });
    return null;
  }

  logger.info("findOrCreateCaltodoCalendar: created new calendar", {
    calendarId: data.id,
  });
  return data.id;
}
