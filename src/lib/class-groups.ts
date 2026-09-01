/**
 * Groups the user's selected classes by the platform they came from.
 *
 * The settings list used to be one flat column of chips whose only clue to
 * origin was a background colour, with a single "4/15 classes selected from 2
 * platforms" line above it. That answers how many but never which: a student
 * looking for a missing class could not tell whether bCourses had it and they
 * had not ticked it, or whether it had never arrived at all.
 *
 * The grouping is pure so it can be tested without a DOM.
 */

/** How many classes a platform offers, when that number is known. */
export interface PlatformTotals {
  canvas: number;
  gradescope: number;
  pensieve: number;
}

/** Selected class names, per platform. */
export interface SelectedClassNames {
  canvas: string[];
  gradescope: string[];
  pensieve: string[];
  /** Course names inferred from syllabus-imported tasks. */
  syllabus: string[];
}

/** One platform's block in the settings list. */
export interface ClassGroup {
  /** Stable key. */
  id: "canvas" | "gradescope" | "pensieve" | "syllabus";
  /** Platform name as students say it. Berkeley's Canvas is "bCourses". */
  label: string;
  /** Logo in /public, or null for the syllabus pseudo-platform. */
  logo: string | null;
  /** Tailwind classes for this platform's chips, matching its brand tint. */
  chipClassName: string;
  /** The selected class names, in the order they were stored. */
  courses: string[];
  /**
   * How many classes this platform offers in total, or null when unknown.
   *
   * Null for syllabus, whose classes are a byproduct of imported tasks rather
   * than a list to choose from, and for any platform whose total has not been
   * cached yet because the user has never opened the picker.
   */
  total: number | null;
}

/** Every platform, in the order the settings list renders them. */
const PLATFORMS: Array<{
  id: ClassGroup["id"];
  label: string;
  logo: string | null;
  chipClassName: string;
}> = [
  {
    id: "canvas",
    label: "bCourses",
    logo: "/bcourses-logo.png",
    chipClassName:
      "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200",
  },
  {
    id: "gradescope",
    label: "Gradescope",
    logo: "/gradescope-logo.png",
    chipClassName:
      "bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-200",
  },
  {
    id: "pensieve",
    label: "Pensive",
    logo: "/pensieve-logo.png",
    chipClassName:
      "bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200",
  },
  {
    id: "syllabus",
    label: "Syllabus",
    logo: null,
    chipClassName:
      "bg-violet-50 dark:bg-violet-900/40 text-violet-700 dark:text-violet-200",
  },
];

/**
 * Builds one block per platform that contributed a class.
 *
 * @param selected - Selected class names, per platform.
 * @param totals - Cached per-platform availability, or null when never fetched.
 * @returns Non-empty groups, in platform order.
 * @remarks A platform with no selected classes is omitted rather than shown
 *          empty: the list is about what is syncing, and the picker is where
 *          you go to change that.
 */
export function buildClassGroups(
  selected: SelectedClassNames,
  totals: PlatformTotals | null
): ClassGroup[] {
  const groups: ClassGroup[] = [];
  for (const platform of PLATFORMS) {
    const courses = selected[platform.id];
    if (courses.length === 0) continue;
    groups.push({
      ...platform,
      courses,
      total: platform.id === "syllabus" || !totals ? null : totals[platform.id],
    });
  }
  return groups;
}

/**
 * Summarises one group as "3 of 12", or just the count when the total is
 * unknown.
 *
 * @param group - The group to describe.
 * @returns A short count for the group's header.
 * @remarks Never reports a total below the number selected. A cached total can
 *          be stale — it is written only when the picker is opened, so it can
 *          predate a class being added — and "4 of 3" reads as a bug.
 */
export function groupCountLabel(group: ClassGroup): string {
  const selected = group.courses.length;
  if (group.total === null || group.total < selected) return String(selected);
  return `${selected} of ${group.total}`;
}
