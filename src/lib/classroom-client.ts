/**
 * Google Classroom API client.
 *
 * Reads the signed-in student's courses, their coursework, and their own
 * submission state, and normalizes it into the same shape the Canvas and
 * Gradescope clients produce so the sync engine treats every platform alike.
 *
 * Authenticates with the Google OAuth tokens the Calendar integration already
 * stores — Classroom just needs extra scopes on the same grant.
 *
 * @module classroom-client
 */

import type { NormalizedAssignment } from "@/lib/canvas-client";
import { logger } from "@/lib/logger";

/** Google Classroom API base. */
const API_BASE = "https://classroom.googleapis.com/v1";

/** Cap on pages walked per listing, so a pathological account cannot hang a sync. */
const MAX_PAGES = 10;

/** Courses fetched per page. */
const PAGE_SIZE = 100;

/** A Classroom course the user is enrolled in. */
export interface ClassroomCourse {
  id: string;
  name: string;
}

/** Raised when Google rejects the request for want of the Classroom scopes. */
export class ClassroomScopeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClassroomScopeError";
  }
}

/** Shape of the courseWork fields this module reads. */
interface RawCourseWork {
  id?: string;
  title?: string;
  description?: string;
  alternateLink?: string;
  maxPoints?: number;
  workType?: string;
  state?: string;
  dueDate?: { year?: number; month?: number; day?: number };
  dueTime?: { hours?: number; minutes?: number };
}

/**
 * Calls the Classroom API and returns the parsed body.
 *
 * @param path - Path below {@link API_BASE}, starting with "/"
 * @param accessToken - Google OAuth access token carrying the Classroom scopes
 * @returns Parsed JSON body
 * @throws ClassroomScopeError when Google answers 401/403, which for this API
 *         means the grant lacks the Classroom scopes far more often than it
 *         means the token is dead — the Calendar path refreshes it separately.
 * @throws Error on any other non-OK response
 */
async function apiGet(path: string, accessToken: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 401 || res.status === 403) {
    const body = await res.text();
    logger.warn("classroom-client: authorization rejected", {
      cause: `Google returned ${res.status}`,
      path,
      impact: "user must reconnect Google to grant Classroom access",
      body: body.slice(0, 200),
    });
    throw new ClassroomScopeError(
      "Google Classroom access was not granted. Reconnect Google in Settings to allow it."
    );
  }

  if (!res.ok) {
    const body = await res.text();
    logger.error("classroom-client: request failed", {
      cause: `Google returned ${res.status}`,
      path,
      body: body.slice(0, 200),
      impact: "Classroom sync could not complete",
    });
    throw new Error(`Google Classroom request failed (HTTP ${res.status}).`);
  }

  return (await res.json()) as Record<string, unknown>;
}

/**
 * Lists the active courses the user is enrolled in as a student.
 *
 * @param accessToken - Google OAuth access token with Classroom scopes
 * @returns Courses with their ids and display names
 * @throws ClassroomScopeError when the grant lacks Classroom scopes
 * @remarks Only ACTIVE courses are returned, so archived classes from previous
 *          terms do not reappear in the picker every year.
 */
export async function fetchClassroomCourses(accessToken: string): Promise<ClassroomCourse[]> {
  const courses: ClassroomCourse[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < MAX_PAGES; page++) {
    const params = new URLSearchParams({
      courseStates: "ACTIVE",
      studentId: "me",
      pageSize: String(PAGE_SIZE),
    });
    if (pageToken) params.set("pageToken", pageToken);

    const body = await apiGet(`/courses?${params}`, accessToken);
    const items = (body.courses ?? []) as Array<{ id?: string; name?: string }>;

    for (const c of items) {
      if (c.id) courses.push({ id: c.id, name: c.name?.trim() || "Untitled course" });
    }

    pageToken = body.nextPageToken as string | undefined;
    if (!pageToken) break;
  }

  logger.info("classroom-client: fetched courses", { count: courses.length });
  return courses;
}

/**
 * Converts Classroom's split date and time objects into an ISO timestamp.
 *
 * @param due - The courseWork's dueDate
 * @param time - The courseWork's dueTime, which Google gives in UTC
 * @returns ISO 8601 timestamp, or null when the work has no due date
 * @remarks Classroom omits dueTime for "no specific time" work; those become
 *          end-of-day UTC so the assignment sorts on its due date rather than
 *          jumping to the previous day in western timezones.
 */
export function toDueIso(
  due: RawCourseWork["dueDate"],
  time: RawCourseWork["dueTime"]
): string | null {
  if (!due?.year || !due.month || !due.day) return null;

  const hours = time?.hours ?? 23;
  const minutes = time?.minutes ?? 59;

  return new Date(
    Date.UTC(due.year, due.month - 1, due.day, hours, minutes, 0)
  ).toISOString();
}

/**
 * Fetches one course's coursework, normalized for the sync engine.
 *
 * @param accessToken - Google OAuth access token with Classroom scopes
 * @param course - The course to read
 * @returns Assignments belonging to that course
 * @throws ClassroomScopeError when the grant lacks Classroom scopes
 * @remarks Only PUBLISHED work is returned; drafts are invisible to students.
 *          Submission state is fetched separately and merged in by the caller.
 */
export async function fetchCourseWork(
  accessToken: string,
  course: ClassroomCourse
): Promise<NormalizedAssignment[]> {
  const assignments: NormalizedAssignment[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < MAX_PAGES; page++) {
    const params = new URLSearchParams({
      courseWorkStates: "PUBLISHED",
      pageSize: String(PAGE_SIZE),
    });
    if (pageToken) params.set("pageToken", pageToken);

    const body = await apiGet(
      `/courses/${encodeURIComponent(course.id)}/courseWork?${params}`,
      accessToken
    );
    const items = (body.courseWork ?? []) as RawCourseWork[];

    for (const work of items) {
      if (!work.id) continue;
      assignments.push({
        external_id: work.id,
        course_name: course.name,
        course_id: course.id,
        title: work.title?.trim() || "Untitled assignment",
        due_date: toDueIso(work.dueDate, work.dueTime),
        source_url: work.alternateLink ?? null,
        points_possible: typeof work.maxPoints === "number" ? work.maxPoints : null,
        is_submitted: false,
        description: work.description?.trim() || null,
      });
    }

    pageToken = body.nextPageToken as string | undefined;
    if (!pageToken) break;
  }

  return assignments;
}

/**
 * Returns the ids of coursework the student has already turned in.
 *
 * @param accessToken - Google OAuth access token with Classroom scopes
 * @param courseId - Course whose submissions to read
 * @returns Set of courseWork ids in a submitted or graded state
 * @remarks A failure here is not fatal to the sync — losing submission state
 *          only means an assignment shows as outstanding — so the caller
 *          treats a rejection as "nothing known submitted".
 */
export async function fetchSubmittedIds(
  accessToken: string,
  courseId: string
): Promise<Set<string>> {
  const submitted = new Set<string>();

  const params = new URLSearchParams({
    userId: "me",
    states: "TURNED_IN",
    pageSize: String(PAGE_SIZE),
  });
  // "-" means "all coursework in this course".
  const body = await apiGet(
    `/courses/${encodeURIComponent(courseId)}/courseWork/-/studentSubmissions?${params}`,
    accessToken
  );

  const items = (body.studentSubmissions ?? []) as Array<{
    courseWorkId?: string;
    state?: string;
  }>;
  for (const s of items) {
    if (s.courseWorkId) submitted.add(s.courseWorkId);
  }

  // RETURNED work has also been handed in; ask for it separately because the
  // states filter takes one value per request.
  const returnedParams = new URLSearchParams({
    userId: "me",
    states: "RETURNED",
    pageSize: String(PAGE_SIZE),
  });
  const returnedBody = await apiGet(
    `/courses/${encodeURIComponent(courseId)}/courseWork/-/studentSubmissions?${returnedParams}`,
    accessToken
  );
  const returnedItems = (returnedBody.studentSubmissions ?? []) as Array<{
    courseWorkId?: string;
  }>;
  for (const s of returnedItems) {
    if (s.courseWorkId) submitted.add(s.courseWorkId);
  }

  return submitted;
}

/**
 * Fetches all assignments for the given courses, with submission state applied.
 *
 * @param accessToken - Google OAuth access token with Classroom scopes
 * @param courses - Courses to read; typically the user's selection
 * @returns Assignments across every course
 * @throws ClassroomScopeError when the grant lacks Classroom scopes
 * @remarks One course failing is logged and skipped so a single broken class
 *          cannot cost the user every other class's assignments. A scope
 *          rejection is rethrown, since it affects every course equally and
 *          the user needs to be told to reconnect.
 */
export async function fetchClassroomAssignments(
  accessToken: string,
  courses: ClassroomCourse[]
): Promise<NormalizedAssignment[]> {
  const all: NormalizedAssignment[] = [];

  for (const course of courses) {
    try {
      const work = await fetchCourseWork(accessToken, course);

      let submitted: Set<string>;
      try {
        submitted = await fetchSubmittedIds(accessToken, course.id);
      } catch (err) {
        if (err instanceof ClassroomScopeError) throw err;
        logger.warn("classroom-client: submission state unavailable", {
          cause: err instanceof Error ? err.message : String(err),
          courseId: course.id,
          impact: "assignments for this course show as not submitted",
        });
        submitted = new Set();
      }

      for (const a of work) {
        all.push({ ...a, is_submitted: submitted.has(a.external_id) });
      }
    } catch (err) {
      if (err instanceof ClassroomScopeError) throw err;
      logger.warn("classroom-client: course skipped", {
        cause: err instanceof Error ? err.message : String(err),
        courseId: course.id,
        courseName: course.name,
        impact: "this course contributed no assignments to the sync",
      });
    }
  }

  logger.info("classroom-client: fetched assignments", {
    courses: courses.length,
    assignments: all.length,
  });
  return all;
}
