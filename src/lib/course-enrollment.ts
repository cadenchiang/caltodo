/**
 * Auto-enrolls users into normalized course records during sync.
 * Courses are deduped by (source, external_id) — the platform's stable course ID —
 * so display-name changes never split users into different boards.
 *
 * Uses the admin client to bypass RLS for upserts (courses table is read-only
 * for regular users).
 *
 * @module course-enrollment
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

/**
 * A course to enroll, gathered from integration credentials.
 *
 * @param source - Integration source ("canvas", "gradescope", "pensieve")
 * @param external_id - Stable course ID from the platform (Canvas numeric ID, Gradescope course ID, etc.)
 * @param name - Current display name from the platform
 */
export interface EnrollableCourse {
  source: "canvas" | "gradescope" | "pensieve";
  external_id: string;
  name: string;
}

/**
 * Upserts courses into the courses table and creates memberships for the user.
 * Uses (source, external_id) as the dedup key so that:
 * - Two users syncing the same Canvas course ID land on the same board
 * - Name changes on the platform update the display name without creating duplicates
 *
 * @param adminClient - Supabase admin client (service role, bypasses RLS)
 * @param userId - The authenticated user's ID
 * @param courses - Array of courses to enroll the user in
 * @returns Number of memberships created or confirmed
 */
export async function syncCourseEnrollments(
  adminClient: SupabaseClient,
  userId: string,
  courses: EnrollableCourse[]
): Promise<number> {
  if (courses.length === 0) {
    logger.info("syncCourseEnrollments: no courses to enroll", { userId });
    return 0;
  }

  // Deduplicate input by (source, external_id) — take last occurrence (most recent name)
  const deduped = new Map<string, EnrollableCourse>();
  for (const c of courses) {
    deduped.set(`${c.source}:${c.external_id}`, c);
  }
  const uniqueCourses = Array.from(deduped.values());

  logger.info("syncCourseEnrollments: upserting courses", {
    userId,
    courseCount: uniqueCourses.length,
  });

  // Upsert courses — update name on conflict so display stays current
  const courseRows = uniqueCourses.map((c) => ({
    source: c.source,
    external_id: c.external_id,
    name: c.name,
  }));

  const { error: courseError } = await adminClient
    .from("courses")
    .upsert(courseRows, { onConflict: "source,external_id" });

  if (courseError) {
    logger.error("syncCourseEnrollments: course upsert failed", {
      userId,
      error: courseError.message,
    });
    return 0;
  }

  // Fetch the course IDs for the upserted courses
  const courseIds: string[] = [];
  for (const c of uniqueCourses) {
    const { data, error } = await adminClient
      .from("courses")
      .select("id")
      .eq("source", c.source)
      .eq("external_id", c.external_id)
      .single();

    if (error || !data) {
      logger.warn("syncCourseEnrollments: could not find course after upsert", {
        userId,
        source: c.source,
        external_id: c.external_id,
        error: error?.message,
      });
      continue;
    }
    courseIds.push(data.id);
  }

  if (courseIds.length === 0) {
    logger.warn("syncCourseEnrollments: no course IDs resolved", { userId });
    return 0;
  }

  // Upsert memberships — clear deleted_at on conflict so previously
  // soft-deleted memberships are restored when the user re-syncs a course.
  const membershipRows = courseIds.map((courseId) => ({
    user_id: userId,
    course_id: courseId,
    deleted_at: null,
  }));

  const { error: membershipError } = await adminClient
    .from("course_memberships")
    .upsert(membershipRows, { onConflict: "user_id,course_id" });

  if (membershipError) {
    logger.error("syncCourseEnrollments: membership upsert failed", {
      userId,
      error: membershipError.message,
    });
    return 0;
  }

  logger.info("syncCourseEnrollments: complete", {
    userId,
    coursesUpserted: uniqueCourses.length,
    membershipsCreated: courseIds.length,
  });

  return courseIds.length;
}

/**
 * Gathers enrollable courses from integration credentials.
 * Extracts selected courses from Canvas, Gradescope, Pensieve,
 * and additional Canvas accounts.
 *
 * @param credentials - The user's integration credentials row
 * @returns Array of enrollable courses with source + stable external_id + display name
 */
export function gatherEnrollableCourses(credentials: {
  selected_canvas_courses?: Array<{ id: number; name: string }> | null;
  selected_gradescope_courses?: Array<{ id: string; name: string }> | null;
  selected_pensieve_courses?: Array<{ id: string; name: string }> | null;
  canvas_ical_url?: string | null;
  additional_canvas_accounts?: Array<{
    id: string;
    selected_courses: Array<{ id: number; name: string }> | null;
    ical_url?: string | null;
  }>;
}): EnrollableCourse[] {
  const courses: EnrollableCourse[] = [];
  const isIcal = !!credentials.canvas_ical_url;

  // Canvas primary account courses
  if (credentials.selected_canvas_courses) {
    for (const c of credentials.selected_canvas_courses) {
      // iCal courses store id: 0 (no Canvas numeric ID available).
      // Use a stable hash of the name so each course gets a unique external_id.
      const externalId = isIcal || c.id === 0
        ? `ical-${stableIdFromName(c.name)}`
        : String(c.id);
      courses.push({
        source: "canvas",
        external_id: externalId,
        name: c.name,
      });
    }
  }

  // Gradescope courses
  if (credentials.selected_gradescope_courses) {
    for (const c of credentials.selected_gradescope_courses) {
      courses.push({
        source: "gradescope",
        external_id: c.id,
        name: c.name,
      });
    }
  }

  // Pensieve courses
  if (credentials.selected_pensieve_courses) {
    for (const c of credentials.selected_pensieve_courses) {
      courses.push({
        source: "pensieve",
        external_id: c.id,
        name: c.name,
      });
    }
  }

  logger.info("gatherEnrollableCourses: collected platform courses", {
    canvas: credentials.selected_canvas_courses?.length ?? 0,
    gradescope: credentials.selected_gradescope_courses?.length ?? 0,
    pensieve: credentials.selected_pensieve_courses?.length ?? 0,
    isIcal,
    totalSoFar: courses.length,
  });

  // Additional Canvas accounts — namespace external_id with account ID
  if (credentials.additional_canvas_accounts) {
    for (const account of credentials.additional_canvas_accounts) {
      if (account.selected_courses) {
        const accountIsIcal = !!account.ical_url;
        for (const c of account.selected_courses) {
          const externalId = accountIsIcal || c.id === 0
            ? `${account.id}:ical-${stableIdFromName(c.name)}`
            : `${account.id}:${String(c.id)}`;
          courses.push({
            source: "canvas",
            external_id: externalId,
            name: c.name,
          });
        }
      }
    }
  }

  return courses;
}

/**
 * Normalizes a course name for stable hashing so syncs that return the
 * same course with minor formatting differences (trailing whitespace,
 * different case, double spaces, non-breaking spaces) collapse to the
 * same external_id. This prevents duplicate course rows — and therefore
 * duplicate per-class group chats — when an iCal feed re-emits the same
 * course with slightly different formatting.
 *
 * Does NOT strip semester suffixes or section codes — those are part of
 * the course's identity, and removing them would merge legitimately
 * distinct sections.
 */
function normalizeCourseName(name: string): string {
  return name
    .replace(/\s+/g, " ") // collapse any run of whitespace (incl. NBSP) to one space
    .trim()
    .toLowerCase();
}

/**
 * Generates a stable positive numeric ID from a course name string.
 * Used for iCal courses which don't have a Canvas numeric course ID.
 * Uses djb2 hash over the *normalized* name so trivial formatting
 * differences across syncs don't produce different IDs.
 *
 * @param name - Course name string
 * @returns Positive 32-bit integer derived from the normalized name
 */
function stableIdFromName(name: string): number {
  const normalized = normalizeCourseName(name);
  let hash = 5381;
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) + hash + normalized.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
