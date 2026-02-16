/**
 * Gradescope scraper client for fetching courses and assignments.
 * Uses HTTP requests with cookie management — no official API exists.
 * Server-side only — do not import in client components.
 *
 * Selectors are derived from the bennet-m/Google-Calendar-for-Gradescope
 * Selenium-based scraper. We replicate the same selectors with cheerio
 * so no browser is needed on the server.
 *
 * Reference selectors (from seleniumscraping.py):
 *   Login:       #session_email, #session_password
 *   Dashboard:   .courseList--coursesForTerm > .courseBox (href)
 *   Course page: .courseHeader--title, tbody > tr
 *   Assignment:  .table--primaryLink (name), a (href)
 *   Due date:    .submissionTimeChart--dueDate[datetime]
 *   Date format: "%Y-%m-%d %H:%M:%S %z" (NOT ISO 8601)
 */

import * as cheerio from "cheerio";
import { CookieJar } from "tough-cookie";
import fetchCookie from "fetch-cookie";
import { logger } from "@/lib/logger";
import type { NormalizedAssignment } from "@/lib/canvas-client";

const GRADESCOPE_BASE = "https://www.gradescope.com";

interface GradescopeCourse {
  id: string;
  name: string;
  shortName: string;
}

/**
 * Logs into Gradescope using email + password.
 * Mirrors the reference repo's purdue_login flow:
 *   1. GET /login page
 *   2. Fill session[email] + session[password]
 *   3. Submit via POST
 *
 * @param email - Gradescope account email
 * @param password - Gradescope account password (plaintext)
 * @returns Cookie jar with authenticated session
 * @throws Error if login fails
 */
export async function gradescopeLogin(
  email: string,
  password: string
): Promise<CookieJar> {
  const jar = new CookieJar();
  const fetchWithCookies = fetchCookie(fetch, jar);

  // Step 1: GET the login page to extract CSRF token
  // Reference: driver.get("https://www.gradescope.com/login")
  const loginPageRes = await fetchWithCookies(`${GRADESCOPE_BASE}/login`);
  if (!loginPageRes.ok) {
    throw new Error(`Gradescope login page returned ${loginPageRes.status}`);
  }

  const loginPageHtml = await loginPageRes.text();
  const $ = cheerio.load(loginPageHtml);

  // Extract CSRF token - try meta tag first, then hidden input
  const csrfToken =
    $('meta[name="csrf-token"]').attr("content") ||
    $('input[name="authenticity_token"]').attr("value");

  if (!csrfToken) {
    throw new Error(
      "Could not extract CSRF token from Gradescope. The page structure may have changed."
    );
  }

  // Step 2: POST login with session[email] + session[password]
  // Reference: username = By.ID "session_email", password = By.ID "session_password"
  const loginRes = await fetchWithCookies(`${GRADESCOPE_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-CSRF-Token": csrfToken,
    },
    body: new URLSearchParams({
      "session[email]": email,
      "session[password]": password,
      authenticity_token: csrfToken,
    }).toString(),
    redirect: "manual",
  });

  // Successful login redirects (302); failed login returns 200
  if (loginRes.status !== 302) {
    throw new Error(
      "Gradescope login failed. Check your email and password. " +
      "Note: CalNet SSO accounts must set a Gradescope-specific password via 'Forgot Password'."
    );
  }

  logger.info("gradescopeLogin", { email, success: true });
  return jar;
}

/**
 * Fetches the list of student courses from the Gradescope dashboard.
 *
 * Reference repo logic:
 *   1. Check #account-show for "Instructor Courses" to skip instructor list
 *   2. courseList = driver.find_element(By.CLASS_NAME, "courseList--coursesForTerm")
 *   3. courses = courseList.find_elements(By.CLASS_NAME, "courseBox")
 *   4. course_urls = [elem.get_attribute("href") for elem in courses]
 *
 * @param jar - Authenticated cookie jar from gradescopeLogin
 * @returns Array of courses with id, name, and shortName
 * @throws Error if dashboard fetch fails
 */
export async function fetchGradescopeCourses(
  jar: CookieJar
): Promise<GradescopeCourse[]> {
  const fetchWithCookies = fetchCookie(fetch, jar);

  const dashboardRes = await fetchWithCookies(GRADESCOPE_BASE);
  if (!dashboardRes.ok) {
    throw new Error(`Gradescope dashboard returned ${dashboardRes.status}`);
  }

  const html = await dashboardRes.text();
  const $ = cheerio.load(html);
  const courses: GradescopeCourse[] = [];
  const seen = new Set<string>();

  // Reference repo: skip instructor courseLists, use student one
  // if "Instructor Courses" in #account-show → use second courseList
  const courseLists = $(".courseList--coursesForTerm");
  let courseBoxes = $(".courseBox"); // default fallback

  if (courseLists.length > 1) {
    const accountText = $("#account-show").text();
    if (accountText.includes("Instructor Courses")) {
      courseBoxes = courseLists.eq(1).find(".courseBox");
    } else {
      courseBoxes = courseLists.first().find(".courseBox");
    }
  } else if (courseLists.length === 1) {
    courseBoxes = courseLists.first().find(".courseBox");
  }

  if (courseBoxes.length > 0) {
    courseBoxes.each((_, el) => {
      // Reference: course_urls = [elem.get_attribute("href")]
      const href = $(el).attr("href") || $(el).find("a").attr("href") || "";
      const match = href.match(/\/courses\/(\d+)/);
      if (!match) return;

      const id = match[1];
      if (seen.has(id)) return;
      seen.add(id);

      const shortName = $(el).find(".courseBox--shortname").text().trim();
      const name = $(el).find(".courseBox--name").text().trim() || $(el).text().trim();

      courses.push({ id, name: name || shortName || `Course ${id}`, shortName });
    });
  } else {
    // Last fallback: any link to /courses/<id>
    $('a[href^="/courses/"]').each((_, el) => {
      const href = $(el).attr("href") || "";
      const match = href.match(/^\/courses\/(\d+)/);
      if (!match) return;

      const id = match[1];
      if (seen.has(id)) return;
      seen.add(id);

      const shortName = $(el).find(".courseBox--shortname").text().trim();
      const name = $(el).find(".courseBox--name").text().trim() || $(el).text().trim();

      courses.push({ id, name: name || shortName || `Course ${id}`, shortName });
    });
  }

  logger.info("fetchGradescopeCourses", { count: courses.length });
  return courses;
}

/**
 * Parses a Gradescope datetime string into an ISO 8601 string.
 *
 * Reference repo format: "%Y-%m-%d %H:%M:%S %z"
 * Example: "2026-03-15 23:59:00 -0700"
 * Gradescope may also return ISO format in some contexts.
 *
 * @param raw - Raw datetime string from the datetime attribute
 * @returns ISO 8601 datetime string or null if unparseable
 */
function parseGradescopeDate(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Try the Gradescope-specific format first: "2026-03-15 23:59:00 -0700"
  // Reference: datetime.strptime(due_date_unformatted, '%Y-%m-%d %H:%M:%S %z')
  const gsMatch = trimmed.match(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+([+-]\d{4})$/
  );
  if (gsMatch) {
    const isoStr = `${gsMatch[1]}T${gsMatch[2]}${gsMatch[3]}`;
    const parsed = new Date(isoStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  // Fallback: try direct parse (handles ISO 8601 and other standard formats)
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d.toISOString();
  }

  logger.warn("parseGradescopeDate: could not parse", { raw });
  return null;
}

/**
 * Fetches assignments for a single Gradescope course.
 *
 * Reference repo flow (seleniumscraping.py assignment_scrape):
 *   1. driver.get(course_href)
 *   2. Wait for .courseHeader--title
 *   3. course = .courseHeader--title text
 *   4. tbody = driver.find_element(By.TAG_NAME, 'tbody')
 *   5. assignments = tbody.find_elements(By.TAG_NAME, 'tr')
 *   6. For each row:
 *      - assignment_primary = .table--primaryLink
 *      - name = assignment_primary.text
 *      - href = assignment_primary > a[href]
 *      - due_date = .submissionTimeChart--dueDate[datetime]
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
    `${GRADESCOPE_BASE}/courses/${courseId}`
  );
  if (!pageRes.ok) {
    throw new Error(
      `Gradescope course page ${courseId} returned ${pageRes.status}`
    );
  }

  const html = await pageRes.text();
  const $ = cheerio.load(html);
  const assignments: NormalizedAssignment[] = [];

  // Reference: course = driver.find_element(By.CLASS_NAME, "courseHeader--title").text
  const pageTitle = $(".courseHeader--title").text().trim();
  const resolvedCourseName = pageTitle || courseName;

  // Reference: tbody > tr
  $("tbody > tr").each((_, row) => {
    const $row = $(row);

    // Reference: assignment_primary = .table--primaryLink
    //            assignment_name = assignment_primary.text
    //            assignment_href = assignment_primary > a[href]
    const primaryLink = $row.find(".table--primaryLink");
    let title = "";
    let href = "";

    if (primaryLink.length) {
      title = primaryLink.text().trim();
      const anchor = primaryLink.find("a").first();
      href = anchor.attr("href") || "";
    } else {
      // Fallback: first anchor in the row
      const anchor = $row.find("a").first();
      title = anchor.text().trim();
      href = anchor.attr("href") || "";
    }

    if (!title) return;

    // Extract assignment ID from href, data-url attribute, or row id
    let assignmentId = "";
    const idMatch = href.match(/\/assignments\/(\d+)/);
    if (idMatch) {
      assignmentId = idMatch[1];
    } else {
      // Fallback: check data-url attribute on the row
      const dataUrl = $row.attr("data-url") || "";
      const dataIdMatch = dataUrl.match(/\/assignments\/(\d+)/);
      if (dataIdMatch) {
        assignmentId = dataIdMatch[1];
        if (!href) href = dataUrl;
      } else {
        // Fallback: extract from row id attribute (e.g. "assignment_12345")
        const rowId = $row.attr("id") || "";
        const rowIdMatch = rowId.match(/assignment[_-]?(\d+)/);
        if (rowIdMatch) assignmentId = rowIdMatch[1];
      }
    }

    const externalId = assignmentId
      ? assignmentId
      : `gs-${courseId}-${title.replace(/\s+/g, "-")}`;

    // Build source_url with fallback from courseId + assignmentId
    let sourceUrl: string | null = null;
    if (href) {
      sourceUrl = href.startsWith("http") ? href : `${GRADESCOPE_BASE}${href}`;
    } else if (assignmentId) {
      sourceUrl = `${GRADESCOPE_BASE}/courses/${courseId}/assignments/${assignmentId}/submissions`;
    }

    // Detect submission status from row content
    const hasScoreBadge = $row.find(".submissionStatus--score").length > 0;
    const statusText = $row.find(".submissionStatus--text").text().toLowerCase();
    const rowClasses = $row.attr("class") || "";
    const isSubmitted =
      hasScoreBadge ||
      statusText.includes("submitted") ||
      statusText.includes("graded") ||
      rowClasses.includes("submitted");

    // Reference: due_date_element = .submissionTimeChart--dueDate
    //            due_date_unformatted = due_date_element.get_attribute("datetime")
    const dueDateEl = $row.find(".submissionTimeChart--dueDate");
    let rawDate = dueDateEl.attr("datetime") || null;

    // Fallback: any element with datetime attribute
    if (!rawDate) {
      rawDate = $row.find("[datetime]").attr("datetime") || null;
    }

    const dueDate = parseGradescopeDate(rawDate);

    // Points from submission score
    const pointsText = $row
      .find(".submissionStatus--score, .points-column")
      .text()
      .trim();
    const pointsMatch = pointsText.match(/([\d.]+)/);
    const pointsPossible = pointsMatch ? parseFloat(pointsMatch[1]) : null;

    assignments.push({
      external_id: externalId,
      course_name: resolvedCourseName,
      course_id: courseId,
      title,
      due_date: dueDate,
      source_url: sourceUrl,
      points_possible: pointsPossible,
      is_submitted: isSubmitted,
    });
  });

  logger.info("fetchGradescopeAssignments", {
    courseId,
    count: assignments.length,
  });
  return assignments;
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
      const assignments = await fetchGradescopeAssignments(
        jar,
        course.id,
        course.name
      );
      results.push(...assignments);
    } catch (err) {
      logger.error("Failed to fetch Gradescope assignments for course", {
        courseId: course.id,
        courseName: course.name,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  logger.info("fetchAllGradescopeAssignments", {
    totalAssignments: results.length,
  });
  return results;
}

/**
 * Fetches assignments only for the specified Gradescope courses.
 * Used when the user has selected specific courses to sync during onboarding.
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
      const assignments = await fetchGradescopeAssignments(
        jar,
        course.id,
        course.name
      );
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
