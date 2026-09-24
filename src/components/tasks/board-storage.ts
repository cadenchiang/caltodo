/**
 * localStorage persistence shared by the list and board views: column
 * name aliases (renames), the board column order, and the completed
 * auto-hide window. One module so the two views never disagree on keys.
 */

/** Shared localStorage key for column/group name aliases. */
const COLUMN_ALIASES_KEY = "caltodo_board_column_aliases";

/** localStorage key for saved board column order. */
const COLUMN_ORDER_KEY = "caltodo_board_column_order";

/** localStorage key for completed task auto-hide duration (in hours). */
const COMPLETED_HIDE_KEY = "caltodo_completed_hide_hours";

/** Default auto-hide duration: 24 hours. */
const DEFAULT_HIDE_HOURS = 24;

/** Preset auto-hide options shown in the settings menu. */
export const HIDE_OPTIONS = [
  { label: "6 hours", hours: 6 },
  { label: "12 hours", hours: 12 },
  { label: "24 hours", hours: 24 },
  { label: "3 days", hours: 72 },
  { label: "7 days", hours: 168 },
  { label: "Never", hours: 0 },
] as const;

/**
 * Loads column name aliases from localStorage.
 *
 * @returns Map of original course_name to display alias; empty on any failure
 */
export function loadColumnAliases(): Map<string, string> {
  try {
    const raw = localStorage.getItem(COLUMN_ALIASES_KEY);
    if (!raw) return new Map();
    const entries: Array<[string, string]> = JSON.parse(raw);
    return new Map(entries);
  } catch {
    return new Map();
  }
}

/**
 * Saves column name aliases to localStorage.
 *
 * @param aliases - Map of original course_name to display alias
 */
export function saveColumnAliases(aliases: Map<string, string>): void {
  try {
    localStorage.setItem(COLUMN_ALIASES_KEY, JSON.stringify([...aliases.entries()]));
  } catch {
    // non-critical
  }
}

/**
 * Loads saved column order from localStorage.
 *
 * @returns Column names in saved order, or an empty array on failure
 */
export function loadColumnOrder(): string[] {
  try {
    const raw = localStorage.getItem(COLUMN_ORDER_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

/**
 * Saves column order to localStorage.
 *
 * @param order - Column names in desired order
 */
export function saveColumnOrder(order: string[]): void {
  try {
    localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(order));
  } catch {
    // non-critical
  }
}

/**
 * Loads the completed task auto-hide duration from localStorage.
 *
 * @returns Duration in hours, or the default (24) if not set or unreadable
 */
export function loadHideHours(): number {
  try {
    const raw = localStorage.getItem(COMPLETED_HIDE_KEY);
    if (raw === null) return DEFAULT_HIDE_HOURS;
    const val = parseInt(raw, 10);
    return isNaN(val) ? DEFAULT_HIDE_HOURS : val;
  } catch {
    return DEFAULT_HIDE_HOURS;
  }
}

/**
 * Saves the completed task auto-hide duration to localStorage.
 *
 * @param hours - Window in hours; 0 means never hide
 */
export function saveHideHours(hours: number): void {
  try {
    localStorage.setItem(COMPLETED_HIDE_KEY, String(hours));
  } catch {
    // non-critical
  }
}
