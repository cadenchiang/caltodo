/**
 * iCal (RFC 5545) feed generation utilities.
 * Produces a VCALENDAR string from an array of tasks for calendar subscription.
 */

import type { Task } from "@/lib/types";

/**
 * Escapes special characters in text per RFC 5545 Section 3.3.11.
 * Backslash, semicolon, comma, and newlines must be escaped.
 *
 * @param text - Raw text to escape
 * @returns Escaped text safe for iCal property values
 */
export function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Folds a content line at 75 octets per RFC 5545 Section 3.1.
 * Continuation lines begin with a single space character.
 *
 * @param line - A single content line (no CRLF)
 * @returns Folded line(s) joined with CRLF
 */
export function foldLine(line: string): string {
  const MAX_OCTETS = 75;
  const parts: string[] = [];
  let remaining = line;

  // First line: up to 75 octets
  let chunk = "";
  let byteLen = 0;
  let i = 0;
  while (i < remaining.length) {
    const charBytes = Buffer.byteLength(remaining[i], "utf-8");
    if (byteLen + charBytes > MAX_OCTETS) break;
    chunk += remaining[i];
    byteLen += charBytes;
    i++;
  }
  parts.push(chunk);
  remaining = remaining.slice(i);

  // Continuation lines: space prefix counts as 1 octet, leaving 74 for content
  while (remaining.length > 0) {
    chunk = "";
    byteLen = 0;
    i = 0;
    while (i < remaining.length) {
      const charBytes = Buffer.byteLength(remaining[i], "utf-8");
      if (byteLen + charBytes > MAX_OCTETS - 1) break;
      chunk += remaining[i];
      byteLen += charBytes;
      i++;
    }
    parts.push(" " + chunk);
    remaining = remaining.slice(i);
  }

  return parts.join("\r\n");
}

/**
 * Converts a date string (YYYY-MM-DD) to iCal DATE format (YYYYMMDD).
 *
 * @param dateStr - Date in YYYY-MM-DD format
 * @returns Date in YYYYMMDD format
 */
export function formatICalDate(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

/**
 * Builds a DESCRIPTION property value from task metadata.
 *
 * @param task - Task object
 * @returns Human-readable description string
 */
function buildDescription(task: Task): string {
  const parts: string[] = [];

  if (task.description) {
    parts.push(task.description);
  }
  if (task.source_url) {
    parts.push(`Link: ${task.source_url}`);
  }
  if (task.points_possible !== null && task.points_possible !== undefined) {
    parts.push(`Points: ${task.points_possible}`);
  }
  parts.push(`Status: ${task.is_completed ? "Completed" : "Pending"}`);

  return parts.join("\n");
}

/**
 * Generates a complete VCALENDAR string from an array of tasks.
 * Only tasks with a due_date are included as all-day VEVENTs.
 * SUMMARY includes [course_name] prefix if present.
 *
 * @param tasks - Array of Task objects (may include tasks without due_date, which are skipped)
 * @param calendarName - Display name for the calendar (default: "toodoocal")
 * @returns Complete iCal VCALENDAR string with CRLF line endings
 */
export function generateICalFeed(tasks: Task[], calendarName = "toodoocal"): string {
  const lines: string[] = [];

  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push(`PRODID:-//${calendarName}//EN`);
  lines.push(`X-WR-CALNAME:${escapeICalText(calendarName)}`);
  lines.push("CALSCALE:GREGORIAN");
  lines.push("METHOD:PUBLISH");

  for (const task of tasks) {
    if (!task.due_date) continue;

    const dateStr = formatICalDate(task.due_date);
    const summary = task.course_name
      ? `[${task.course_name}] ${task.title}`
      : task.title;
    const description = buildDescription(task);

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${task.id}@toodoocal`);
    lines.push(`DTSTART;VALUE=DATE:${dateStr}`);
    lines.push(`DTEND;VALUE=DATE:${dateStr}`);
    lines.push(foldLine(`SUMMARY:${escapeICalText(summary)}`));
    lines.push(foldLine(`DESCRIPTION:${escapeICalText(description)}`));

    if (task.source) {
      lines.push(`CATEGORIES:${task.source}`);
    }

    lines.push("TRANSP:TRANSPARENT");
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return lines.join("\r\n") + "\r\n";
}
