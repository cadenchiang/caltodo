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
