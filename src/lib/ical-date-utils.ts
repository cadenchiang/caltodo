/**
 * Shared iCal date/time parsing utilities.
 * Handles TZID-qualified datetimes by converting local times to UTC.
 * Used by canvas-ical-client.ts and pensieve-client.ts.
 */

import { logger } from "@/lib/logger";

/**
 * Result of extracting a property that may include a TZID parameter.
 */
export interface PropertyWithTzid {
  value: string;
  tzid: string | null;
}

/**
 * Extracts a property value along with its TZID parameter from an unfolded
 * iCal VEVENT block. Used for DTSTART/DTEND which may specify a timezone.
 *
 * @param block - Unfolded iCal text block
 * @param property - Property name to extract (e.g. "DTSTART", "DTEND")
 * @returns Object with value and tzid, or null if property not found
 */
export function extractPropertyWithTzid(
  block: string,
  property: string
): PropertyWithTzid | null {
  const regex = new RegExp(`^${property}((?:;[^:]*)?):(.*)$`, "m");
  const match = block.match(regex);
  if (!match) return null;

  const params = match[1];
  const value = match[2].trim();

  const tzidMatch = params.match(/;TZID=([^;:]+)/i);
  const tzid = tzidMatch ? tzidMatch[1] : null;

  return { value, tzid };
}

/**
 * Reports whether an iCal DTSTART/DTEND value carries a date but no time.
 *
 * RFC 5545 date-only values (`DTSTART;VALUE=DATE:20260903`) say which day
 * something is due and nothing more. Canvas uses this shape for most
 * assignments, so callers must not present a time for them.
 *
 * @param raw - Raw iCal value, or null
 * @returns True for the YYYYMMDD form, false for a datetime or null
 * @remarks {@link parseDueDateWithTzid} anchors these at noon UTC so the
 *          calendar day survives conversion to any timezone. That noon is a
 *          placeholder, not a deadline: rendered in Pacific it reads 5:00 AM,
 *          which is how every all-day assignment came to claim a 5am due time.
 */
export function isDateOnlyValue(raw: string | null | undefined): boolean {
  return !!raw && /^\d{8}$/.test(raw.trim());
}

/**
 * Parses a due date from iCal date/datetime formats. When a TZID is provided,
 * converts the local time to UTC. Without TZID, times ending in Z are treated
 * as UTC; times without Z are assumed UTC (legacy fallback).
 *
 * @param raw - Raw iCal date string (YYYYMMDD or YYYYMMDDTHHmmss with optional Z)
 * @param tzid - IANA timezone identifier from TZID parameter, or null
 * @returns ISO 8601 UTC date string or null if unparseable
 */
export function parseDueDateWithTzid(
  raw: string | null,
  tzid: string | null
): string | null {
  if (!raw) return null;

  // DATE format: YYYYMMDD (all-day event). Anchor at NOON UTC, not midnight:
  // midnight UTC lands on the *previous* calendar day once rendered in any
  // west-of-UTC timezone (e.g. America/Los_Angeles, the bCourses audience),
  // which made all-day assignments show up a day early. Noon UTC keeps the
  // same calendar day for every offset from UTC-12 through UTC+11.
  if (isDateOnlyValue(raw)) {
    const y = raw.slice(0, 4);
    const m = raw.slice(4, 6);
    const d = raw.slice(6, 8);
    return `${y}-${m}-${d}T12:00:00Z`;
  }

  // DATETIME format: YYYYMMDDTHHmmss with optional Z suffix
  const dtMatch = raw.match(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/
  );
  if (!dtMatch) return null;

  const [, y, mo, d, h, mi, s, zSuffix] = dtMatch;

  // If already UTC (has Z suffix) or no TZID, treat as UTC
  if (zSuffix === "Z" || !tzid) {
    return `${y}-${mo}-${d}T${h}:${mi}:${s}Z`;
  }

  // TZID present: convert local time in that timezone to UTC
  return localToUtc(
    Number(y),
    Number(mo),
    Number(d),
    Number(h),
    Number(mi),
    Number(s),
    tzid
  );
}

/**
 * Converts a local datetime in a given IANA timezone to a UTC ISO 8601 string.
 * Uses Intl.DateTimeFormat to determine the correct UTC offset (handles DST).
 *
 * @param y - Year
 * @param mo - Month (1-12)
 * @param d - Day
 * @param h - Hour (0-23)
 * @param mi - Minute
 * @param s - Second
 * @param tzid - IANA timezone identifier (e.g. "America/Los_Angeles")
 * @returns ISO 8601 UTC string, or null if the timezone is invalid
 */
function localToUtc(
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
  s: number,
  tzid: string
): string | null {
  try {
    // Build a UTC Date from the local components as an initial guess
    const guessUtc = new Date(Date.UTC(y, mo - 1, d, h, mi, s));

    // Determine what local time that UTC instant maps to in the given timezone
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tzid,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(guessUtc);
    const get = (type: string) =>
      Number(parts.find((p) => p.type === type)?.value ?? "0");

    const localH = get("hour");
    const localMi = get("minute");
    const localS = get("second");
    const localD = get("day");
    const localMo = get("month");
    const localY = get("year");

    // Compute offset: difference between the local components we want and what
    // the guess mapped to. Adjust the guess by that delta.
    const wantMs = Date.UTC(y, mo - 1, d, h, mi, s);
    const gotLocalMs = Date.UTC(
      localY,
      localMo - 1,
      localD,
      localH,
      localMi,
      localS
    );
    const offsetMs = gotLocalMs - guessUtc.getTime();

    // The correct UTC time is: wanted_local - offset
    const correctUtc = new Date(wantMs - offsetMs);
    return correctUtc.toISOString().replace(/\.\d{3}Z$/, "Z");
  } catch (err) {
    logger.warn("localToUtc: invalid timezone, falling back to UTC", {
      tzid,
      error: err instanceof Error ? err.message : String(err),
    });
    return `${String(y).padStart(4, "0")}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}T${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}:${String(s).padStart(2, "0")}Z`;
  }
}

/**
 * Extracts a single property value from an unfolded iCal VEVENT block.
 *
 * Ignores any parameters between the property name and the colon, so
 * `SUMMARY;LANGUAGE=en:Essay` yields `Essay`.
 *
 * @param block - Unfolded VEVENT body (continuation lines already joined).
 * @param property - Property name to read, e.g. "SUMMARY".
 * @returns The trimmed value, or null when the property is absent.
 */
export function extractProperty(block: string, property: string): string | null {
  const regex = new RegExp(`^${property}(?:;[^:]*)?:(.*)$`, "m");
  const match = block.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Unescapes an iCal TEXT value per RFC 5545 section 3.3.11.
 *
 * Backslash sequences are decoded in one pass so that an escaped backslash
 * cannot be re-read as the start of another escape.
 *
 * @param text - Raw property value straight from the feed.
 * @returns The value with `\\n`, `\\,`, `\;` and `\\\\` decoded.
 */
export function unescapeICalText(text: string): string {
  return text.replace(/\\([nN,;\\])/g, (_, ch: string) =>
    ch === "n" || ch === "N" ? "\n" : ch
  );
}
