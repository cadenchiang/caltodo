/**
 * Canvas iCal client — fetches a bCourses/Canvas calendar feed URL and
 * parses VEVENT entries into NormalizedAssignment objects for the sync engine.
 * Reuses iCal parsing patterns from pensieve-client.ts adapted for Canvas format.
 *
 * Canvas iCal SUMMARY format: "Title [CourseName]"
 * Canvas iCal UID format: "event-assignment-XXXXXXX"
 */

import { logger } from "@/lib/logger";
import type { NormalizedAssignment } from "@/lib/canvas-client";
import {
  extractPropertyWithTzid,
  isDateOnlyValue,
  parseDueDateWithTzid,
} from "@/lib/ical-date-utils";

/** Timeout in milliseconds for fetching the Canvas iCal feed. */
const FETCH_TIMEOUT_MS = 15_000;

/**
 * Fetches and parses assignments from a Canvas iCal calendar feed URL.
 *
 * @param calendarUrl - Full Canvas calendar feed URL (.ics)
 * @returns Array of normalized assignments parsed from the iCal feed
 * @throws Error if the fetch fails or returns non-OK status
 */
export async function fetchCanvasICalAssignments(
  calendarUrl: string
): Promise<NormalizedAssignment[]> {
  logger.info("fetchCanvasICalAssignments: fetching iCal feed", {
    url: calendarUrl.slice(0, 60),
  });

  const res = await fetch(calendarUrl, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`Canvas iCal fetch failed: ${res.status}`);
  }

  const icsText = await res.text();
  // Guard against a 200 response that isn't actually a calendar (e.g. a reset
  // feed returning an HTML login page) — otherwise sync silently yields 0
  // assignments and reports success.
  if (!/BEGIN:VCALENDAR/i.test(icsText)) {
    throw new Error("Canvas calendar feed didn't return a calendar — the feed URL may have been reset. Reconnect it.");
  }
  const assignments = parseCanvasICalEvents(icsText);

  logger.info("fetchCanvasICalAssignments: parsed events", {
    count: assignments.length,
  });
  return assignments;
}

/**
 * Parses raw iCal text from a Canvas feed into NormalizedAssignment objects.
 * Canvas events use SUMMARY format: "Title [CourseName]"
 *
 * @param icsText - Raw iCal text content
 * @returns Array of normalized assignments
 */
export function parseCanvasICalEvents(
  icsText: string
): NormalizedAssignment[] {
  const assignments: NormalizedAssignment[] = [];
  const eventBlocks = icsText.split("BEGIN:VEVENT");

  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i].split("END:VEVENT")[0];
    if (!block) continue;

    // Unfold continuation lines (RFC 5545 Section 3.1)
    const unfolded = block.replace(/\r?\n[ \t]/g, "");

    const uid = extractProperty(unfolded, "UID");
    const summary = extractProperty(unfolded, "SUMMARY");
    const dtstart = extractPropertyWithTzid(unfolded, "DTSTART");
    const dtend = extractPropertyWithTzid(unfolded, "DTEND");
    const description = extractProperty(unfolded, "DESCRIPTION");
    const url = extractProperty(unfolded, "URL");

    if (!uid || !summary) continue;

    // All-day events use an EXCLUSIVE DTEND (the day AFTER the event) per
    // RFC 5545. When DTEND is a date-only value (YYYYMMDD, no time component),
    // using it would render the due date one day late — fall back to DTSTART.
    // Mirrors the pensieve-client fix; timed events (with a T) are unaffected.
    const dtendIsDateOnly = isDateOnlyValue(dtend?.value);
    const endOrStart = dtendIsDateOnly ? dtstart : (dtend ?? dtstart);
    const dueDate = parseDueDateWithTzid(
      endOrStart?.value ?? null,
      endOrStart?.tzid ?? null
    );
    // Canvas exports most assignments as date-only, which carries no time.
    const isAllDay = isDateOnlyValue(endOrStart?.value);
    const { title, courseName } = parseCanvasSummary(summary);

    // Extract external_id from UID (e.g. "event-assignment-8999055" → "8999055")
    const idMatch = uid.match(/event-assignment-(?:override-)?(\d+)/);
    const externalId = idMatch ? idMatch[1] : uid;

    assignments.push({
      external_id: externalId,
      course_name: courseName,
      course_id: "canvas-ical",
      title: unescapeICalText(title),
      due_date: dueDate,
      due_is_all_day: isAllDay,
      source_url: toAssignmentUrl(url || null, externalId),
      points_possible: null,
      is_submitted: false,
      description: description ? unescapeICalText(description).trim() || null : null,
    });
  }

  return assignments;
}

/**
 * Rewrites a Canvas calendar-feed URL into a direct assignment link.
 *
 * The iCal feed points every event at the month view of the Canvas calendar
 * with an anchor, e.g.
 * `.../calendar?include_contexts=course_1555980&month=09&year=2026#assignment_9107004`.
 * Following that lands on a calendar grid, not the assignment, so "Open
 * assignment" appeared to do nothing useful. Both ids needed for the real URL
 * are already in that string.
 *
 * @param calendarUrl - URL from the VEVENT's URL property
 * @param externalId - Assignment id parsed from the event UID
 * @returns A direct `/courses/<id>/assignments/<id>` URL, or the original URL
 *          when it is not the calendar shape (already a deep link, or absent)
 */
export function toAssignmentUrl(
  calendarUrl: string | null,
  externalId: string
): string | null {
  if (!calendarUrl) return null;
  if (!calendarUrl.includes("/calendar")) return calendarUrl;

  const course = calendarUrl.match(/include_contexts=course_(\d+)/)?.[1];
  const assignment = calendarUrl.match(/#assignment_(\d+)/)?.[1] ?? externalId;
  if (!course || !/^\d+$/.test(assignment)) return calendarUrl;

  try {
    const origin = new URL(calendarUrl).origin;
    return `${origin}/courses/${course}/assignments/${assignment}`;
  } catch {
    return calendarUrl;
  }
}

/**
 * Parses a Canvas iCal SUMMARY into title and course name.
 * Canvas format: "Assignment Title [Course Name]"
 *
 * @param summary - Raw SUMMARY value
 * @returns Object with title and courseName
 */
function parseCanvasSummary(summary: string): {
  title: string;
  courseName: string;
} {
  const match = summary.match(/^(.+?)\s*\[(.+)\]\s*$/);
  if (match) {
    return { title: match[1].trim(), courseName: match[2].trim() };
  }
  return { title: summary, courseName: "Canvas" };
}

/**
 * Extracts a single property value from an unfolded iCal VEVENT block.
 *
 * @param block - Unfolded iCal text block
 * @param property - Property name to extract
 * @returns The property value, or null if not found
 */
function extractProperty(block: string, property: string): string | null {
  const regex = new RegExp(`^${property}(?:;[^:]*)?:(.*)$`, "m");
  const match = block.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Unescapes iCal text per RFC 5545 Section 3.3.11.
 *
 * @param text - Escaped iCal text
 * @returns Unescaped plain text
 */
function unescapeICalText(text: string): string {
  return text
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}
