/**
 * One room per class (D4).
 *
 * The sync stores one `courses` row per (source, external_id), so a class
 * that a student sees on Canvas and Gradescope is two rows, and a class
 * that the sync already canonicalized (course-name-merge.ts) shares one
 * name across those rows. This module groups course rows by that canonical
 * name, picks a stable primary row per group (the oldest, then the lowest
 * id) that is the same for every viewer, and classifies rooms whose name
 * carries a past term.
 *
 * Pure functions only; the boards route and the sidebar both use them.
 *
 * @module chat-room-groups
 */

import { getCurrentTerm, termSpellings, type AcademicTerm, type Season } from "@/lib/academic-term";

/** The subset of a course row grouping needs. */
export interface GroupableCourse {
  id: string;
  source: string;
  name: string;
  created_at: string;
}

/** A group of sibling course rows that are one class. */
export interface RoomGroup<T extends GroupableCourse> {
  /** Normalized name shared by every row in the group. */
  key: string;
  /** The row that is the chat room for this class. */
  primary: T;
  /** Every row in the group, primary included. */
  rows: T[];
  /** Distinct sources across the rows, in first-seen order. */
  sources: string[];
}

/**
 * Normalizes a course name for grouping: collapse whitespace, trim, lowercase.
 *
 * @param name - Raw course name
 * @returns The grouping key
 */
export function roomGroupKey(name: string): string {
  return name.replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * Orders rows so the primary is first: oldest created_at, then lowest id.
 * Both are immutable, so every viewer computes the same primary.
 */
function byAge(a: GroupableCourse, b: GroupableCourse): number {
  const at = Date.parse(a.created_at) || 0;
  const bt = Date.parse(b.created_at) || 0;
  if (at !== bt) return at - bt;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/**
 * Groups course rows into rooms by canonical name.
 *
 * @param rows - Course rows (any viewer's or everyone's)
 * @returns One group per class. System rows are never merged with anything
 *          and each forms its own group.
 */
export function groupRooms<T extends GroupableCourse>(rows: readonly T[]): RoomGroup<T>[] {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const key = row.source === "system" ? `system:${row.id}` : roomGroupKey(row.name);
    const group = groups.get(key);
    if (group) group.push(row);
    else groups.set(key, [row]);
  }

  const result: RoomGroup<T>[] = [];
  for (const [key, members] of groups) {
    const sorted = [...members].sort(byAge);
    const sources: string[] = [];
    for (const m of sorted) if (!sources.includes(m.source)) sources.push(m.source);
    result.push({ key, primary: sorted[0], rows: sorted, sources });
  }
  return result;
}

/** Display label for a course source, used by the platform badge. */
export function platformLabel(source: string): string {
  switch (source) {
    case "canvas": return "Canvas";
    case "gradescope": return "Gradescope";
    case "pensieve": return "Pensieve";
    case "brightspace": return "Brightspace";
    case "blackboard": return "Blackboard";
    case "classroom": return "Classroom";
    case "system": return "caltodo";
    default: return source.charAt(0).toUpperCase() + source.slice(1);
  }
}

const SEASON_ORDER: Season[] = ["Spring", "Summer", "Fall"];

/** Whether term `a` is strictly before term `b` in the calendar. */
function termBefore(a: AcademicTerm, b: AcademicTerm): boolean {
  if (a.year !== b.year) return a.year < b.year;
  return SEASON_ORDER.indexOf(a.season) < SEASON_ORDER.indexOf(b.season);
}

/**
 * Reports whether a course name carries a term before the current one.
 *
 * @param courseName - The course name, e.g. "CS 61A (Fall 2025)"
 * @param date - What "now" is; defaults to the current date
 * @returns true only when a past term is spelled out in the name. A name
 *          with no term, or with the current or a future term, is not past.
 * @remarks Matches the spellings academic-term.ts knows ("fall 2025",
 *          "fa25", "f25", "f'25", ...). Short spellings are matched on word
 *          boundaries so "fa25" does not fire inside another token.
 */
export function isPastTermCourse(courseName: string, date: Date = new Date()): boolean {
  const name = courseName.toLowerCase();
  const current = getCurrentTerm(date);
  const year = date.getFullYear();
  for (let y = year - 6; y <= year; y++) {
    for (const season of SEASON_ORDER) {
      const term = { season, year: y };
      if (!termBefore(term, current)) continue;
      for (const spelling of termSpellings(term)) {
        const escaped = spelling.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`).test(name)) return true;
      }
    }
  }
  return false;
}
