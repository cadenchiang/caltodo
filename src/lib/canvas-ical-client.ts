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
    const dtstart = extractProperty(unfolded, "DTSTART");
    const dtend = extractProperty(unfolded, "DTEND");
    const description = extractProperty(unfolded, "DESCRIPTION");
    const url = extractProperty(unfolded, "URL");

    if (!uid || !summary) continue;

    const dueDate = parseDueDate(dtend || dtstart);
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
      source_url: url || null,
      points_possible: null,
      is_submitted: false,
      description: description ? unescapeICalText(description).trim() || null : null,
    });
  }

  return assignments;
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
 * Parses a due date from iCal date/datetime formats.
 *
 * @param raw - Raw iCal date string
 * @returns ISO 8601 date string or null if unparseable
 */
function parseDueDate(raw: string | null): string | null {
  if (!raw) return null;

  if (/^\d{8}$/.test(raw)) {
    const y = raw.slice(0, 4);
    const m = raw.slice(4, 6);
    const d = raw.slice(6, 8);
    return `${y}-${m}-${d}T00:00:00Z`;
  }

  const dtMatch = raw.match(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/
  );
  if (dtMatch) {
    const [, y, mo, d, h, mi, s] = dtMatch;
    return `${y}-${mo}-${d}T${h}:${mi}:${s}Z`;
  }

  return null;
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
