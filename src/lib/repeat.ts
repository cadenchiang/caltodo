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
