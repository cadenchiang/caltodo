/**
 * Google Calendar attendee management for task sharing.
 * Adds/removes attendees from existing calendar events.
 * Separate from calendar-client.ts to keep files focused and under 300 lines.
 *
 * @module gcal/calendar-attendees
 */

import { logger } from "@/lib/logger";

/** Base URL for the Google Calendar API v3. */
const GCAL_API_BASE = "https://www.googleapis.com/calendar/v3";

/**
 * Shape of a Google Calendar attendee object.
 */
interface GCalAttendee {
  email: string;
  responseStatus?: string;
}

/**
 * Adds an attendee to an existing Google Calendar event.
 * Fetches the current attendee list, appends the new email, and PATCHes
 * with sendUpdates=all so Google sends the invite email automatically.
 *
 * @param accessToken - Valid Google OAuth2 access token
 * @param calendarId - The calendar ID containing the event
 * @param eventId - The Google Calendar event ID to update
 * @param email - Email address of the attendee to add
 * @returns true on success, false on failure
 *
 * @edge_cases
 * - If the attendee already exists on the event, Google deduplicates silently.
 * - If the event was deleted externally (404/410), returns false.
 */
export async function addAttendeeToEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  email: string
): Promise<boolean> {
  // Fetch current event to get existing attendees
  const getRes = await fetch(
    `${GCAL_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!getRes.ok) {
    const body = await getRes.text();
    logger.error("addAttendeeToEvent: failed to fetch event", {
      status: getRes.status,
      eventId,
      body,
    });
    return false;
  }

  const event = await getRes.json();
  const currentAttendees: GCalAttendee[] = event.attendees ?? [];

  // Append new attendee
  const updatedAttendees = [
    ...currentAttendees,
    { email, responseStatus: "needsAction" },
  ];

  // PATCH event with updated attendees — sendUpdates=all triggers Google to email the invite
  const patchRes = await fetch(
    `${GCAL_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ attendees: updatedAttendees }),
    }
  );

  if (!patchRes.ok) {
    const body = await patchRes.text();
    logger.error("addAttendeeToEvent: failed to update attendees", {
      status: patchRes.status,
      eventId,
      email,
      body,
    });
    return false;
  }

  logger.info("addAttendeeToEvent: attendee added", { eventId, email });
  return true;
}

/**
 * Removes an attendee from an existing Google Calendar event.
 * Fetches the current attendee list, filters out the email, and PATCHes
 * with sendUpdates=all so Google sends a cancellation notification.
 *
 * @param accessToken - Valid Google OAuth2 access token
 * @param calendarId - The calendar ID containing the event
 * @param eventId - The Google Calendar event ID to update
 * @param email - Email address of the attendee to remove
 * @returns true on success, false on failure
 *
 * @edge_cases
 * - If the attendee is not in the list, the PATCH succeeds silently.
 * - If the event was deleted externally (404/410), returns false.
 */
export async function removeAttendeeFromEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  email: string
): Promise<boolean> {
  // Fetch current event to get existing attendees
  const getRes = await fetch(
    `${GCAL_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!getRes.ok) {
    const body = await getRes.text();
    logger.error("removeAttendeeFromEvent: failed to fetch event", {
      status: getRes.status,
      eventId,
      body,
    });
    return false;
  }

  const event = await getRes.json();
  const currentAttendees: GCalAttendee[] = event.attendees ?? [];

  // Filter out the attendee
  const updatedAttendees = currentAttendees.filter(
    (a) => a.email.toLowerCase() !== email.toLowerCase()
  );

  // PATCH event with updated attendees
  const patchRes = await fetch(
    `${GCAL_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ attendees: updatedAttendees }),
    }
  );

  if (!patchRes.ok) {
    const body = await patchRes.text();
    logger.error("removeAttendeeFromEvent: failed to update attendees", {
      status: patchRes.status,
      eventId,
      email,
      body,
    });
    return false;
  }

  logger.info("removeAttendeeFromEvent: attendee removed", { eventId, email });
  return true;
}

/**
 * Updates an attendee's response status on a Google Calendar event.
 * Fetches the current attendee list, finds the attendee by email,
 * updates their responseStatus, and PATCHes with sendUpdates=all.
 *
 * @param accessToken - Valid Google OAuth2 access token
 * @param calendarId - The calendar ID containing the event
 * @param eventId - The Google Calendar event ID to update
 * @param email - Email address of the attendee to update
 * @param status - New response status ("accepted" or "declined")
 * @returns true on success, false on failure
 *
 * @edge_cases
 * - If the attendee is not found on the event, returns false.
 * - If the event was deleted externally (404/410), returns false.
 */
export async function updateAttendeeResponseStatus(
  accessToken: string,
  calendarId: string,
  eventId: string,
  email: string,
  status: "accepted" | "declined"
): Promise<boolean> {
  const getRes = await fetch(
    `${GCAL_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!getRes.ok) {
    const body = await getRes.text();
    logger.error("updateAttendeeResponseStatus: failed to fetch event", {
      status: getRes.status,
      eventId,
      body,
    });
    return false;
  }

  const event = await getRes.json();
  const currentAttendees: GCalAttendee[] = event.attendees ?? [];

  const attendeeIndex = currentAttendees.findIndex(
    (a) => a.email.toLowerCase() === email.toLowerCase()
  );

  if (attendeeIndex === -1) {
    logger.warn("updateAttendeeResponseStatus: attendee not found on event", {
      eventId,
      email,
    });
    return false;
  }

  currentAttendees[attendeeIndex].responseStatus = status;

  const patchRes = await fetch(
    `${GCAL_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ attendees: currentAttendees }),
    }
  );

  if (!patchRes.ok) {
    const body = await patchRes.text();
    logger.error("updateAttendeeResponseStatus: failed to update attendee", {
      status: patchRes.status,
      eventId,
      email,
      body,
    });
    return false;
  }

  logger.info("updateAttendeeResponseStatus: attendee status updated", {
    eventId,
    email,
    responseStatus: status,
  });
  return true;
}
