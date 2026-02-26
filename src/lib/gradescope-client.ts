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

/** Timeout in milliseconds for external Gradescope HTTP calls. */
const FETCH_TIMEOUT_MS = 30_000;

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
  const loginPageRes = await fetchWithCookies(`${GRADESCOPE_BASE}/login`, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
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
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
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

  const dashboardRes = await fetchWithCookies(GRADESCOPE_BASE, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
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
 * Extracts the assignment title from a table row using multiple selector strategies.
 * Tries: .table--primaryLink, th cell text, first anchor text.
 *
 * @param $row - Cheerio element for the row
 * @param $ - Cheerio root instance
 * @returns Object with title and href, or null if no title found
 */
function extractTitleAndHref(
  $row: ReturnType<cheerio.CheerioAPI>,
  $: cheerio.CheerioAPI
): { title: string; href: string } | null {
  // Strategy 1: .table--primaryLink (original Gradescope layout)
  const primaryLink = $row.find(".table--primaryLink");
  if (primaryLink.length) {
    const title = primaryLink.text().trim();
    const href = primaryLink.find("a").first().attr("href") || "";
    if (title) return { title, href };
  }

  // Strategy 2: First <th> cell text (newer Gradescope student view)
  const thCell = $row.find("th").first();
  if (thCell.length) {
    const anchor = thCell.find("a").first();
    const title = anchor.length ? anchor.text().trim() : thCell.text().trim();
    const href = anchor.attr("href") || "";
    if (title) return { title, href };
  }

  // Strategy 3: First anchor in the row
  const anchor = $row.find("a").first();
  if (anchor.length) {
    const title = anchor.text().trim();
    const href = anchor.attr("href") || "";
    if (title) return { title, href };
  }

  return null;
}

/**
 * Extracts the assignment ID from a row using multiple strategies.
 * Tries: href path, submit button data attr, data-url attr, row id attr.
 *
 * @param $row - Cheerio element for the row
 * @param href - Already-extracted href string
 * @returns Object with assignmentId and possibly updated href
 */
function extractAssignmentId(
  $row: ReturnType<cheerio.CheerioAPI>,
  href: string
): { assignmentId: string; href: string } {
  // Strategy 1: Extract from href
  const idMatch = href.match(/\/assignments\/(\d+)/);
  if (idMatch) return { assignmentId: idMatch[1], href };

  // Strategy 2: Submit button with data-assignment-id (newer Gradescope layout)
  const submitBtn = $row.find("button.js-submitAssignment, button[data-assignment-id]");
  if (submitBtn.length) {
    const id = submitBtn.attr("data-assignment-id") || "";
    if (id) return { assignmentId: id, href };
  }

  // Strategy 3: data-url attribute on the row
  const dataUrl = $row.attr("data-url") || "";
  const dataIdMatch = dataUrl.match(/\/assignments\/(\d+)/);
  if (dataIdMatch) {
    return { assignmentId: dataIdMatch[1], href: href || dataUrl };
  }

  // Strategy 4: Row id attribute (e.g. "assignment_12345")
  const rowId = $row.attr("id") || "";
  const rowIdMatch = rowId.match(/assignment[_-]?(\d+)/);
  if (rowIdMatch) return { assignmentId: rowIdMatch[1], href };

  return { assignmentId: "", href };
}

/**
 * Detects submission status from row content using multiple indicators.
 *
 * @param $row - Cheerio element for the row
 * @returns true if the assignment appears to be submitted
 */
function detectSubmissionStatus(
  $row: ReturnType<cheerio.CheerioAPI>
): boolean {
  // Score badge present
  if ($row.find(".submissionStatus--score").length > 0) return true;

  // Status text contains submitted/graded
  const statusText = $row.find(".submissionStatus--text").text().toLowerCase();
  if (statusText.includes("submitted") || statusText.includes("graded")) return true;

  // Row class indicates submitted
  const rowClasses = $row.attr("class") || "";
  if (rowClasses.includes("submitted")) return true;

  // Check for grade in td cells (newer layout: "X / Y" format)
  const cells = $row.find("td");
  let hasGrade = false;
  cells.each((_, cell) => {
    const text = $row.find(cell).text().trim();
    if (/^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$/.test(text)) hasGrade = true;
  });
  if (hasGrade) return true;

  return false;
}

/**
 * Fetches assignments for a single Gradescope course using multiple
 * selector strategies for maximum compatibility across Gradescope layouts.
 *
 * Combines selectors from:
 *   - bennet-m/Google-Calendar-for-Gradescope (original)
 *   - nyuoss/gradescope-api (newer student view with tr[role="row"])
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
  const $ = cheerio.load(html);
  const assignments: NormalizedAssignment[] = [];
  const seenIds = new Set<string>();

  const pageTitle = $(".courseHeader--title").text().trim();
  const resolvedCourseName = pageTitle || courseName;

  // Collect rows using multiple selectors for broad compatibility
  // tr[role="row"] covers newer Gradescope layouts; tbody > tr covers legacy
  const rows = $('tr[role="row"], tbody > tr');

  rows.each((_, row) => {
    const $row = $(row);

    // Skip header rows
    if ($row.find("th").length > 0 && $row.closest("thead").length > 0) return;
    if ($row.children("th").length === $row.children().length) {
      // All children are <th> — likely a header row
      const hasDatetime = $row.find("[datetime]").length > 0;
      const hasLink = $row.find("a[href*='/assignments/']").length > 0;
      if (!hasDatetime && !hasLink) return;
    }

    const extracted = extractTitleAndHref($row, $);
    if (!extracted) return;

    const { title } = extracted;
    let { href } = extracted;

    const { assignmentId, href: updatedHref } = extractAssignmentId($row, href);
    href = updatedHref;

    const externalId = assignmentId
      ? assignmentId
      : `gs-${courseId}-${title.replace(/\s+/g, "-")}`;

    // Deduplicate (multiple selectors may match the same row)
    if (seenIds.has(externalId)) return;
    seenIds.add(externalId);

    // Build source URL
    let sourceUrl: string | null = null;
    if (href) {
      sourceUrl = href.startsWith("http") ? href : `${GRADESCOPE_BASE}${href}`;
    } else if (assignmentId) {
      sourceUrl = `${GRADESCOPE_BASE}/courses/${courseId}/assignments/${assignmentId}/submissions`;
    }

    const isSubmitted = detectSubmissionStatus($row);

    // Due date: first .submissionTimeChart--dueDate is the primary deadline,
    // second (if present) is the late submission deadline.
    // Fallback: use [datetime] elements if the class-based selector misses.
    const dueDateEls = $row.find(".submissionTimeChart--dueDate");
    let rawDate: string | null = null;
    let rawLateDueDate: string | null = null;

    if (dueDateEls.length >= 1) {
      rawDate = dueDateEls.eq(0).attr("datetime") || null;
    }
    if (dueDateEls.length >= 2) {
      rawLateDueDate = dueDateEls.eq(1).attr("datetime") || null;
    }

    // Fallback when no .submissionTimeChart--dueDate found.
    // Generic [datetime] elements in a Gradescope row are ordered:
    //   [released, due, late_due]
    // A single [datetime] with no due-date class is the release date — skip it.
    if (!rawDate) {
      const datetimeEls = $row.find("[datetime]").filter((_, el) => {
        const cls = ($(el).attr("class") || "").toLowerCase();
        const parentCls = ($(el).parent().attr("class") || "").toLowerCase();
        // Exclude elements explicitly marked as release/open dates
        return !cls.includes("release") && !parentCls.includes("release")
          && !cls.includes("open") && !parentCls.includes("open");
      });
      if (datetimeEls.length >= 2) {
        // First remaining is usually release date, second is due date
        rawDate = datetimeEls.eq(1).attr("datetime") || null;
        if (datetimeEls.length >= 3) {
          rawLateDueDate = datetimeEls.eq(2).attr("datetime") || null;
        }
      }
      // Single generic [datetime] without a due-date class is likely
      // the release date — do NOT treat it as a due date.
    }

    const dueDate = parseGradescopeDate(rawDate);
    const lateDueDate = parseGradescopeDate(rawLateDueDate);

    // Points from submission score, grade cell, or any td with "X / Y" format
    let pointsPossible: number | null = null;
    const scoreBadge = $row.find(".submissionStatus--score, .points-column").text().trim();
    const gradeMatch = scoreBadge.match(/([\d.]+)\s*\/\s*([\d.]+)/);
    if (gradeMatch) {
      const parsed = parseFloat(gradeMatch[2]);
      pointsPossible = isNaN(parsed) ? null : parsed;
    } else if (scoreBadge) {
      const simpleMatch = scoreBadge.match(/([\d.]+)/);
      if (simpleMatch) {
        const parsed = parseFloat(simpleMatch[1]);
        pointsPossible = isNaN(parsed) ? null : parsed;
      }
    }
    // Fallback: scan td cells for "X / Y" grade format (newer layout)
    if (pointsPossible === null) {
      $row.find("td").each((_, cell) => {
        if (pointsPossible !== null) return;
        const text = $(cell).text().trim();
        const cellGrade = text.match(/^([\d.]+)\s*\/\s*([\d.]+)$/);
        if (cellGrade) {
          const parsed = parseFloat(cellGrade[2]);
          if (!isNaN(parsed)) pointsPossible = parsed;
        }
      });
    }

    assignments.push({
      external_id: externalId,
      course_name: resolvedCourseName,
      course_id: courseId,
      title,
      due_date: dueDate,
      late_due_date: lateDueDate,
      source_url: sourceUrl,
      points_possible: pointsPossible,
      is_submitted: isSubmitted,
    });
  });

  logger.info("fetchGradescopeAssignments", {
    courseId,
    count: assignments.length,
    totalRows: rows.length,
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
