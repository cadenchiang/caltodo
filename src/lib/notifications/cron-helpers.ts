/**
 * Pure helpers used by the push-reminders cron. Kept separate from the
 * route so they can be unit-tested without a Next/Supabase environment.
 */

/**
 * Combines a date string (YYYY-MM-DD) and optional wall-clock time (HH:MM)
 * into a Date interpreted in the given IANA timezone. Returns null if the
 * date string is malformed.
 *
 * Tasks store wall-clock dates/times without a timezone; the rule's
 * timezone tells us how to anchor them to an actual instant.
 *
 * @param date - YYYY-MM-DD
 * @param time - HH:MM, HH:MM:SS, or null (defaulted to 23:59, end of day)
 * @param tz   - IANA timezone name (e.g. "America/Los_Angeles")
 * @returns UTC Date, or null if date is malformed.
 * @example parseDueAt("2026-04-15", "09:00", "America/Los_Angeles")
 */
export function parseDueAt(
  date: string,
  time: string | null,
  tz: string
): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const t = time && /^\d{2}:\d{2}/.test(time) ? time.slice(0, 5) : "23:59";
  const naive = new Date(`${date}T${t}:00Z`);
  if (isNaN(naive.getTime())) return null;
  const offsetMin = tzOffsetMinutes(naive, tz);
  return new Date(naive.getTime() - offsetMin * 60_000);
}

/**
 * Returns the wall-clock fields of `now` as observed in the given IANA
 * timezone (hours/minutes in 24h + the local calendar date as YYYY-MM-DD).
 *
 * @param now - Any instant.
 * @param tz  - IANA timezone name.
 */
export function nowInTz(
  now: Date,
  tz: string
): { hours: number; minutes: number; dateIso: string } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(now).map((p) => [p.type, p.value])
  ) as Record<string, string>;
  return {
    hours: Number(parts.hour),
    minutes: Number(parts.minute),
    dateIso: `${parts.year}-${parts.month}-${parts.day}`,
  };
}

/**
 * Returns the minute offset of `tz` at `instant`. Positive = ahead of UTC.
 * E.g. "America/Los_Angeles" in April → -420 (UTC-7 PDT).
 */
export function tzOffsetMinutes(instant: Date, tz: string): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(instant).map((p) => [p.type, p.value])
  ) as Record<string, string>;
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  return Math.round((asUtc - instant.getTime()) / 60_000);
}

/**
 * Enumerates the unique YYYY-MM-DD (UTC) days the given range spans.
 * Used to narrow the SQL `due_date IN (...)` clause so we only scan a
 * few days at most.
 */
export function uniqueDays(range: [Date, Date]): string[] {
  const set = new Set<string>();
  const day = 24 * 60 * 60 * 1000;
  // Pad ONE day on BOTH sides. due_date is stored as the user's LOCAL calendar
  // date, but this range is in UTC; for a timezone west of UTC a task due late
  // local time maps to the next UTC day, so its local due_date is the previous
  // UTC day. Without the backward pad, `due_date IN (...)` dropped those tasks
  // and their before-deadline reminders silently never fired.
  for (let t = range[0].getTime() - day; t <= range[1].getTime() + day; t += day) {
    set.add(new Date(t).toISOString().slice(0, 10));
  }
  return [...set];
}

/**
 * Renders a human-friendly "Due in X" body string for a reminder push.
 *
 * @param minutesAway - Minutes between now and the deadline (positive).
 */
export function formatLead(minutesAway: number): string {
  if (minutesAway >= 2880) return `Due in ${Math.round(minutesAway / 1440)} days`;
  if (minutesAway >= 1440) return `Due tomorrow`;
  if (minutesAway >= 120) return `Due in ${Math.round(minutesAway / 60)} hours`;
  if (minutesAway >= 60) return `Due in about an hour`;
  return `Due in ${minutesAway} min`;
}

/**
 * Renders a preset-style label for a "before deadline" rule. Mirrors the
 * preset labels the settings UI shows.
 *
 * @param minutes - Positive integer lead time.
 */
export function formatBeforeLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  if (minutes < 1440) {
    const h = Math.round(minutes / 60);
    return `${h} ${h === 1 ? "hour" : "hours"}`;
  }
  if (minutes < 10080) {
    const d = Math.round(minutes / 1440);
    return `${d} ${d === 1 ? "day" : "days"}`;
  }
  const w = Math.round(minutes / 10080);
  return `${w} ${w === 1 ? "week" : "weeks"}`;
}

/**
 * Renders an HH:MM (24h) string as a 12h display label ("8:00 AM").
 */
export function formatTimeLabel(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

/**
 * How far ahead one run reaches, in minutes. Matches the daily schedule in
 * vercel.json: every run covers the reminders due until the next run.
 */
export const SCAN_WINDOW_MIN = 24 * 60;

/** Minutes of lookback before the target moment, for schedule jitter. */
export const REMINDER_WINDOW_BEFORE_MIN = 7;

/**
 * Whether a due moment falls inside one run's reminder window.
 *
 * @param dueAt - When the task is due
 * @param now - The run's clock
 * @param minutesBefore - The rule's lead time
 * @returns True when the reminder for this task belongs to this run
 */
export function isDueInScanWindow(dueAt: Date, now: Date, minutesBefore: number): boolean {
  const target = now.getTime() + minutesBefore * 60_000;
  const lo = target - REMINDER_WINDOW_BEFORE_MIN * 60_000;
  const hi = target + SCAN_WINDOW_MIN * 60_000;
  const at = dueAt.getTime();
  return at >= lo && at <= hi;
}

/**
 * Whether a digest scheduled at `scheduledMin` (minutes past local midnight)
 * should go out on a run at `localMin`. With one run a day, the answer is yes
 * whenever the scheduled time is within one scan window of now, in either
 * direction; the per-day bucket then keeps it to one send.
 *
 * @param localMin - Minutes past local midnight at the run
 * @param scheduledMin - Minutes past local midnight the rule asks for
 * @returns True when this run should send the digest
 */
export function isDigestDue(localMin: number, scheduledMin: number): boolean {
  return Math.abs(localMin - scheduledMin) <= SCAN_WINDOW_MIN;
}
