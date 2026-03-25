/**
 * Brightspace (D2L) iCal client — fetches a Brightspace calendar feed URL and
 * parses VEVENT entries into NormalizedAssignment objects for the sync engine.
 *
 * Brightspace iCal feeds follow standard iCal format. SUMMARY may use:
 *   - "Title - CourseName"
 *   - "Title [CourseName]"
 *   - Just "Title"
 */

import { logger } from "@/lib/logger";
import type { NormalizedAssignment } from "@/lib/canvas-client";
import {
  extractPropertyWithTzid,
  parseDueDateWithTzid,
} from "@/lib/ical-date-utils";

const FETCH_TIMEOUT_MS = 15_000;

/**
 * Fetches and parses assignments from a Brightspace iCal calendar feed URL.
 *
 * @param calendarUrl - Full Brightspace calendar feed URL (.ics)
 * @returns Array of normalized assignments parsed from the iCal feed
 */
export async function fetchBrightspaceAssignments(
  calendarUrl: string
): Promise<NormalizedAssignment[]> {
  logger.info("fetchBrightspaceAssignments: fetching iCal feed", {
    url: calendarUrl.slice(0, 60),
  });

  const res = await fetch(calendarUrl, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`Brightspace iCal fetch failed: ${res.status}`);
  }

  const icsText = await res.text();
  const assignments = parseBrightspaceEvents(icsText);

  logger.info("fetchBrightspaceAssignments: parsed events", {
    count: assignments.length,
  });
  return assignments;
}

/**
 * Parses raw iCal text from a Brightspace feed into NormalizedAssignment objects.
 *
 * @param icsText - Raw iCal text content
 * @returns Array of normalized assignments
 */
export function parseBrightspaceEvents(
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
    const categories = extractProperty(unfolded, "CATEGORIES");

    if (!uid || !summary) continue;

    const endOrStart = dtend ?? dtstart;
    const dueDate = parseDueDateWithTzid(
      endOrStart?.value ?? null,
      endOrStart?.tzid ?? null
    );
    const { title, courseName } = parseBrightspaceSummary(summary, categories);

    // Use UID as external_id, strip any common prefixes
    const externalId = uid.replace(/^.*?(\d+).*$/, "$1") || uid;

    assignments.push({
      external_id: `bs-${externalId}`,
      course_name: courseName,
      course_id: "brightspace",
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
 * Parses a Brightspace SUMMARY into title and course name.
 * Tries multiple formats:
 *   - "Title [CourseName]" (Canvas-like)
 *   - "Title - CourseName" (Brightspace common)
 *   - Falls back to CATEGORIES for course name
 *
 * @param summary - Raw SUMMARY value
 * @param categories - Optional CATEGORIES value (often contains course name)
 * @returns Object with title and courseName
 */
function parseBrightspaceSummary(
  summary: string,
  categories: string | null
): { title: string; courseName: string } {
  // Try [CourseName] format first
  const bracketMatch = summary.match(/^(.+?)\s*\[(.+)\]\s*$/);
  if (bracketMatch) {
    return { title: bracketMatch[1].trim(), courseName: bracketMatch[2].trim() };
  }

  // Try "Title - CourseName" format (only if dash has spaces around it)
  const dashMatch = summary.match(/^(.+?)\s+-\s+(.+)$/);
  if (dashMatch) {
    return { title: dashMatch[1].trim(), courseName: dashMatch[2].trim() };
  }

  // Fall back to CATEGORIES if available
  if (categories) {
    return { title: summary, courseName: categories.trim() };
  }

  return { title: summary, courseName: "Brightspace" };
}

/**
 * Extracts a single property value from an unfolded iCal VEVENT block.
 */
function extractProperty(block: string, property: string): string | null {
  const regex = new RegExp(`^${property}(?:;[^:]*)?:(.*)$`, "m");
  const match = block.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Unescapes iCal text values (e.g. \\n → newline, \\, → comma).
 */
function unescapeICalText(text: string): string {
  return text
    .replace(/\\n/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\\\/g, "\\")
    .replace(/\\;/g, ";");
}
