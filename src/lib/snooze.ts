/**
 * Shared "Hide for..." (snooze) vocabulary: the preset durations, the
 * sentinel for "until I unhide", and the label the toast uses. One module
 * so the row menu, the detail panel and the action bar offer the same list.
 */

/** One snooze preset: what the menu says and how long it hides the task. */
export interface SnoozePreset {
  label: string;
  hours: number;
}

/** Duration presets for the "Hide for..." submenu. */
export const SNOOZE_PRESETS: readonly SnoozePreset[] = [
  { label: "1 hour", hours: 1 },
  { label: "3 hours", hours: 3 },
  { label: "12 hours", hours: 12 },
  { label: "1 day", hours: 24 },
  { label: "3 days", hours: 72 },
  { label: "1 week", hours: 168 },
] as const;

/** Far-future duration used for "Until I unhide" (about 100 years). */
export const FOREVER_HOURS = 876_000;

/**
 * Human label for a snooze duration, used in the confirming toast
 * ("Hidden for 1 week").
 *
 * @param hours - Duration in hours; FOREVER_HOURS reads as "until you unhide it"
 * @returns A short phrase without a leading "for"
 * @remarks Presets return their menu label; other values round to the
 *          nearest sensible unit (minutes under an hour, hours under a day,
 *          days under a week, then weeks).
 */
export function formatSnoozeDuration(hours: number): string {
  if (hours >= FOREVER_HOURS) return "until you unhide it";
  const preset = SNOOZE_PRESETS.find((p) => p.hours === hours);
  if (preset) return preset.label;
  if (hours < 1) {
    const minutes = Math.max(1, Math.round(hours * 60));
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  }
  if (hours < 24) {
    const rounded = Math.round(hours);
    return `${rounded} ${rounded === 1 ? "hour" : "hours"}`;
  }
  if (hours < 24 * 7) {
    const days = Math.round(hours / 24);
    return `${days} ${days === 1 ? "day" : "days"}`;
  }
  const weeks = Math.round(hours / (24 * 7));
  return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
}

/**
 * Reports whether a task is currently hidden by a snooze.
 *
 * @param snoozedUntil - The task's snoozed_until timestamp, if any
 * @param now - Reference time in epoch ms
 * @returns True while the snooze has not yet expired
 */
export function isSnoozed(snoozedUntil: string | null | undefined, now: number): boolean {
  if (!snoozedUntil) return false;
  const until = new Date(snoozedUntil).getTime();
  return Number.isFinite(until) && until > now;
}
