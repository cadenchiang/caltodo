/**
 * Pensieve iCal client — fetches a Pensieve .ics calendar URL and parses
 * VEVENT entries into NormalizedAssignment objects for the sync engine.
 * Server-side only — called from sync-engine.ts.
 */

import { logger } from "@/lib/logger";
import type { NormalizedAssignment } from "@/lib/canvas-client";

/** Timeout in milliseconds for fetching the Pensieve iCal feed. */
const FETCH_TIMEOUT_MS = 15_000;

/** Default color for Pensieve assignments (purple). */
export const PENSIEVE_COLOR = "#8B5CF6";

/**
 * Fetches and parses assignments from a Pensieve iCal calendar URL.
 * Extracts VEVENT components and maps them to NormalizedAssignment.
 *
 * @param calendarUrl - Full Pensieve calendar URL (https://api.pensieve.co/api/calendar/...ics)
 * @returns Array of normalized assignments parsed from the iCal feed
 * @throws Error if the fetch fails or returns non-OK status
 */
export async function fetchPensieveAssignments(
  calendarUrl: string
): Promise<NormalizedAssignment[]> {
  logger.info("fetchPensieveAssignments: fetching iCal feed", { url: calendarUrl.slice(0, 60) });

  const res = await fetch(calendarUrl, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`Pensieve calendar fetch failed: ${res.status}`);
  }

  const icsText = await res.text();
  const assignments = parseICalEvents(icsText);

  logger.info("fetchPensieveAssignments: parsed events", { count: assignments.length });
  return assignments;
}

/**
 * Parses raw iCal text into NormalizedAssignment objects.
 * Extracts SUMMARY, DTSTART, DTEND, UID, and DESCRIPTION from each VEVENT.
 *
 * @param icsText - Raw iCal text content
 * @returns Array of normalized assignments
 */
export function parseICalEvents(icsText: string): NormalizedAssignment[] {
  const assignments: NormalizedAssignment[] = [];

  // Split into VEVENT blocks
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

    if (!uid || !summary) continue;

    // Parse the due date from DTSTART or DTEND
    const dueDate = parseDueDate(dtend || dtstart);

    assignments.push({
      external_id: `pensieve-${uid}`,
      course_name: extractCourseName(summary, description),
      course_id: "pensieve",
      title: unescapeICalText(summary),
      due_date: dueDate,
      source_url: null,
      points_possible: null,
      is_submitted: false,
      description: description ? unescapeICalText(description) : null,
    });
  }

  return assignments;
}

/**
 * Extracts a single property value from an unfolded iCal VEVENT block.
 * Handles properties with parameters (e.g. DTSTART;VALUE=DATE:20260215).
 *
 * @param block - Unfolded iCal text block
 * @param property - Property name to extract (e.g. "SUMMARY", "DTSTART")
 * @returns The property value, or null if not found
 */
function extractProperty(block: string, property: string): string | null {
  // Match PROPERTY:value or PROPERTY;params:value
  const regex = new RegExp(`^${property}(?:;[^:]*)?:(.*)$`, "m");
  const match = block.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Parses a due date from iCal date/datetime formats.
 * Supports: YYYYMMDD, YYYYMMDDTHHmmssZ, YYYYMMDDTHHmmss
 *
 * @param raw - Raw iCal date string
 * @returns ISO 8601 date string or null if unparseable
 */
function parseDueDate(raw: string | null): string | null {
  if (!raw) return null;

  // DATE format: YYYYMMDD
  if (/^\d{8}$/.test(raw)) {
    const y = raw.slice(0, 4);
    const m = raw.slice(4, 6);
    const d = raw.slice(6, 8);
    return `${y}-${m}-${d}T00:00:00Z`;
  }

  // DATETIME format: YYYYMMDDTHHmmss or YYYYMMDDTHHmmssZ
  const dtMatch = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/);
  if (dtMatch) {
    const [, y, mo, d, h, mi, s] = dtMatch;
    return `${y}-${mo}-${d}T${h}:${mi}:${s}Z`;
  }

  return null;
}

/**
 * Attempts to extract a course name from the event summary or description.
 * Pensieve events often have format "Course Name: Assignment Title" or similar.
 *
 * @param summary - VEVENT SUMMARY value
 * @param description - VEVENT DESCRIPTION value (optional)
 * @returns Extracted course name, or "Pensieve" as fallback
 */
function extractCourseName(summary: string, description: string | null): string {
  // Try "Course: Assignment" pattern in summary
  const colonIdx = summary.indexOf(":");
  if (colonIdx > 0 && colonIdx < summary.length - 1) {
    const prefix = summary.slice(0, colonIdx).trim();
    // Only use as course name if it looks like a course (not too long, not a URL prefix)
    if (prefix.length > 0 && prefix.length < 40 && !prefix.includes("//")) {
      return unescapeICalText(prefix);
    }
  }

  // Try extracting from description
  if (description) {
    const courseMatch = description.match(/(?:course|class):\s*(.+)/i);
    if (courseMatch) {
      return unescapeICalText(courseMatch[1].trim());
    }
  }

  return "Pensieve";
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
