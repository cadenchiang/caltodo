/**
 * Blackboard Learn iCal client — fetches a Blackboard calendar feed URL and
 * parses VEVENT entries into NormalizedAssignment objects for the sync engine.
 *
 * Blackboard exposes a per-user feed at a path of the form
 * `/webapps/calendar/calendarFeed/<token>/learn.ics`. The body is ordinary
 * RFC 5545 iCal, so date handling is shared with the other feed-based
 * integrations via `ical-date-utils`.
 *
 * Where Blackboard differs is SUMMARY. Institutions configure it differently
 * and there is no guaranteed shape, so `parseBlackboardSummary` tries the
 * conventions seen in the wild in order and degrades to using the whole
 * string as the title. Course attribution is a best effort, never a failure.
 */

import { logger } from "@/lib/logger";
import type { NormalizedAssignment } from "@/lib/canvas-client";
import {
  extractProperty,
  extractPropertyWithTzid,
  isDateOnlyValue,
  parseDueDateWithTzid,
  unescapeICalText,
} from "@/lib/ical-date-utils";

const FETCH_TIMEOUT_MS = 15_000;

/** Course name used when the feed gives no usable attribution. */
export const BLACKBOARD_FALLBACK_COURSE = "Blackboard";

/**
 * Matches a leading course code such as "BIOL 101", "CS10" or "MATH 1B".
 *
 * Used to decide whether the text before a colon is a course or just part of
 * a title: "BIOL 101: Lab Report" splits, but "Essay: The Great Gatsby" must
 * not, or every colon in a title would be read as a course boundary.
 */
const COURSE_CODE = /^[A-Za-z]{2,8}\s?\d{1,4}[A-Za-z]{0,2}$/;

/**
 * Fetches and parses assignments from a Blackboard iCal calendar feed.
 *
 * @param calendarUrl - Full Blackboard calendar feed URL (.ics).
 * @returns Assignments parsed from the feed; empty when the feed has no events.
 * @throws When the request fails, times out, or the body is not a calendar,
 *         which is how an expired or revoked feed presents itself.
 */
export async function fetchBlackboardAssignments(
  calendarUrl: string
): Promise<NormalizedAssignment[]> {
  logger.info("fetchBlackboardAssignments: fetching iCal feed", {
    url: calendarUrl.slice(0, 60),
  });

  const res = await fetch(calendarUrl, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`Blackboard iCal fetch failed: ${res.status}`);
  }

  const icsText = await res.text();
  // A revoked or session-expired feed answers 200 with an HTML login page.
  // Without this guard the parser finds no events and the sync reports
  // success with zero assignments, hiding a broken integration.
  if (!/BEGIN:VCALENDAR/i.test(icsText)) {
    throw new Error(
      "Blackboard feed didn't return a calendar — the URL may have been reset or made private. Reconnect it."
    );
  }

  const assignments = parseBlackboardEvents(icsText);
  logger.info("fetchBlackboardAssignments: parsed events", {
    count: assignments.length,
  });
  return assignments;
}

/**
 * Parses raw iCal text from a Blackboard feed into normalized assignments.
 *
 * Events missing a UID or SUMMARY are skipped: without a UID there is no
 * stable key to upsert against, and without a SUMMARY there is nothing to
 * show. Everything else is best-effort.
 *
 * @param icsText - Raw iCal text content.
 * @returns One assignment per usable VEVENT, in feed order.
 */
export function parseBlackboardEvents(icsText: string): NormalizedAssignment[] {
  const assignments: NormalizedAssignment[] = [];
  const eventBlocks = icsText.split("BEGIN:VEVENT");

  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i].split("END:VEVENT")[0];
    if (!block) continue;

    // Unfold continuation lines (RFC 5545 section 3.1) before reading.
    const unfolded = block.replace(/\r?\n[ \t]/g, "");

    const uid = extractProperty(unfolded, "UID");
    const summary = extractProperty(unfolded, "SUMMARY");
    if (!uid || !summary) continue;

    const dtstart = extractPropertyWithTzid(unfolded, "DTSTART");
    const dtend = extractPropertyWithTzid(unfolded, "DTEND");
    const description = extractProperty(unfolded, "DESCRIPTION");
    const url = extractProperty(unfolded, "URL");
    const categories = extractProperty(unfolded, "CATEGORIES");

    // For all-day events (VALUE=DATE) RFC 5545 makes DTEND exclusive: it
    // names the day after the event, so using it directly reports the due
    // date a day late. Fall back to DTSTART there. Timed events keep DTEND.
    const dtendIsAllDay = isDateOnlyValue(dtend?.value);
    const endOrStart = dtend && !dtendIsAllDay ? dtend : (dtstart ?? dtend);
    const dueDate = parseDueDateWithTzid(
      endOrStart?.value ?? null,
      endOrStart?.tzid ?? null
    );
    // A date-only value fixes the day but says nothing about the time.
    const isAllDay = isDateOnlyValue(endOrStart?.value);

    const { title, courseName } = parseBlackboardSummary(summary, categories);

    assignments.push({
      // Namespaced so a Blackboard UID can never collide with a Brightspace
      // or Pensive one in the (user_id, source, external_id) upsert key.
      external_id: `bb-${uid.trim()}`,
      course_name: courseName,
      course_id: "blackboard",
      title: unescapeICalText(title),
      due_date: dueDate,
      due_is_all_day: isAllDay,
      source_url: url || null,
      points_possible: null,
      is_submitted: false,
      description: description
        ? unescapeICalText(description).trim() || null
        : null,
    });
  }

  return assignments;
}

/**
 * Splits a Blackboard SUMMARY into a title and a course name.
 *
 * Tried in order, most specific first:
 *   1. "Title [Course]"  — bracketed, unambiguous
 *   2. "COURSE 101: Title" — Blackboard's common prefix form, accepted only
 *      when the prefix looks like a course code, so ordinary titles
 *      containing a colon are left intact
 *   3. "Title - Course"  — spaced dash, as Brightspace uses
 *   4. CATEGORIES, when present
 *
 * @param summary - Raw SUMMARY value.
 * @param categories - Raw CATEGORIES value, often the course. May be null.
 * @returns The title and the best available course name, never empty.
 */
export function parseBlackboardSummary(
  summary: string,
  categories: string | null
): { title: string; courseName: string } {
  const trimmed = summary.trim();

  const bracket = trimmed.match(/^(.+?)\s*\[(.+)\]\s*$/);
  if (bracket) {
    return { title: bracket[1].trim(), courseName: bracket[2].trim() };
  }

  // Note the reversed order versus the dash form: Blackboard puts the course
  // first. Gated on COURSE_CODE so "Essay: The Great Gatsby" stays one title.
  const colon = trimmed.match(/^([^:]+):\s*(.+)$/);
  if (colon && COURSE_CODE.test(colon[1].trim())) {
    return { title: colon[2].trim(), courseName: colon[1].trim() };
  }

  const dash = trimmed.match(/^(.+?)\s+-\s+(.+)$/);
  if (dash) {
    return { title: dash[1].trim(), courseName: dash[2].trim() };
  }

  if (categories?.trim()) {
    return { title: trimmed, courseName: categories.trim() };
  }

  return { title: trimmed, courseName: BLACKBOARD_FALLBACK_COURSE };
}
