/**
 * Narrowing a fetched assignment list to a stored class selection.
 *
 * Every calendar-feed path (primary Canvas iCal, extra Canvas iCal accounts,
 * Pensieve and the other feed providers) stores its selection as a list of
 * course names, because a feed carries no course ids. The three states mean
 * the same thing everywhere and were previously re-implemented in each path,
 * or forgotten: extra Canvas iCal accounts and extra Pensieve feeds ignored
 * their own selection entirely (audit M4, H11).
 *
 *   null or undefined: no choice made yet, sync everything
 *   []:                the user deselected every course, sync nothing
 *   [...]:             sync only assignments whose course_name is listed
 */

import type { NormalizedAssignment } from "@/lib/canvas-client";

/** A stored selection; only the name is needed to match feed assignments. */
export type CourseSelection = ReadonlyArray<{ name: string }> | null | undefined;

/**
 * Reports whether a selection means "sync nothing".
 *
 * @param selected - A stored selection.
 * @returns True only for an explicit empty list.
 */
export function selectsNothing(selected: CourseSelection): boolean {
  return Array.isArray(selected) && selected.length === 0;
}

/**
 * Filters assignments to the selected courses.
 *
 * @param assignments - Everything the feed returned.
 * @param selected - The stored selection for the account that feed belongs to.
 * @returns All assignments when nothing has been chosen yet, none for an
 *          explicit empty selection, else those whose course_name matches.
 * @remarks Matches on the raw course name the feed emits, which is what the
 *          selection stored; canonical merging happens after this step.
 */
export function filterBySelectedCourses(
  assignments: NormalizedAssignment[],
  selected: CourseSelection
): NormalizedAssignment[] {
  if (selected == null) return assignments;
  if (selected.length === 0) return [];
  const allowed = new Set(selected.map((c) => c.name));
  return assignments.filter((a) => !!a.course_name && allowed.has(a.course_name));
}
