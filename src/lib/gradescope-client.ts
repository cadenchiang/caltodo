/**
 * Gradescope HTTP client for fetching courses and assignments.
 * Uses cookie-based session auth — no official API exists.
 * Server-side only — do not import in client components.
 *
 * Parsing logic is delegated to gradescope-parser.ts:
 *   - React props JSON (instructor view) — structured, reliable
 *   - HTML table scraping (student view) — CSS-selector-based fallback
 *
 * @module gradescope-client
 */

import * as cheerio from "cheerio";
import { CookieJar } from "tough-cookie";
import fetchCookie from "fetch-cookie";
import { logger } from "@/lib/logger";
import type { NormalizedAssignment } from "@/lib/canvas-client";
import {
  parseAssignmentsFromReactProps,
  parseAssignmentsFromHtml,
} from "@/lib/gradescope-parser";

const GRADESCOPE_BASE = "https://www.gradescope.com";

/**
 * Strips HTML tags, trims whitespace, and caps length for extracted text.
 * Prevents injection via course/assignment names scraped from Gradescope HTML.
 *
 * @param raw - Raw text extracted from HTML elements
 * @param maxLength - Maximum character length (default 200)
 * @returns Sanitized text
 */
function sanitizeExtractedText(raw: string, maxLength = 200): string {
  return raw.replace(/<[^>]*>/g, "").trim().slice(0, maxLength);
}

/** Timeout in milliseconds for external Gradescope HTTP calls. */
const FETCH_TIMEOUT_MS = 30_000;

interface GradescopeCourse {
  id: string;
  name: string;
  shortName: string;
}

/**
 * Logs into Gradescope using email + password.
 *   1. GET /login to extract CSRF token
 *   2. POST credentials with CSRF token
 *   3. Success = 302 redirect; failure = 200
 *
 * @param email - Gradescope account email
 * @param password - Gradescope account password (plaintext)
 * @returns Cookie jar with authenticated session
 * @throws Error if login fails or CSRF token missing
 */
export async function gradescopeLogin(
  email: string,
  password: string
): Promise<CookieJar> {
  const jar = new CookieJar();
  const fetchWithCookies = fetchCookie(fetch, jar);

  const loginPageRes = await fetchWithCookies(`${GRADESCOPE_BASE}/login`, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!loginPageRes.ok) {
    throw new Error(`Gradescope login page returned ${loginPageRes.status}`);
  }

  const loginPageHtml = await loginPageRes.text();
  const $ = cheerio.load(loginPageHtml);

  const csrfToken =
    $('meta[name="csrf-token"]').attr("content") ||
    $('input[name="authenticity_token"]').attr("value");

  if (!csrfToken) {
    throw new Error(
      "Could not extract CSRF token from Gradescope. The page structure may have changed."
    );
  }

  const loginRes = await fetchWithCookies(`${GRADESCOPE_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-CSRF-Token": csrfToken,
    },
    body: new URLSearchParams({
      "session[email]": email,
      "session[password]": password,
      "session[remember_me]": "1",
      authenticity_token: csrfToken,
    }).toString(),
    redirect: "manual",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (loginRes.status !== 302) {
    throw new Error(
      "Gradescope login failed. Check your email and password. " +
      "If you sign in with Google or SSO, you'll need to reset your Gradescope password first."
    );
  }

  logger.info("gradescopeLogin", { email, success: true });
  return jar;
}

/**
 * Fetches the list of student courses from the Gradescope dashboard.
 * Skips instructor course lists when both instructor and student lists are present.
 *
 * @param jar - Authenticated cookie jar from gradescopeLogin
 * @returns Array of courses with id, name, and shortName
 * @throws Error if dashboard fetch fails
 */
export async function fetchGradescopeCourses(
  jar: CookieJar
): Promise<GradescopeCourse[]> {
  const fetchWithCookies = fetchCookie(fetch, jar);

  const dashboardRes = await fetchWithCookies(GRADESCOPE_BASE, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!dashboardRes.ok) {
    throw new Error(`Gradescope dashboard returned ${dashboardRes.status}`);
  }

  const html = await dashboardRes.text();
  if (html.length > 10_000_000) {
    throw new Error("Gradescope dashboard HTML response too large (>10MB)");
  }
  const $ = cheerio.load(html);
  const courses: GradescopeCourse[] = [];
  const seen = new Set<string>();

  // Gradescope renders one `.courseList--coursesForTerm` block PER TERM, so a
  // student enrolled across multiple terms produces several blocks. Scrape
  // every student block (not just the first) so no term is silently dropped.
  const courseLists = $(".courseList--coursesForTerm");
  let courseBoxes = $(".courseBox");

  if (courseLists.length >= 1) {
    const accountText = $("#account-show").text();
    const hasInstructorCourses = accountText.includes("Instructor Courses");
    // Instructor courses render before student courses. We can't tell how many
    // term-blocks belong to the instructor role from the flat list, so when an
    // instructor role is present drop the first block (the instructor's list)
    // and keep the rest — this surfaces the student's courses across all their
    // terms instead of picking one hardcoded index (which dropped whole terms).
    const studentLists =
      hasInstructorCourses && courseLists.length > 1
        ? courseLists.slice(1)
        : courseLists;
    courseBoxes = studentLists.find(".courseBox");
  }

  if (courseBoxes.length > 0) {
    courseBoxes.each((_, el) => {
      const href = $(el).attr("href") || $(el).find("a").attr("href") || "";
      const match = href.match(/\/courses\/(\d+)/);
      if (!match) return;

      const id = match[1];
      if (seen.has(id)) return;
      seen.add(id);

      const shortName = sanitizeExtractedText($(el).find(".courseBox--shortname").text());
      const name = sanitizeExtractedText($(el).find(".courseBox--name").text() || $(el).text());
      courses.push({ id, name: name || shortName || `Course ${id}`, shortName });
    });
  } else {
    $('a[href^="/courses/"]').each((_, el) => {
      const href = $(el).attr("href") || "";
      const match = href.match(/^\/courses\/(\d+)/);
      if (!match) return;

      const id = match[1];
      if (seen.has(id)) return;
      seen.add(id);

      const shortName = sanitizeExtractedText($(el).find(".courseBox--shortname").text());
      const name = sanitizeExtractedText($(el).find(".courseBox--name").text() || $(el).text());
      courses.push({ id, name: name || shortName || `Course ${id}`, shortName });
    });
  }

  logger.info("fetchGradescopeCourses", { count: courses.length });
  return courses;
}

/**
 * Fetches assignments for a single Gradescope course.
 * Strategy: try React props JSON first (instructor view), fall back to HTML scraping.
 *
 * @param jar - Authenticated cookie jar
 * @param courseId - Gradescope course ID
 * @param courseName - Fallback course name (overridden by page title)
 * @returns Array of normalized assignments
 * @throws Error if page fetch fails
 */
export async function fetchGradescopeAssignments(
  jar: CookieJar,
  courseId: string,
  courseName: string
): Promise<NormalizedAssignment[]> {
  const fetchWithCookies = fetchCookie(fetch, jar);

  const pageRes = await fetchWithCookies(
    `${GRADESCOPE_BASE}/courses/${courseId}`,
    { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
  );
  if (!pageRes.ok) {
    throw new Error(
      `Gradescope course page ${courseId} returned ${pageRes.status}`
    );
  }

  const html = await pageRes.text();
  if (html.length > 10_000_000) {
    throw new Error(`Gradescope course page ${courseId} HTML response too large (>10MB)`);
  }

  // Strategy 1: React props JSON (instructor/TA view — structured, reliable)
  const reactResults = parseAssignmentsFromReactProps(html, courseId, courseName);
  if (reactResults !== null) {
    logger.info("fetchGradescopeAssignments", {
      courseId,
      strategy: "react-props",
      count: reactResults.length,
    });
    return reactResults;
  }

  // Strategy 2: HTML table scraping (student view — CSS-selector-based)
  const htmlResults = parseAssignmentsFromHtml(html, courseId, courseName);
  logger.info("fetchGradescopeAssignments", {
    courseId,
    strategy: "html-scraping",
    count: htmlResults.length,
  });
  return htmlResults;
}

/**
 * Fetches all assignments from all Gradescope courses.
 *
 * @param email - Gradescope account email
 * @param password - Gradescope account password
 * @returns Array of normalized assignments from all courses
 * @throws Error on login failure
 */
export async function fetchAllGradescopeAssignments(
  email: string,
  password: string
): Promise<NormalizedAssignment[]> {
  const jar = await gradescopeLogin(email, password);
  const courses = await fetchGradescopeCourses(jar);
  const results: NormalizedAssignment[] = [];

  for (const course of courses) {
    try {
      const assignments = await fetchGradescopeAssignments(jar, course.id, course.name);
      results.push(...assignments);
    } catch (err) {
      logger.error("Failed to fetch Gradescope assignments for course", {
        courseId: course.id,
        courseName: course.name,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  logger.info("fetchAllGradescopeAssignments", { totalAssignments: results.length });
  return results;
}

/**
 * Fetches assignments only for the specified Gradescope courses.
 *
 * @param email - Gradescope account email
 * @param password - Gradescope account password
 * @param selectedCourses - Array of selected courses with id and name
 * @returns Array of normalized assignments from the specified courses
 * @throws Error on login failure
 */
export async function fetchGradescopeAssignmentsForCourses(
  email: string,
  password: string,
  selectedCourses: Array<{ id: string; name: string }>
): Promise<NormalizedAssignment[]> {
  const jar = await gradescopeLogin(email, password);
  const results: NormalizedAssignment[] = [];

  for (const course of selectedCourses) {
    try {
      const assignments = await fetchGradescopeAssignments(jar, course.id, course.name);
      results.push(...assignments);
    } catch (err) {
      logger.error("Failed to fetch Gradescope assignments for selected course", {
        courseId: course.id,
        courseName: course.name,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  logger.info("fetchGradescopeAssignmentsForCourses", {
    courseCount: selectedCourses.length,
    totalAssignments: results.length,
  });
  return results;
}
