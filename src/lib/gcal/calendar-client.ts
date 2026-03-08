/**
 * Google Calendar REST API client for listing calendars.
 * Used by /api/gcal/calendars to let users pick which calendars to display.
 *
 * @module gcal/calendar-client
 */

import { logger } from "@/lib/logger";
import type { GCalCalendarEntry } from "@/lib/types";

/** Base URL for the Google Calendar API v3. */
const GCAL_API_BASE = "https://www.googleapis.com/calendar/v3";

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
