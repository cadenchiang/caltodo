/**
 * Resolves which task rows a class-selection change actually refers to.
 *
 * Sync does not store a course's raw platform name on its tasks. It stores
 * the canonical name from `buildCourseNameMap`, built over every course the
 * student had selected across all platforms at sync time, so a Canvas
 * section "UGBA 101A-LEC-002 Microeconomics" lands on tasks as "UGBA 101A"
 * whenever Gradescope lists the same code. A removal that matched only the
 * raw selection name therefore found nothing for Canvas, and a removal of the
 * Gradescope course matched the still-selected Canvas section's tasks too.
 *
 * Two rules fix that. Every dismissal or restore is scoped to the platform the
 * class was removed from or re-added to (`source`), so one platform's edit can
 * never touch another platform's tasks or a manual task. And the names matched
 * are the raw name plus its canonical form under each selection snapshot the
 * tasks could have been synced with, so a merged name still matches.
 */

import { buildCourseNameMap, getCanonicalName } from "@/lib/course-name-merge";

/** Task sources whose classes can be chosen in settings. */
export type CourseTaskSource = "canvas" | "gradescope" | "pensieve";

/** The parts of a credentials row that feed the sync's course-name map. */
export interface SelectionSnapshot {
  selected_canvas_courses?: Array<{ name: string }> | null;
  selected_gradescope_courses?: Array<{ name: string }> | null;
  selected_pensieve_courses?: Array<{ name: string }> | null;
  additional_canvas_accounts?: Array<{ selected_courses?: Array<{ name: string }> | null }> | null;
}

/**
 * Flattens a selection snapshot into the (source, name) entries the sync
 * engine hands to `buildCourseNameMap`.
 *
 * @param snapshot - Stored or drafted selection across platforms.
 * @returns One entry per selected course, in platform order.
 * @remarks Mirrors `gatherEnrollableCourses` in shape only: the name map
 *          depends on source and name, not on external ids.
 */
export function selectionCourseEntries(
  snapshot: SelectionSnapshot
): Array<{ source: CourseTaskSource; name: string }> {
  const entries: Array<{ source: CourseTaskSource; name: string }> = [];
  for (const c of snapshot.selected_canvas_courses ?? []) {
    entries.push({ source: "canvas", name: c.name });
  }
  for (const c of snapshot.selected_gradescope_courses ?? []) {
    entries.push({ source: "gradescope", name: c.name });
  }
  for (const c of snapshot.selected_pensieve_courses ?? []) {
    entries.push({ source: "pensieve", name: c.name });
  }
  for (const account of snapshot.additional_canvas_accounts ?? []) {
    for (const c of account.selected_courses ?? []) {
      entries.push({ source: "canvas", name: c.name });
    }
  }
  return entries;
}

/**
 * Expands raw course names to every `course_name` value the sync could have
 * written for them.
 *
 * @param names - Raw platform course names from a selection diff.
 * @param snapshots - Selections the tasks may have been synced under,
 *        typically the one before the edit and the one after it.
 * @returns The raw names plus each canonical form, deduplicated, in order.
 * @remarks Names are returned unscoped by source; the caller must pair them
 *          with the platform the edit happened on. An empty `names` yields an
 *          empty list so callers can skip the write.
 */
export function canonicalNameVariants(
  names: string[],
  snapshots: SelectionSnapshot[]
): string[] {
  if (names.length === 0) return [];
  const maps = snapshots.map((s) => buildCourseNameMap(selectionCourseEntries(s)));
  const variants = new Set<string>();
  for (const raw of names) {
    const name = raw.trim();
    if (!name) continue;
    variants.add(name);
    for (const map of maps) variants.add(getCanonicalName(name, map));
  }
  return [...variants];
}
