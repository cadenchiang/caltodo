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
 * Returns the next day after dateStr in iCal DATE format (YYYYMMDD).
 * Used for all-day event DTEND, which is exclusive per RFC 5545.
 *
 * @param dateStr - Date in YYYY-MM-DD format
 * @returns Next day in YYYYMMDD format
 */
export function formatICalDateNextDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

/**
 * Converts a 24h time string (HH:MM or HH:MM:SS) to 12h format (e.g. "11:59pm").
 *
 * @param timeStr - Time in HH:MM or HH:MM:SS format
 * @returns Formatted 12h time string like "11:59pm" or "2:00am"
 */
export function format12Hour(timeStr: string): string {
  const [hStr, mStr] = timeStr.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr;
  const suffix = h >= 12 ? "pm" : "am";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m}${suffix}`;
}

/**
 * Returns a DTSTAMP value for the current UTC time in iCal format.
 *
 * @returns Current UTC timestamp as YYYYMMDDTHHMMSSZ
 */
export function formatDTStamp(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const mo = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const h = String(now.getUTCHours()).padStart(2, "0");
  const mi = String(now.getUTCMinutes()).padStart(2, "0");
  const s = String(now.getUTCSeconds()).padStart(2, "0");
  return `${y}${mo}${d}T${h}${mi}${s}Z`;
}

/**
 * Builds a DESCRIPTION property value from task metadata.
 *
 * @param task - Task object
 * @returns Human-readable description string
 */
function buildDescription(task: Task): string {
  const parts: string[] = [];

  if (task.course_name) {
    parts.push(`Course: ${task.course_name}`);
  }
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
 * Course name is placed in DESCRIPTION, not SUMMARY.
 *
 * @param tasks - Array of Task objects (may include tasks without due_date, which are skipped)
 * @param calendarName - Display name for the calendar (default: "caltodo")
 * @returns Complete iCal VCALENDAR string with CRLF line endings
 */
export function generateICalFeed(tasks: Task[], calendarName = "caltodo"): string {
  const lines: string[] = [];

  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push(`PRODID:-//${calendarName}//EN`);
  lines.push(`X-WR-CALNAME:${escapeICalText(calendarName)}`);
  lines.push("CALSCALE:GREGORIAN");
  lines.push("METHOD:PUBLISH");

  const stamp = formatDTStamp();

  for (const task of tasks) {
    if (!task.due_date) continue;

    // Build summary — title only, no course prefix
    let summary = task.title;
    if (task.due_time) {
      summary += ` due @ ${format12Hour(task.due_time)}`;
    }
    const description = buildDescription(task);

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${task.id}@caltodo`);
    lines.push(`DTSTAMP:${stamp}`);

    // Always all-day: DTEND must be exclusive (next day) per RFC 5545
    lines.push(`DTSTART;VALUE=DATE:${formatICalDate(task.due_date)}`);
    lines.push(`DTEND;VALUE=DATE:${formatICalDateNextDay(task.due_date)}`);

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
