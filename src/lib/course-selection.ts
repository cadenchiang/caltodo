/**
 * Which providers let you choose classes, and where their courses come from.
 *
 * Not every integration offers a choice. Brightspace and Blackboard sync a
 * whole calendar feed and have no course endpoint or selection column at all,
 * so their accounts list without a class picker rather than showing one that
 * cannot be saved.
 */

/** A course as returned by the course endpoints. */
export interface SelectableCourse {
  /** Numeric for Canvas, the course name itself for feed-derived providers. */
  id: string | number;
  name: string;
}

/** Providers whose classes can be chosen per account. */
export const COURSE_SELECTION_PROVIDERS = ["canvas", "gradescope", "pensieve"] as const;

/** A provider offering class selection. */
export type CourseSelectionProvider = (typeof COURSE_SELECTION_PROVIDERS)[number];

/** Where one provider's courses come from and how to store the choice. */
export interface CourseSelectionMeta {
  /** Endpoint listing this provider's courses; accepts `?account_id=`. */
  coursesEndpoint: string;
  /** Credential column holding the primary account's selection. */
  primaryColumn: string;
  /** Shown when the provider returns no courses at all. */
  emptyLabel: string;
}

/** Per-provider course selection wiring. */
export const COURSE_SELECTION: Record<CourseSelectionProvider, CourseSelectionMeta> = {
  canvas: {
    coursesEndpoint: "/api/canvas/courses",
    primaryColumn: "selected_canvas_courses",
    // A Canvas site with nothing published emits no courses, which is the
    // usual reason a class a student expects is missing.
    emptyLabel: "No classes found. A course appears once it has an assignment.",
  },
  gradescope: {
    coursesEndpoint: "/api/gradescope/courses",
    primaryColumn: "selected_gradescope_courses",
    emptyLabel: "No classes found on Gradescope.",
  },
  pensieve: {
    coursesEndpoint: "/api/pensieve/courses",
    primaryColumn: "selected_pensieve_courses",
    emptyLabel: "No classes found in this calendar.",
  },
};

/**
 * Narrows a provider id to one offering class selection.
 *
 * @param provider - Provider key to test.
 * @returns True when this provider has a course endpoint and a column.
 */
export function hasCourseSelection(provider: string): provider is CourseSelectionProvider {
  return (COURSE_SELECTION_PROVIDERS as readonly string[]).includes(provider);
}
