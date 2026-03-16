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
    const url = extractProperty(unfolded, "URL");
    const status = extractProperty(unfolded, "STATUS");

    if (!uid || !summary) continue;

    const isSubmitted = detectSubmitted(status, description);

    // Log raw iCal fields for debugging submission detection
    if (status || description) {
      logger.info("parseICalEvents: VEVENT fields", {
        uid: uid?.slice(0, 30),
        summary: summary?.slice(0, 50),
        status,
        descriptionSnippet: description?.slice(0, 100),
        isSubmitted,
      });
    }

    // Parse the due date from DTSTART or DTEND
    const dueDate = parseDueDate(dtend || dtstart);

    // Extract late_due_date from description before cleaning
    let lateDueDate: string | null = null;
    if (description) {
      const lateDueMatch = description.match(/late\s*due[:\s]+(\S+)/i);
      if (lateDueMatch) {
        const candidate = lateDueMatch[1];
        // Validate it looks like a date (ISO format or iCal YYYYMMDD/YYYYMMDDTHHmmss)
        const isValidDate =
          /^\d{4}-\d{2}-\d{2}/.test(candidate) ||
          /^\d{8}(T\d{6}Z?)?$/.test(candidate);
        lateDueDate = isValidDate ? candidate : null;
      }
    }

    // Strip redundant Class/Late due lines from description
    let cleanDescription: string | null = null;
    if (description) {
      cleanDescription = unescapeICalText(description)
        .replace(/^class:\s*.+$/gim, "")
        .replace(/^late\s*due[:\s]+\S+$/gim, "")
        .trim() || null;
    }

    const courseName = extractCourseName(summary, description);

    // Strip course name suffix from title (e.g. "Assignment 1 - test_testcourse" → "Assignment 1")
    let cleanTitle = unescapeICalText(summary);
    if (courseName && courseName !== "Pensive") {
      cleanTitle = cleanTitle
        .replace(new RegExp(`\\s*[-–—]\\s*${escapeRegExp(courseName)}\\s*$`, "i"), "")
        .trim();
    }

    assignments.push({
      external_id: `pensieve-${uid}`,
      course_name: courseName,
      course_id: "pensieve",
      title: cleanTitle,
      due_date: dueDate,
      late_due_date: lateDueDate,
      source_url: url || null,
      points_possible: null,
      is_submitted: isSubmitted,
      description: cleanDescription,
    });
  }

  return assignments;
}

/**
 * Detects whether a Pensieve assignment has been submitted.
 * Checks the iCal STATUS property and description for submission indicators.
 *
 * @param status - The VEVENT STATUS property value (e.g. "COMPLETED", "CONFIRMED")
 * @param description - The VEVENT DESCRIPTION value (may contain "submitted", "graded")
 * @returns true if the assignment appears to have been submitted
 */
function detectSubmitted(status: string | null, description: string | null): boolean {
  if (status) {
    const s = status.toUpperCase();
    if (s === "COMPLETED" || s === "CANCELLED") return true;
  }
  if (description) {
    // Unescape iCal text so \n becomes real newline for accurate word boundary matching
    const text = unescapeICalText(description);
    if (/\b(submitted|graded|completed)\b/i.test(text)) return true;
  }
  return false;
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
 * @returns Extracted course name, or "Pensive" as fallback
 */
function extractCourseName(summary: string, description: string | null): string {
  // Try "Course: Assignment" pattern in summary
  const colonIdx = summary.indexOf(":");
  if (colonIdx > 0 && colonIdx < summary.length - 1) {
    const prefix = summary.slice(0, colonIdx).trim();
    // Only use as course name if it looks like a course code (contains a number
    // or matches common patterns like "CS 61A", "MATH 54", "EECS 16B").
    // This prevents greedy extraction where "Homework: Part 1" yields "Homework".
    const looksLikeCourseCode = /\d/.test(prefix) ||
      /^[A-Z]{2,6}\s+\d/i.test(prefix);
    if (
      looksLikeCourseCode &&
      prefix.length > 0 &&
      prefix.length < 40 &&
      !prefix.includes("//")
    ) {
      return unescapeICalText(prefix);
    }
  }

  // Try extracting from description (stop at iCal \n escape to avoid capturing extra lines)
  if (description) {
    const courseMatch = description.match(/(?:course|class):\s*(.+?)(?:\\n|$)/i);
    if (courseMatch) {
      return unescapeICalText(courseMatch[1].trim());
    }
  }

  // Try "Title - CourseName" suffix pattern in summary
  const dashMatch = summary.match(/\s+[-–—]\s+(.+)$/);
  if (dashMatch) {
    return unescapeICalText(dashMatch[1].trim());
  }

  return "Pensive";
}

/**
 * Escapes special regex characters in a string for safe use in RegExp constructor.
 *
 * @param str - Raw string to escape
 * @returns Escaped string safe for RegExp
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
