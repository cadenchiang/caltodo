/**
 * Shared notification rule types between server, client, and cron.
 *
 * A "rule" is a user-defined pattern that triggers push notifications:
 *  - before_deadline: notify minutes_before each task's due time
 *  - daily_digest:    notify once per day at time_of_day with today's tasks
 */

export type NotificationKind = "before_deadline" | "daily_digest";

export interface NotificationRule {
  id: string;
  user_id: string;
  kind: NotificationKind;
  /** Set when kind === "before_deadline". Minutes before due time. */
  minutes_before: number | null;
  /** Set when kind === "daily_digest". HH:MM in the rule's timezone. */
  time_of_day: string | null;
  /** IANA timezone (e.g. "America/Los_Angeles"). Defaults to "UTC". */
  timezone: string;
  enabled: boolean;
  created_at: string;
}

/** Input shape for POST /api/notifications/rules. */
export interface CreateRuleInput {
  kind: NotificationKind;
  minutes_before?: number;
  time_of_day?: string;
  timezone?: string;
}

/** Common preset offsets surfaced in the UI. Values in minutes. */
export const BEFORE_DEADLINE_PRESETS: { label: string; minutes: number }[] = [
  { label: "10 minutes before", minutes: 10 },
  { label: "30 minutes before", minutes: 30 },
  { label: "1 hour before", minutes: 60 },
  { label: "3 hours before", minutes: 180 },
  { label: "1 day before", minutes: 1440 },
  { label: "2 days before", minutes: 2880 },
  { label: "1 week before", minutes: 10080 },
];

/**
 * Renders a human-friendly label for a rule. Used by settings UI.
 *
 * @param rule - The rule to describe.
 * @returns A short label like "1 hour before deadline" or "Daily at 8:00 AM".
 */
export function describeRule(rule: NotificationRule): string {
  if (rule.kind === "before_deadline" && rule.minutes_before !== null) {
    return formatBeforeDeadline(rule.minutes_before);
  }
  if (rule.kind === "daily_digest" && rule.time_of_day) {
    return `Daily summary at ${formatTime(rule.time_of_day)}`;
  }
  return "Notification";
}

/**
 * Formats a "minutes before" offset as a human label.
 *
 * @param minutes - Positive integer.
 * @returns Label like "1 hour before deadline" or "30 minutes before deadline".
 */
function formatBeforeDeadline(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes before deadline`;
  if (minutes < 1440) {
    const h = Math.round(minutes / 60);
    return `${h} ${h === 1 ? "hour" : "hours"} before deadline`;
  }
  if (minutes < 10080) {
    const d = Math.round(minutes / 1440);
    return `${d} ${d === 1 ? "day" : "days"} before deadline`;
  }
  const w = Math.round(minutes / 10080);
  return `${w} ${w === 1 ? "week" : "weeks"} before deadline`;
}

/**
 * Converts "HH:MM" (24h) to a 12h display ("8:00 AM").
 *
 * @param hhmm - String in HH:MM format.
 * @returns 12-hour formatted time string.
 */
function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}
