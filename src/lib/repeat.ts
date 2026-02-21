/**
 * Utility functions for computing repeating task dates and labels.
 */

type RepeatUnit = "day" | "week" | "month";

/**
 * Computes the next due date by adding interval * unit to the current due date.
 * Handles month overflow (e.g. Jan 31 + 1 month = Feb 28).
 *
 * @param currentDueDate - ISO date string "YYYY-MM-DD"
 * @param interval - Number of units to add (must be > 0)
 * @param unit - The time unit: "day", "week", or "month"
 * @returns Next due date as "YYYY-MM-DD" string
 */
export function computeNextDueDate(
  currentDueDate: string,
  interval: number,
  unit: RepeatUnit,
): string {
  const date = new Date(currentDueDate + "T00:00:00");
  if (isNaN(date.getTime())) return currentDueDate;

  switch (unit) {
    case "day":
      date.setDate(date.getDate() + interval);
      break;
    case "week":
      date.setDate(date.getDate() + interval * 7);
      break;
    case "month": {
      const targetMonth = date.getMonth() + interval;
      const originalDay = date.getDate();
      date.setMonth(targetMonth, 1);
      const maxDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      date.setDate(Math.min(originalDay, maxDay));
      break;
    }
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns a human-readable label for a repeat configuration.
 *
 * @param interval - Number of units (must be > 0)
 * @param unit - The time unit: "day", "week", or "month"
 * @returns Label like "Daily", "Weekly", "Every 2 weeks", etc.
 */
export function getRepeatLabel(interval: number, unit: RepeatUnit): string {
  if (interval === 1) {
    if (unit === "day") return "Daily";
    if (unit === "week") return "Weekly";
    if (unit === "month") return "Monthly";
  }
  if (interval === 2 && unit === "week") return "Biweekly";

  const unitPlural = interval === 1 ? unit : `${unit}s`;
  return `Every ${interval} ${unitPlural}`;
}

/**
 * Determines whether a repeating task should spawn its next occurrence.
 * Checks both end-date and end-count conditions.
 *
 * @param nextDueDate - The computed next due date "YYYY-MM-DD"
 * @param repeatEndDate - End date threshold "YYYY-MM-DD" or null (no end date)
 * @param repeatEndCount - Max total occurrences or null (no count limit)
 * @returns true if the next occurrence should be created
 */
export function shouldSpawnNext(
  nextDueDate: string,
  repeatEndDate: string | null,
  repeatEndCount: number | null,
): boolean {
  // Check end date: next occurrence must not exceed the end date
  if (repeatEndDate) {
    if (nextDueDate > repeatEndDate) return false;
  }

  // Check end count: if count is 1 or less, this was the last occurrence
  // (count represents remaining occurrences including current; when current
  // is completed, count was already decremented before calling this)
  if (repeatEndCount !== null && repeatEndCount !== undefined) {
    if (repeatEndCount <= 1) return false;
  }

  return true;
}
