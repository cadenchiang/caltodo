/**
 * Tests for Gradescope parser module.
 * Covers React props JSON parsing (instructor view) and HTML table scraping (student view).
 * Uses realistic HTML fixtures based on Gradescope page structures documented
 * by Teaching-and-Learning-in-Computing/Gradescope and nyuoss/gradescope-api.
 */

import { describe, it, expect, vi } from "vitest";

// Mock logger before importing module under test
vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const {
  parseGradescopeDate,
  parseAssignmentsFromReactProps,
  parseAssignmentsFromHtml,
} = await import("@/lib/gradescope-parser");

// ---------------------------------------------------------------------------
// parseGradescopeDate
// ---------------------------------------------------------------------------
describe("parseGradescopeDate", () => {
  it("should parse Gradescope-specific format: YYYY-MM-DD HH:MM:SS ±HHMM", () => {
    const result = parseGradescopeDate("2026-03-15 23:59:00 -0700");
    expect(result).toBeTruthy();
    expect(new Date(result!).getTime()).not.toBeNaN();
    // -0700 means UTC is +7h → Mar 16 06:59:00 UTC
    expect(result).toContain("2026-03-16");
  });

  it("should parse ISO 8601 format", () => {
    expect(parseGradescopeDate("2026-03-15T23:59:00.000Z")).toBe(
      "2026-03-15T23:59:00.000Z"
    );
  });

  it("should parse ISO 8601 with timezone offset", () => {
    const result = parseGradescopeDate("2026-01-15T00:00:00.000-08:00");
    expect(result).toBeTruthy();
    expect(new Date(result!).getTime()).not.toBeNaN();
  });

  it("should return null for null input", () => {
    expect(parseGradescopeDate(null)).toBeNull();
  });

  it("should return null for empty string", () => {
    expect(parseGradescopeDate("")).toBeNull();
    expect(parseGradescopeDate("  ")).toBeNull();
  });

  it("should return null for unparseable string", () => {
    expect(parseGradescopeDate("not-a-date")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// parseAssignmentsFromReactProps
// ---------------------------------------------------------------------------
describe("parseAssignmentsFromReactProps", () => {
  /** Helper to build a page with AssignmentsTable React props. */
  function buildReactPropsPage(
    tableData: object[],
    courseTitle?: string
  ): string {
    const props = JSON.stringify({ table_data: tableData });
    const titleHtml = courseTitle
      ? `<h1 class="courseHeader--title">${courseTitle}</h1>`
      : "";
    return `
      <html><body>
        ${titleHtml}
        <div data-react-class="AssignmentsTable"
             data-react-props='${props.replace(/'/g, "&#39;")}'>
        </div>
      </body></html>
    `;
  }

  it("should parse assignments from React props JSON", () => {
    const html = buildReactPropsPage(
      [
        {
          id: 12345,
          title: "Homework 1",
          url: "/courses/100/assignments/12345",
          total_points: "100.0",
          submission_window: {
            release_date: "2026-01-15T00:00:00.000-08:00",
            due_date: "2026-02-01T23:59:00.000-08:00",
            hard_due_date: "2026-02-03T23:59:00.000-08:00",
          },
          grading_progress: "Graded",
          is_published: true,
        },
        {
          id: 12346,
          title: "Lab 1",
          url: "/courses/100/assignments/12346",
          total_points: "10",
          submission_window: {
            due_date: "2026-02-05T23:59:00.000-08:00",
            hard_due_date: null,
          },
        },
      ],
      "CS 61A: Structure and Interpretation"
    );

    const result = parseAssignmentsFromReactProps(html, "100", "CS 61A");

    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);

    expect(result![0].external_id).toBe("12345");
    expect(result![0].title).toBe("Homework 1");
    expect(result![0].course_name).toBe("CS 61A: Structure and Interpretation");
    expect(result![0].course_id).toBe("100");
    expect(result![0].source_url).toBe("https://www.gradescope.com/courses/100/assignments/12345");
    expect(result![0].points_possible).toBe(100);
    expect(result![0].due_date).toBeTruthy();
    expect(result![0].late_due_date).toBeTruthy();

    expect(result![1].external_id).toBe("12346");
    expect(result![1].title).toBe("Lab 1");
    expect(result![1].points_possible).toBe(10);
    expect(result![1].late_due_date).toBeNull();
  });

  it("should return null when no AssignmentsTable div exists", () => {
    const html = "<html><body><table><tr><td>No React here</td></tr></table></body></html>";
    const result = parseAssignmentsFromReactProps(html, "100", "CS 61A");
    expect(result).toBeNull();
  });

  it("should return null when data-react-props is missing", () => {
    const html = `<html><body><div data-react-class="AssignmentsTable"></div></body></html>`;
    const result = parseAssignmentsFromReactProps(html, "100", "CS 61A");
    expect(result).toBeNull();
  });

  it("should return null for malformed JSON in data-react-props", () => {
    const html = `
      <html><body>
        <div data-react-class="AssignmentsTable"
             data-react-props='{"invalid json'>
        </div>
      </body></html>
    `;
    const result = parseAssignmentsFromReactProps(html, "100", "CS 61A");
    expect(result).toBeNull();
  });

  it("should return null when table_data is not an array", () => {
    const html = `
      <html><body>
        <div data-react-class="AssignmentsTable"
             data-react-props='{"table_data": "not-an-array"}'>
        </div>
      </body></html>
    `;
    const result = parseAssignmentsFromReactProps(html, "100", "CS 61A");
    expect(result).toBeNull();
  });

  it("should return null when table_data key is missing", () => {
    const html = `
      <html><body>
        <div data-react-class="AssignmentsTable"
             data-react-props='{"other_key": []}'>
        </div>
      </body></html>
    `;
    const result = parseAssignmentsFromReactProps(html, "100", "CS 61A");
    expect(result).toBeNull();
  });

  it("should handle empty table_data array", () => {
    const html = buildReactPropsPage([]);
    const result = parseAssignmentsFromReactProps(html, "100", "CS 61A");
    expect(result).not.toBeNull();
    expect(result).toHaveLength(0);
  });

  it("should skip items without title or id", () => {
    const html = buildReactPropsPage([
      { id: 1, title: "Valid" },
      { id: null, title: "No ID" },
      { id: 2, title: "" },
      { id: 3, title: "Also Valid" },
    ]);
    const result = parseAssignmentsFromReactProps(html, "100", "CS 61A");
    expect(result).toHaveLength(2);
    expect(result![0].title).toBe("Valid");
    expect(result![1].title).toBe("Also Valid");
  });

  it("should deduplicate by assignment ID", () => {
    const html = buildReactPropsPage([
      { id: 100, title: "HW 1" },
      { id: 100, title: "HW 1 Duplicate" },
    ]);
    const result = parseAssignmentsFromReactProps(html, "200", "CS 61A");
    expect(result).toHaveLength(1);
    expect(result![0].title).toBe("HW 1");
  });

  it("should handle missing submission_window", () => {
    const html = buildReactPropsPage([
      { id: 1, title: "No Dates" },
    ]);
    const result = parseAssignmentsFromReactProps(html, "100", "CS 61A");
    expect(result![0].due_date).toBeNull();
    expect(result![0].late_due_date).toBeNull();
  });

  it("should handle null total_points", () => {
    const html = buildReactPropsPage([
      { id: 1, title: "No Points", total_points: null },
    ]);
    const result = parseAssignmentsFromReactProps(html, "100", "CS 61A");
    expect(result![0].points_possible).toBeNull();
  });

  it("should handle non-numeric total_points", () => {
    const html = buildReactPropsPage([
      { id: 1, title: "Bad Points", total_points: "n/a" },
    ]);
    const result = parseAssignmentsFromReactProps(html, "100", "CS 61A");
    expect(result![0].points_possible).toBeNull();
  });

  it("should build source URL from assignment ID when url is missing", () => {
    const html = buildReactPropsPage([
      { id: 999, title: "No URL" },
    ]);
    const result = parseAssignmentsFromReactProps(html, "100", "CS 61A");
    expect(result![0].source_url).toBe(
      "https://www.gradescope.com/courses/100/assignments/999"
    );
  });

  it("should use fallback course name when page title is absent", () => {
    const html = buildReactPropsPage(
      [{ id: 1, title: "HW 1" }],
      undefined // no course title in the HTML
    );
    const result = parseAssignmentsFromReactProps(html, "100", "Fallback Name");
    expect(result![0].course_name).toBe("Fallback Name");
  });

  it("should set is_submitted to false for React props (no per-student data)", () => {
    const html = buildReactPropsPage([
      { id: 1, title: "HW 1", grading_progress: "Graded" },
    ]);
    const result = parseAssignmentsFromReactProps(html, "100", "CS 61A");
    // React props are instructor view — no per-student submission data
    expect(result![0].is_submitted).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// parseAssignmentsFromHtml
// ---------------------------------------------------------------------------
describe("parseAssignmentsFromHtml", () => {
  it("should parse assignments using .table--primaryLink and .submissionTimeChart--dueDate", () => {
    const html = `
      <html><body>
        <h1 class="courseHeader--title">CS 61A: Structure and Interpretation</h1>
        <table><tbody>
          <tr>
            <td><div class="table--primaryLink"><a href="/courses/123/assignments/456">Homework 1</a></div></td>
            <td><div class="submissionTimeChart--dueDate" datetime="2026-03-15 23:59:00 -0700">Mar 15</div></td>
            <td><div class="submissionStatus--score">85.0 / 100</div></td>
          </tr>
          <tr>
            <td><div class="table--primaryLink"><a href="/courses/123/assignments/789">Lab 2</a></div></td>
            <td></td><td></td>
          </tr>
        </tbody></table>
      </body></html>
    `;

    const result = parseAssignmentsFromHtml(html, "123", "CS 61A");
    expect(result).toHaveLength(2);
    expect(result[0].external_id).toBe("456");
    expect(result[0].course_name).toBe("CS 61A: Structure and Interpretation");
    expect(result[0].title).toBe("Homework 1");
    expect(result[0].due_date).toBeTruthy();
    expect(result[0].points_possible).toBe(100);
    expect(result[0].is_submitted).toBe(true);

    expect(result[1].title).toBe("Lab 2");
    expect(result[1].due_date).toBeNull();
    expect(result[1].is_submitted).toBe(false);
  });

  it("should parse ISO 8601 datetime", () => {
    const html = `
      <html><body><table><tbody>
        <tr>
          <td><div class="table--primaryLink"><a href="/courses/123/assignments/456">HW 1</a></div></td>
          <td><div class="submissionTimeChart--dueDate" datetime="2026-03-15T23:59:00Z">Mar 15</div></td>
        </tr>
      </tbody></table></body></html>
    `;
    const result = parseAssignmentsFromHtml(html, "123", "CS 61A");
    expect(result[0].due_date).toBe("2026-03-15T23:59:00.000Z");
  });

  it("should separate primary and late due dates", () => {
    const html = `
      <html><body><table><tbody>
        <tr>
          <td><div class="table--primaryLink"><a href="/courses/123/assignments/456">HW 1</a></div></td>
          <td>
            <div class="submissionTimeChart--dueDate" datetime="2026-03-15 23:59:00 -0700">Mar 15</div>
            <div class="submissionTimeChart--dueDate" datetime="2026-03-18 23:59:00 -0700">Mar 18</div>
          </td>
        </tr>
      </tbody></table></body></html>
    `;
    const result = parseAssignmentsFromHtml(html, "123", "CS 61A");
    expect(result[0].due_date).toBeTruthy();
    expect(result[0].due_date!).toContain("2026-03-16");
    expect(result[0].late_due_date).toBeTruthy();
    expect(result[0].late_due_date!).toContain("2026-03-19");
  });

  it("should set late_due_date to null with single due date", () => {
    const html = `
      <html><body><table><tbody>
        <tr>
          <td><div class="table--primaryLink"><a href="/courses/123/assignments/456">HW 1</a></div></td>
          <td><div class="submissionTimeChart--dueDate" datetime="2026-03-15T23:59:00Z">Mar 15</div></td>
        </tr>
      </tbody></table></body></html>
    `;
    const result = parseAssignmentsFromHtml(html, "123", "CS 61A");
    expect(result[0].due_date).toBe("2026-03-15T23:59:00.000Z");
    expect(result[0].late_due_date).toBeNull();
  });

  it("should parse tr[role='row'] with th cells (newer layout)", () => {
    const html = `
      <html><body>
        <h1 class="courseHeader--title">DATA 100</h1>
        <table>
          <thead><tr role="row"><th>Name</th><th>Grade</th><th>Due</th></tr></thead>
          <tbody>
            <tr role="row">
              <th><a href="/courses/200/assignments/901">Lab 01</a></th>
              <td>10 / 10</td>
              <td><span class="submissionTimeChart--dueDate" datetime="2026-02-20 23:59:00 -0800">Feb 20</span></td>
            </tr>
            <tr role="row">
              <th><a href="/courses/200/assignments/902">Homework 01</a></th>
              <td></td>
              <td><span class="submissionTimeChart--dueDate" datetime="2026-02-25 23:59:00 -0800">Feb 25</span></td>
            </tr>
          </tbody>
        </table>
      </body></html>
    `;
    const result = parseAssignmentsFromHtml(html, "200", "DATA 100");
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Lab 01");
    expect(result[0].external_id).toBe("901");
    expect(result[0].is_submitted).toBe(true);
    expect(result[0].points_possible).toBe(10);
    expect(result[1].title).toBe("Homework 01");
    expect(result[1].is_submitted).toBe(false);
  });

  it("should extract ID from button.js-submitAssignment", () => {
    const html = `
      <html><body><table><tbody>
        <tr role="row">
          <th>Project 1</th>
          <td><button class="js-submitAssignment" data-assignment-id="1050">Submit</button></td>
          <td><span class="submissionTimeChart--dueDate" datetime="2026-03-01 23:59:00 -0800">Mar 1</span></td>
        </tr>
      </tbody></table></body></html>
    `;
    const result = parseAssignmentsFromHtml(html, "200", "CS 61A");
    expect(result).toHaveLength(1);
    expect(result[0].external_id).toBe("1050");
    expect(result[0].title).toBe("Project 1");
  });

  it("should fallback to data-url for assignment ID", () => {
    const html = `
      <html><body><table><tbody>
        <tr data-url="/courses/100/assignments/300">
          <td><div class="table--primaryLink">HW 2</div></td>
        </tr>
      </tbody></table></body></html>
    `;
    const result = parseAssignmentsFromHtml(html, "100", "CS 61A");
    expect(result[0].source_url).toBe("https://www.gradescope.com/courses/100/assignments/300");
    expect(result[0].external_id).toBe("300");
  });

  it("should fallback to row id for assignment ID", () => {
    const html = `
      <html><body><table><tbody>
        <tr id="assignment_400">
          <td><div class="table--primaryLink">HW 3</div></td>
        </tr>
      </tbody></table></body></html>
    `;
    const result = parseAssignmentsFromHtml(html, "100", "CS 61A");
    expect(result[0].external_id).toBe("400");
    expect(result[0].source_url).toBe(
      "https://www.gradescope.com/courses/100/assignments/400/submissions"
    );
  });

  it("should generate fallback external_id when no assignment ID found", () => {
    const html = `
      <html><body><table><tbody>
        <tr>
          <td><div class="table--primaryLink">Midterm Review</div></td>
        </tr>
      </tbody></table></body></html>
    `;
    const result = parseAssignmentsFromHtml(html, "100", "CS 61A");
    expect(result[0].external_id).toBe("gs-100-Midterm-Review");
    expect(result[0].source_url).toBeNull();
  });

  it("should detect is_submitted from .submissionStatus--score", () => {
    const html = `
      <html><body><table><tbody>
        <tr>
          <td><div class="table--primaryLink"><a href="/courses/100/assignments/500">HW 4</a></div></td>
          <td><span class="submissionStatus--score">95/100</span></td>
        </tr>
      </tbody></table></body></html>
    `;
    const result = parseAssignmentsFromHtml(html, "100", "CS 61A");
    expect(result[0].is_submitted).toBe(true);
  });

  it("should detect is_submitted from status text 'submitted'", () => {
    const html = `
      <html><body><table><tbody>
        <tr>
          <td><div class="table--primaryLink"><a href="/courses/100/assignments/600">HW 5</a></div></td>
          <td><span class="submissionStatus--text">Submitted</span></td>
        </tr>
      </tbody></table></body></html>
    `;
    const result = parseAssignmentsFromHtml(html, "100", "CS 61A");
    expect(result[0].is_submitted).toBe(true);
  });

  it("should detect is_submitted from status text 'graded'", () => {
    const html = `
      <html><body><table><tbody>
        <tr>
          <td><div class="table--primaryLink"><a href="/courses/100/assignments/700">HW 6</a></div></td>
          <td><span class="submissionStatus--text">Graded</span></td>
        </tr>
      </tbody></table></body></html>
    `;
    const result = parseAssignmentsFromHtml(html, "100", "CS 61A");
    expect(result[0].is_submitted).toBe(true);
  });

  it("should set is_submitted false when no submission indicators", () => {
    const html = `
      <html><body><table><tbody>
        <tr>
          <td><div class="table--primaryLink"><a href="/courses/100/assignments/800">HW 7</a></div></td>
          <td><span class="submissionStatus--text">No submission</span></td>
        </tr>
      </tbody></table></body></html>
    `;
    const result = parseAssignmentsFromHtml(html, "100", "CS 61A");
    expect(result[0].is_submitted).toBe(false);
  });

  it("should deduplicate assignments matched by multiple selectors", () => {
    const html = `
      <html><body><table><tbody>
        <tr role="row">
          <td><div class="table--primaryLink"><a href="/courses/123/assignments/456">HW 1</a></div></td>
        </tr>
      </tbody></table></body></html>
    `;
    const result = parseAssignmentsFromHtml(html, "123", "CS 61A");
    expect(result).toHaveLength(1);
  });

  it("should parse points from X / Y grade format in td cells", () => {
    const html = `
      <html><body><table><tbody>
        <tr role="row">
          <th><a href="/courses/200/assignments/999">HW 2</a></th>
          <td><span class="submissionStatus--score">8.5 / 10</span></td>
        </tr>
      </tbody></table></body></html>
    `;
    const result = parseAssignmentsFromHtml(html, "200", "CS 61A");
    expect(result[0].points_possible).toBe(10);
  });

  it("should NOT treat a single generic [datetime] as a due date", () => {
    const html = `
      <html><body><table><tbody>
        <tr role="row">
          <th><a href="/courses/200/assignments/1001">Discussion 1</a></th>
          <td><time datetime="2026-02-10 09:00:00 -0800">Feb 10</time></td>
          <td></td>
        </tr>
      </tbody></table></body></html>
    `;
    const result = parseAssignmentsFromHtml(html, "200", "CS 61A");
    expect(result[0].due_date).toBeNull();
  });

  it("should skip [datetime] elements with release-related classes in fallback", () => {
    const html = `
      <html><body><table><tbody>
        <tr role="row">
          <th><a href="/courses/200/assignments/1002">HW 3</a></th>
          <td><span class="submissionTimeChart--releaseDate" datetime="2026-02-10 09:00:00 -0800">Feb 10</span></td>
          <td><time datetime="2026-02-20 23:59:00 -0800">Feb 20</time></td>
        </tr>
      </tbody></table></body></html>
    `;
    const result = parseAssignmentsFromHtml(html, "200", "CS 61A");
    expect(result[0].due_date).toBeNull();
  });

  it("should fallback to first anchor when .table--primaryLink not found", () => {
    const html = `
      <html><body><table><tbody>
        <tr>
          <td><a href="/courses/123/assignments/456">Homework 1</a></td>
        </tr>
      </tbody></table></body></html>
    `;
    const result = parseAssignmentsFromHtml(html, "123", "CS 61A");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Homework 1");
  });

  it("should use page title over courseName param", () => {
    const html = `
      <html><body>
        <h1 class="courseHeader--title">CS 61A: Full Title From Page</h1>
        <table><tbody>
          <tr>
            <td><div class="table--primaryLink"><a href="/courses/123/assignments/1">HW 1</a></div></td>
          </tr>
        </tbody></table>
      </body></html>
    `;
    const result = parseAssignmentsFromHtml(html, "123", "Short Name");
    expect(result[0].course_name).toBe("CS 61A: Full Title From Page");
  });

  it("should return empty array for page with no assignments", () => {
    const html = "<html><body><p>No assignments yet.</p></body></html>";
    const result = parseAssignmentsFromHtml(html, "100", "CS 61A");
    expect(result).toHaveLength(0);
  });
});
