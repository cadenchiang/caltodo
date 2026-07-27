/**
 * Canvas LMS REST API client for fetching courses and assignments.
 * Server-side only — do not import in client components.
 */

import { logger } from "@/lib/logger";

/** Timeout in milliseconds for external Canvas API calls. */
const FETCH_TIMEOUT_MS = 30_000;

/**
 * Extracts plain text and file links from Canvas HTML description.
 * Strips HTML tags, preserves link URLs inline, and lists attached file links.
 *
 * @param html - Raw HTML description from Canvas API (may be null)
 * @returns Plain text with file links appended, or empty string if null
 */
function extractDescriptionAndFiles(html: string | null): string {
  if (!html) return "";

  // Extract file links (href ending in /download or common file extensions)
  const fileLinks: string[] = [];
  const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]*)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const text = match[2].trim();
    if (
      href.includes("/download") ||
      /\.(pdf|docx?|xlsx?|pptx?|zip|csv|txt)(\?|$)/i.test(href)
    ) {
      fileLinks.push(`${text || "File"}: ${href}`);
    }
  }

  // Strip HTML tags to get plain text
  let text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Append file links if found
  if (fileLinks.length > 0) {
    text += (text ? "\n\n" : "") + "Attached files:\n" + fileLinks.join("\n");
  }

  return text;
}

interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
}

interface CanvasAssignment {
  id: number;
  name: string;
  due_at: string | null;
  html_url: string;
  points_possible: number | null;
  course_id: number;
  description: string | null;
  submission?: { workflow_state: string };
}

export interface NormalizedAssignment {
  external_id: string;
  course_name: string;
  course_id: string;
  title: string;
  due_date: string | null;
  late_due_date?: string | null;
  source_url: string | null;
  points_possible: number | null;
  is_submitted?: boolean;
  description?: string | null;
}

/**
 * Fetches all active courses for the authenticated user from Canvas.
 * Handles pagination via the Link header rel="next".
 *
 * @param token - Canvas personal access token
 * @param baseUrl - Canvas instance base URL (e.g. https://bcourses.berkeley.edu)
 * @returns Array of active courses
 * @throws Error on 401 (invalid token), network failure, or unexpected status
 */
export async function fetchCanvasCourses(
  token: string,
  baseUrl: string
): Promise<CanvasCourse[]> {
  const resolvedBaseUrl = baseUrl || "https://bcourses.berkeley.edu";
  const courses: CanvasCourse[] = [];
  let url: string | null = `${resolvedBaseUrl}/api/v1/courses?enrollment_state=active&per_page=50`;

  while (url) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (response.status === 401) {
      throw new Error("Canvas token is invalid or expired. Please update it in Settings.");
    }
    if (response.status === 403) {
      throw new Error("Canvas rate limit exceeded. Please try again later.");
    }
    if (!response.ok) {
      throw new Error(`Canvas API error: ${response.status} ${response.statusText}`);
    }

    const data: CanvasCourse[] = await response.json();
    courses.push(...data);
    url = parseNextLink(response.headers.get("link"));
  }

  logger.info("fetchCanvasCourses", { count: courses.length });
  return courses;
}

/**
 * Checks whether a Canvas token is still valid, independent of any course.
 *
 * Canvas answers 401 for two very different situations: the token is dead,
 * and the token is fine but you may not view THIS resource (a course you
 * dropped, one whose term concluded, an id belonging to another instance).
 * The per-course response body doesn't reliably distinguish them, so we ask
 * a course-independent endpoint: /users/self needs nothing but a live token.
 *
 * @param token - Canvas personal access token
 * @param baseUrl - Canvas instance base URL
 * @returns true when the token still authenticates
 */
export async function isCanvasTokenValid(token: string, baseUrl: string): Promise<boolean> {
  const resolvedBaseUrl = baseUrl || "https://bcourses.berkeley.edu";
  try {
    const response = await fetch(`${resolvedBaseUrl}/api/v1/users/self`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    // Anything other than an explicit 401 (including a 5xx or a rate limit)
    // is not evidence the token is dead; assume valid and let the caller
    // treat the original failure as course-level.
    return response.status !== 401;
  } catch {
    // Network failure tells us nothing about the token.
    return true;
  }
}

/**
 * Fetches all assignments for a specific Canvas course.
 * Handles pagination via the Link header rel="next".
 *
 * @param token - Canvas personal access token
 * @param baseUrl - Canvas instance base URL
 * @param courseId - Canvas course ID
 * @returns Array of assignments for the course
 * @throws Error on API failure
 */
export async function fetchCanvasAssignments(
  token: string,
  baseUrl: string,
  courseId: number
): Promise<CanvasAssignment[]> {
  const resolvedBaseUrl = baseUrl || "https://bcourses.berkeley.edu";
  const assignments: CanvasAssignment[] = [];
  let url: string | null =
    `${resolvedBaseUrl}/api/v1/courses/${courseId}/assignments?per_page=50&order_by=due_at&include[]=submission`;

  while (url) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      logger.warn("fetchCanvasAssignments failed for course", {
        courseId,
        status: response.status,
      });
      throw new Error(`Canvas returned ${response.status} for course ${courseId}`);
    }

    const data: CanvasAssignment[] = await response.json();
    assignments.push(...data);
    url = parseNextLink(response.headers.get("link"));
  }

  return assignments;
}

/**
 * Fetches courses and all their assignments, returning normalized results.
 *
 * @param token - Canvas personal access token
 * @param baseUrl - Canvas instance base URL
 * @returns Array of normalized assignments from all courses
 * @throws Error on authentication or network failure
 */
export async function fetchAllCanvasAssignments(
  token: string,
  baseUrl: string
): Promise<NormalizedAssignment[]> {
  const courses = await fetchCanvasCourses(token, baseUrl);
  const results: NormalizedAssignment[] = [];

  for (const course of courses) {
    try {
      const assignments = await fetchCanvasAssignments(token, baseUrl, course.id);
      for (const a of assignments) {
        const ws = a.submission?.workflow_state;
        results.push({
          external_id: String(a.id),
          course_name: course.name,
          course_id: String(course.id),
          title: a.name,
          due_date: a.due_at,
          source_url: a.html_url,
          points_possible: a.points_possible,
          is_submitted: ws === "submitted" || ws === "graded",
          description: extractDescriptionAndFiles(a.description),
        });
      }
    } catch (err) {
      logger.error("Failed to fetch assignments for course", {
        courseId: course.id,
        courseName: course.name,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  logger.info("fetchAllCanvasAssignments", { totalAssignments: results.length });
  return results;
}

/**
 * Fetches assignments only for the specified courses, returning normalized results.
 * Used when the user has selected specific courses to sync during onboarding.
 *
 * @param token - Canvas personal access token
 * @param baseUrl - Canvas instance base URL
 * @param courses - Array of selected courses with id and name
 * @returns Array of normalized assignments from the specified courses
 */
export async function fetchCanvasAssignmentsForCourses(
  token: string,
  baseUrl: string,
  courses: Array<{ id: number; name: string }>
): Promise<NormalizedAssignment[]> {
  const results: NormalizedAssignment[] = [];
  const resolvedBaseUrl = baseUrl || "https://bcourses.berkeley.edu";
  /** Courses the token can no longer see; skipped rather than fatal. */
  const inaccessibleCourses: Array<{ id: number; name: string }> = [];

  for (const course of courses) {
    try {
      const assignments = await fetchCanvasAssignments(token, baseUrl, course.id);
      for (const a of assignments) {
        const ws = a.submission?.workflow_state;
        results.push({
          external_id: String(a.id),
          course_name: course.name,
          course_id: String(course.id),
          title: a.name,
          due_date: a.due_at,
          source_url: a.html_url,
          points_possible: a.points_possible,
          is_submitted: ws === "submitted" || ws === "graded",
          description: extractDescriptionAndFiles(a.description),
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error("Failed to fetch assignments for selected course", {
        courseId: course.id,
        courseName: course.name,
        error: msg,
      });
      // A 401 means one of two things, and they need opposite handling:
      //
      //   - The token is dead. Every course will fail the same way, so
      //     rethrow: the sync sets canvas_auth_failed and the banner asks the
      //     user to reconnect, instead of silently returning 0 assignments.
      //   - The token is fine but this course is no longer visible (dropped,
      //     term concluded, or an id from a different Canvas instance). That
      //     is a ONE-course problem. Rethrowing it used to take down every
      //     other course on the account, which is how a single stale entry in
      //     selected_courses could silently zero out a working integration.
      //
      // Ask a course-independent endpoint which case this is.
      if (/invalid or expired|token is invalid|\b401\b|unauthorized/i.test(msg)) {
        const tokenStillValid = await isCanvasTokenValid(token, resolvedBaseUrl);
        if (!tokenStillValid) throw err;
        logger.warn("Canvas course is no longer accessible; skipping it", {
          courseId: course.id,
          courseName: course.name,
        });
        inaccessibleCourses.push(course);
      }
    }
  }

  logger.info("fetchCanvasAssignmentsForCourses", {
    courseCount: courses.length,
    totalAssignments: results.length,
    skippedInaccessible: inaccessibleCourses.map((c) => c.id),
  });
  return results;
}

/**
 * Parses the Link header to extract the "next" page URL for pagination.
 *
 * @param linkHeader - Raw Link header value from the response
 * @returns URL string for the next page, or null if no next page
 */
function parseNextLink(linkHeader: string | null): string | null {
  if (!linkHeader) return null;

  const links = linkHeader.split(",");
  for (const link of links) {
    const match = link.match(/<([^>]+)>;\s*rel="next"/);
    if (match) return match[1];
  }
  return null;
}
