/**
 * Matching one class selection against another.
 *
 * Both helpers here match on course name rather than id, for the same reason.
 * A course's id is not stable across the two ways an account can connect: the
 * same Canvas class is a numeric course id on the API-token path and a
 * name-derived id on the calendar-feed path, and older saves stored 0 for
 * every feed course. A stored selection and a freshly fetched course list
 * therefore routinely disagree on ids while agreeing exactly on names. Names
 * are also what `tasks.course_name` holds, which is what a dismissal matches.
 *
 * `diffCourseSelection` exists because saving a selection writes a column and
 * nothing else. Removing a class left every assignment it had already synced
 * sitting in the app, so editing classes only ever appeared to add; the caller
 * needs the names that entered and left in order to hide and restore tasks.
 */

import type { SelectableCourse } from "@/lib/course-selection";

/** Course names that entered and left a selection. */
export interface CourseSelectionDiff {
  /** Names present in the new selection but not the old one. */
  addedNames: string[];
  /** Names present in the old selection but not the new one. */
  removedNames: string[];
}

/**
 * Normalises a course list to the set of names it selects.
 *
 * @param courses - A stored or drafted selection, possibly null.
 * @returns Trimmed, non-empty names, deduplicated.
 */
function nameSet(courses: SelectableCourse[] | null | undefined): Set<string> {
  const names = new Set<string>();
  for (const course of courses ?? []) {
    const name = course?.name?.trim();
    if (name) names.add(name);
  }
  return names;
}

/**
 * Diffs two class selections by course name.
 *
 * @param previous - The selection currently stored, or null when none is.
 * @param next - The selection about to be stored.
 * @returns The added and removed names, each in `next`/`previous` order.
 * @remarks Unnamed or blank-named courses are ignored on both sides: they
 *          cannot be matched against a task's `course_name`, so reporting them
 *          would only produce dismissals that match nothing. A null `previous`
 *          means "nothing was selected", so everything in `next` counts as
 *          added — which is right for a first save, where there is also
 *          nothing to remove.
 */
export function diffCourseSelection(
  previous: SelectableCourse[] | null | undefined,
  next: SelectableCourse[] | null | undefined
): CourseSelectionDiff {
  const before = nameSet(previous);
  const after = nameSet(next);

  return {
    addedNames: [...after].filter((name) => !before.has(name)),
    removedNames: [...before].filter((name) => !after.has(name)),
  };
}

/**
 * Ticks the courses a stored selection refers to, in a freshly fetched list.
 *
 * Matches on id first and falls back to the course name, because a selection
 * saved through one connection path carries ids the other path never
 * produces. Seeding on ids alone opened the class picker with nothing ticked
 * for those accounts — and since the picker saves whatever is ticked when it
 * closes, opening and closing it wiped the selection.
 *
 * @param available - Courses the provider currently offers.
 * @param selected - The stored selection, possibly using stale id shapes.
 * @returns The ids from `available` that the selection refers to.
 * @remarks Returns an empty set when nothing matches, which is the honest
 *          answer for an account whose classes have all ended: the picker
 *          then shows the current term unticked rather than inventing ticks.
 */
export function seedSelection(
  available: SelectableCourse[],
  selected: SelectableCourse[] | null | undefined
): Set<string> {
  const ids = new Set((selected ?? []).map((c) => String(c.id)));
  const names = nameSet(selected);

  return new Set(
    available
      .filter((c) => ids.has(String(c.id)) || names.has(c.name?.trim() ?? ""))
      .map((c) => String(c.id))
  );
}
