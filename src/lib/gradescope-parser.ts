/**
 * Gradescope parsing utilities — React props JSON (instructor) + HTML scraping (student).
 * @module gradescope-parser
 */

import * as cheerio from "cheerio";
import { logger } from "@/lib/logger";
import type { NormalizedAssignment } from "@/lib/canvas-client";

const GRADESCOPE_BASE = "https://www.gradescope.com";

/** Shape of an assignment in AssignmentsTable React props JSON. */
interface GsReactAssignment {
  id: number;
  url?: string;
  title: string;
  total_points?: string | null;
  submission_window?: {
    due_date?: string | null;
    hard_due_date?: string | null;
  };
}

/** Parses Gradescope datetime ("2026-03-15 23:59:00 -0700" or ISO 8601) to ISO string. */
export function parseGradescopeDate(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const gsMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+([+-]\d{4})$/);
  if (gsMatch) {
    const parsed = new Date(`${gsMatch[1]}T${gsMatch[2]}${gsMatch[3]}`);
    if (!isNaN(parsed.getTime())) return parsed.toISOString();
  }
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) return d.toISOString();
  logger.warn("parseGradescopeDate: could not parse", { raw });
  return null;
}

/**
 * Parses assignments from embedded React props JSON (instructor/TA view).
 * Returns null if no AssignmentsTable React component found → caller should use HTML fallback.
 */
export function parseAssignmentsFromReactProps(
  html: string,
  courseId: string,
  courseName: string
): NormalizedAssignment[] | null {
  const $ = cheerio.load(html);

  const reactDiv = $('div[data-react-class="AssignmentsTable"]');
  if (!reactDiv.length) return null;
  const propsStr = reactDiv.attr("data-react-props");
  if (!propsStr) return null;

  let props: { table_data?: GsReactAssignment[] };
  try { props = JSON.parse(propsStr); } catch {
    logger.warn("parseAssignmentsFromReactProps: malformed JSON", { courseId });
    return null;
  }
  if (!Array.isArray(props.table_data)) {
    logger.warn("parseAssignmentsFromReactProps: missing table_data", { courseId });
    return null;
  }

  const resolvedName = $(".courseHeader--title").text().trim() || courseName;
  const assignments: NormalizedAssignment[] = [];
  const seenIds = new Set<string>();

  for (const item of props.table_data) {
    if (!item.title || !item.id) continue;

    const externalId = String(item.id);
    if (seenIds.has(externalId)) continue;
    seenIds.add(externalId);

    const sourceUrl = item.url
      ? `${GRADESCOPE_BASE}${item.url}`
      : `${GRADESCOPE_BASE}/courses/${courseId}/assignments/${externalId}`;

    const dueDate = parseGradescopeDate(item.submission_window?.due_date ?? null);
    const lateDueDate = parseGradescopeDate(item.submission_window?.hard_due_date ?? null);
    let pointsPossible: number | null = null;
    if (item.total_points != null) {
      const p = parseFloat(String(item.total_points));
      if (!isNaN(p)) pointsPossible = p;
    }

    assignments.push({
      external_id: externalId,
      course_name: resolvedName,
      course_id: courseId,
      title: item.title,
      due_date: dueDate,
      late_due_date: lateDueDate,
      source_url: sourceUrl,
      points_possible: pointsPossible,
      is_submitted: false,
    });
  }

  logger.info("parseAssignmentsFromReactProps", { courseId, count: assignments.length });
  return assignments;
}

/** Extracts title and href from a table row. Tries: .table--primaryLink, <th>, first <a>. */
function extractTitleAndHref(
  $row: ReturnType<cheerio.CheerioAPI>,
  $: cheerio.CheerioAPI
): { title: string; href: string } | null {
  const primaryLink = $row.find(".table--primaryLink");
  if (primaryLink.length) {
    const title = primaryLink.text().trim();
    const href = primaryLink.find("a").first().attr("href") || "";
    if (title) return { title, href };
  }
  const thCell = $row.find("th").first();
  if (thCell.length) {
    const anchor = thCell.find("a").first();
    const title = anchor.length ? anchor.text().trim() : thCell.text().trim();
    const href = anchor.attr("href") || "";
    if (title) return { title, href };
  }
  const anchor = $row.find("a").first();
  if (anchor.length) {
    const title = anchor.text().trim();
    const href = anchor.attr("href") || "";
    if (title) return { title, href };
  }

  return null;
}

/** Extracts assignment ID from row. Tries: href, button data-attr, data-url, row id. */
function extractAssignmentId(
  $row: ReturnType<cheerio.CheerioAPI>,
  href: string
): { assignmentId: string; href: string } {
  const idMatch = href.match(/\/assignments\/(\d+)/);
  if (idMatch) return { assignmentId: idMatch[1], href };

  const submitBtn = $row.find("button.js-submitAssignment, button[data-assignment-id]");
  if (submitBtn.length) {
    const id = submitBtn.attr("data-assignment-id") || "";
    if (id) return { assignmentId: id, href };
  }

  const dataUrl = $row.attr("data-url") || "";
  const dataIdMatch = dataUrl.match(/\/assignments\/(\d+)/);
  if (dataIdMatch) return { assignmentId: dataIdMatch[1], href: href || dataUrl };

  const rowId = $row.attr("id") || "";
  const rowIdMatch = rowId.match(/assignment[_-]?(\d+)/);
  if (rowIdMatch) return { assignmentId: rowIdMatch[1], href };

  return { assignmentId: "", href };
}

/** Detects submission status from score badges, status text, row classes, and grade cells. */
function detectSubmissionStatus(
  $row: ReturnType<cheerio.CheerioAPI>
): boolean {
  if ($row.find(".submissionStatus--score").length > 0) return true;

  const statusText = $row.find(".submissionStatus--text").text().toLowerCase();
  if (statusText.includes("submitted") || statusText.includes("graded")) return true;

  if (($row.attr("class") || "").includes("submitted")) return true;

  let hasGrade = false;
  $row.find("td").each((_, cell) => {
    const text = $row.find(cell).text().trim();
    if (/^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$/.test(text)) hasGrade = true;
  });
  return hasGrade;
}

/** Parses assignments from Gradescope HTML tables (student view). Multiple selector strategies. */
export function parseAssignmentsFromHtml(
  html: string,
  courseId: string,
  courseName: string
): NormalizedAssignment[] {
  const $ = cheerio.load(html);
  const assignments: NormalizedAssignment[] = [];
  const seenIds = new Set<string>();

  const resolvedName = $(".courseHeader--title").text().trim() || courseName;
  const rows = $('tr[role="row"], tbody > tr');

  rows.each((_, row) => {
    const $row = $(row);

    // Skip header rows
    if ($row.find("th").length > 0 && $row.closest("thead").length > 0) return;
    if ($row.children("th").length === $row.children().length) {
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

    if (seenIds.has(externalId)) return;
    seenIds.add(externalId);

    let sourceUrl: string | null = null;
    if (href) {
      sourceUrl = href.startsWith("http") ? href : `${GRADESCOPE_BASE}${href}`;
    } else if (assignmentId) {
      sourceUrl = `${GRADESCOPE_BASE}/courses/${courseId}/assignments/${assignmentId}/submissions`;
    }

    const isSubmitted = detectSubmissionStatus($row);

    const dueDateEls = $row.find(".submissionTimeChart--dueDate");
    let rawDate: string | null = dueDateEls.length >= 1 ? dueDateEls.eq(0).attr("datetime") || null : null;
    let rawLateDueDate: string | null = dueDateEls.length >= 2 ? dueDateEls.eq(1).attr("datetime") || null : null;

    if (!rawDate) {
      const datetimeEls = $row.find("[datetime]").filter((_, el) => {
        const cls = ($(el).attr("class") || "").toLowerCase();
        const parentCls = ($(el).parent().attr("class") || "").toLowerCase();
        return !cls.includes("release") && !parentCls.includes("release")
          && !cls.includes("open") && !parentCls.includes("open");
      });
      if (datetimeEls.length >= 2) {
        rawDate = datetimeEls.eq(1).attr("datetime") || null;
        if (datetimeEls.length >= 3) {
          rawLateDueDate = datetimeEls.eq(2).attr("datetime") || null;
        }
      }
    }

    const dueDate = parseGradescopeDate(rawDate);
    const lateDueDate = parseGradescopeDate(rawLateDueDate);

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
      course_name: resolvedName,
      course_id: courseId,
      title,
      due_date: dueDate,
      late_due_date: lateDueDate,
      source_url: sourceUrl,
      points_possible: pointsPossible,
      is_submitted: isSubmitted,
    });
  });

  logger.info("parseAssignmentsFromHtml", { courseId, count: assignments.length });
  return assignments;
}
