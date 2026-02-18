/**
 * Tests for Gradescope scraper client.
 * Mocks HTML responses to test CSRF extraction, login flow, and selector parsing.
 * HTML fixtures match the selectors from bennet-m/Google-Calendar-for-Gradescope.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fetch-cookie to return a wrapped fetch that uses our mockFetch
const mockFetch = vi.fn();
vi.mock("fetch-cookie", () => ({
  default: () => mockFetch,
}));

// Mock tough-cookie
vi.mock("tough-cookie", () => ({
  CookieJar: vi.fn().mockImplementation(() => ({})),
}));

// Import after mocks are set up
const { gradescopeLogin, fetchGradescopeCourses, fetchGradescopeAssignments } = await import(
  "@/lib/gradescope-client"
);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("gradescopeLogin", () => {
  it("should extract CSRF token from login page and POST credentials", async () => {
    // GET /login page with CSRF token
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () =>
        '<html><head><meta name="csrf-token" content="test-csrf-token-123" /></head><body></body></html>',
    });

    // POST login returns 302 redirect (success)
    mockFetch.mockResolvedValueOnce({
      status: 302,
    });

    const jar = await gradescopeLogin("test@example.com", "password123");
    expect(jar).toBeDefined();
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // Verify GET was to /login page
    expect(mockFetch.mock.calls[0][0]).toBe("https://www.gradescope.com/login");

    // Verify POST login
    const loginCall = mockFetch.mock.calls[1];
    expect(loginCall[0]).toBe("https://www.gradescope.com/login");
    expect(loginCall[1].method).toBe("POST");
  });

  it("should fallback to authenticity_token hidden input", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () =>
        '<html><body><form><input name="authenticity_token" value="hidden-token-456" /></form></body></html>',
    });

    mockFetch.mockResolvedValueOnce({ status: 302 });

    const jar = await gradescopeLogin("test@example.com", "password");
    expect(jar).toBeDefined();
  });

  it("should throw if CSRF token cannot be extracted", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => "<html><body>No CSRF token here</body></html>",
    });

    await expect(
      gradescopeLogin("test@example.com", "password")
    ).rejects.toThrow("Could not extract CSRF token");
  });

  it("should throw on failed login (non-302 response)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () =>
        '<html><head><meta name="csrf-token" content="token" /></head></html>',
    });

    mockFetch.mockResolvedValueOnce({ status: 200 });

    await expect(
      gradescopeLogin("wrong@example.com", "wrongpassword")
    ).rejects.toThrow("Gradescope login failed");
  });

  it("should throw if login page fetch fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
    });

    await expect(
      gradescopeLogin("test@example.com", "password")
    ).rejects.toThrow("Gradescope login page returned 503");
  });
});

describe("fetchGradescopeCourses", () => {
  it("should parse courses using .courseList--coursesForTerm .courseBox", async () => {
    const dashboardHtml = `
      <html><body>
        <div class="courseList--coursesForTerm">
          <a class="courseBox" href="/courses/12345">
            <div class="courseBox--shortname">CS 61A</div>
            <div class="courseBox--name">Structure and Interpretation</div>
          </a>
          <a class="courseBox" href="/courses/67890">
            <div class="courseBox--shortname">MATH 54</div>
            <div class="courseBox--name">Linear Algebra</div>
          </a>
        </div>
      </body></html>
    `;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => dashboardHtml,
    });

    const courses = await fetchGradescopeCourses({} as any);
    expect(courses).toHaveLength(2);
    expect(courses[0]).toEqual({
      id: "12345",
      name: "Structure and Interpretation",
      shortName: "CS 61A",
    });
    expect(courses[1].id).toBe("67890");
  });

  it("should skip instructor course list when #account-show has 'Instructor Courses'", async () => {
    const html = `
      <html><body>
        <div id="account-show">Instructor Courses</div>
        <div class="courseList--coursesForTerm">
          <a class="courseBox" href="/courses/999">
            <div class="courseBox--name">TA Course</div>
          </a>
        </div>
        <div class="courseList--coursesForTerm">
          <a class="courseBox" href="/courses/111">
            <div class="courseBox--name">Student Course</div>
          </a>
        </div>
      </body></html>
    `;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => html,
    });

    const courses = await fetchGradescopeCourses({} as any);
    expect(courses).toHaveLength(1);
    expect(courses[0].name).toBe("Student Course");
    expect(courses[0].id).toBe("111");
  });

  it("should deduplicate course IDs", async () => {
    const html = `
      <html><body>
        <div class="courseList--coursesForTerm">
          <a class="courseBox" href="/courses/111"><div class="courseBox--name">CS 61A</div></a>
          <a class="courseBox" href="/courses/111"><div class="courseBox--name">CS 61A</div></a>
        </div>
      </body></html>
    `;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => html,
    });

    const courses = await fetchGradescopeCourses({} as any);
    expect(courses).toHaveLength(1);
  });

  it("should fallback to a[href] when no courseBox found", async () => {
    const html = `
      <html><body>
        <a href="/courses/12345">
          <div class="courseBox--name">Fallback Course</div>
        </a>
      </body></html>
    `;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => html,
    });

    const courses = await fetchGradescopeCourses({} as any);
    expect(courses).toHaveLength(1);
    expect(courses[0].id).toBe("12345");
  });

  it("should handle empty dashboard", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => "<html><body>No courses</body></html>",
    });

    const courses = await fetchGradescopeCourses({} as any);
    expect(courses).toHaveLength(0);
  });
});

describe("fetchGradescopeAssignments", () => {
  it("should parse assignments using .table--primaryLink and .submissionTimeChart--dueDate", async () => {
    // Uses the Gradescope-specific datetime format: "%Y-%m-%d %H:%M:%S %z"
    const courseHtml = `
      <html><body>
        <h1 class="courseHeader--title">CS 61A: Structure and Interpretation</h1>
        <table>
          <tbody>
            <tr>
              <td><div class="table--primaryLink"><a href="/courses/123/assignments/456">Homework 1</a></div></td>
              <td><div class="submissionTimeChart--dueDate" datetime="2026-03-15 23:59:00 -0700">Mar 15</div></td>
              <td><div class="submissionStatus--score">85.0 / 100</div></td>
            </tr>
            <tr>
              <td><div class="table--primaryLink"><a href="/courses/123/assignments/789">Lab 2</a></div></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </body></html>
    `;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => courseHtml,
    });

    const assignments = await fetchGradescopeAssignments({} as any, "123", "CS 61A");

    expect(assignments).toHaveLength(2);
    expect(assignments[0].external_id).toBe("456");
    expect(assignments[0].course_name).toBe("CS 61A: Structure and Interpretation");
    expect(assignments[0].title).toBe("Homework 1");
    // Parsed from "2026-03-15 23:59:00 -0700" → ISO string
    expect(assignments[0].due_date).toBeTruthy();
    expect(new Date(assignments[0].due_date!).getTime()).not.toBeNaN();
    expect(assignments[0].source_url).toBe("https://www.gradescope.com/courses/123/assignments/456");
    // "85.0 / 100" → points_possible is the denominator (total possible)
    expect(assignments[0].points_possible).toBe(100);

    expect(assignments[1].title).toBe("Lab 2");
    expect(assignments[1].due_date).toBeNull();
  });

  it("should also handle ISO 8601 datetime format", async () => {
    const courseHtml = `
      <html><body>
        <table>
          <tbody>
            <tr>
              <td><div class="table--primaryLink"><a href="/courses/123/assignments/456">HW 1</a></div></td>
              <td><div class="submissionTimeChart--dueDate" datetime="2026-03-15T23:59:00Z">Mar 15</div></td>
            </tr>
          </tbody>
        </table>
      </body></html>
    `;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => courseHtml,
    });

    const assignments = await fetchGradescopeAssignments({} as any, "123", "CS 61A");
    expect(assignments[0].due_date).toBe("2026-03-15T23:59:00.000Z");
  });

  it("should fallback to first anchor when .table--primaryLink not found", async () => {
    const courseHtml = `
      <html><body>
        <table><tbody>
          <tr>
            <td><a href="/courses/123/assignments/456">Homework 1</a></td>
          </tr>
        </tbody></table>
      </body></html>
    `;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => courseHtml,
    });

    const assignments = await fetchGradescopeAssignments({} as any, "123", "CS 61A");
    expect(assignments).toHaveLength(1);
    expect(assignments[0].title).toBe("Homework 1");
  });

  it("should override course name from .courseHeader--title", async () => {
    const courseHtml = `
      <html><body>
        <h1 class="courseHeader--title">CS 61A: Full Title From Page</h1>
        <table><tbody>
          <tr>
            <td><div class="table--primaryLink"><a href="/courses/123/assignments/1">HW 1</a></div></td>
          </tr>
        </tbody></table>
      </body></html>
    `;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => courseHtml,
    });

    const assignments = await fetchGradescopeAssignments({} as any, "123", "Short Name");
    expect(assignments[0].course_name).toBe("CS 61A: Full Title From Page");
  });

  it("should throw on failed page fetch", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(
      fetchGradescopeAssignments({} as any, "999", "Unknown")
    ).rejects.toThrow("Gradescope course page 999 returned 404");
  });

  it("should fallback to data-url when primary link has no href", async () => {
    const html = `
      <html><body>
        <table><tbody>
          <tr data-url="/courses/100/assignments/300">
            <td><div class="table--primaryLink">HW 2</div></td>
          </tr>
        </tbody></table>
      </body></html>
    `;
    mockFetch.mockResolvedValueOnce({ ok: true, text: async () => html });

    const result = await fetchGradescopeAssignments({} as any, "100", "CS 61A");
    expect(result).toHaveLength(1);
    expect(result[0].source_url).toBe("https://www.gradescope.com/courses/100/assignments/300");
    expect(result[0].external_id).toBe("300");
  });

  it("should fallback to row id for assignment ID and build submissions URL", async () => {
    const html = `
      <html><body>
        <table><tbody>
          <tr id="assignment_400">
            <td><div class="table--primaryLink">HW 3</div></td>
          </tr>
        </tbody></table>
      </body></html>
    `;
    mockFetch.mockResolvedValueOnce({ ok: true, text: async () => html });

    const result = await fetchGradescopeAssignments({} as any, "100", "CS 61A");
    expect(result).toHaveLength(1);
    expect(result[0].source_url).toBe("https://www.gradescope.com/courses/100/assignments/400/submissions");
    expect(result[0].external_id).toBe("400");
  });

  it("should detect is_submitted from .submissionStatus--score", async () => {
    const html = `
      <html><body>
        <table><tbody>
          <tr>
            <td><div class="table--primaryLink"><a href="/courses/100/assignments/500">HW 4</a></div></td>
            <td><span class="submissionStatus--score">95/100</span></td>
          </tr>
        </tbody></table>
      </body></html>
    `;
    mockFetch.mockResolvedValueOnce({ ok: true, text: async () => html });

    const result = await fetchGradescopeAssignments({} as any, "100", "CS 61A");
    expect(result[0].is_submitted).toBe(true);
  });

  it("should detect is_submitted from status text 'submitted'", async () => {
    const html = `
      <html><body>
        <table><tbody>
          <tr>
            <td><div class="table--primaryLink"><a href="/courses/100/assignments/600">HW 5</a></div></td>
            <td><span class="submissionStatus--text">Submitted</span></td>
          </tr>
        </tbody></table>
      </body></html>
    `;
    mockFetch.mockResolvedValueOnce({ ok: true, text: async () => html });

    const result = await fetchGradescopeAssignments({} as any, "100", "CS 61A");
    expect(result[0].is_submitted).toBe(true);
  });

  it("should detect is_submitted from status text 'graded'", async () => {
    const html = `
      <html><body>
        <table><tbody>
          <tr>
            <td><div class="table--primaryLink"><a href="/courses/100/assignments/700">HW 6</a></div></td>
            <td><span class="submissionStatus--text">Graded</span></td>
          </tr>
        </tbody></table>
      </body></html>
    `;
    mockFetch.mockResolvedValueOnce({ ok: true, text: async () => html });

    const result = await fetchGradescopeAssignments({} as any, "100", "CS 61A");
    expect(result[0].is_submitted).toBe(true);
  });

  it("should set is_submitted false when no submission indicators", async () => {
    const html = `
      <html><body>
        <table><tbody>
          <tr>
            <td><div class="table--primaryLink"><a href="/courses/100/assignments/800">HW 7</a></div></td>
            <td><span class="submissionStatus--text">No submission</span></td>
          </tr>
        </tbody></table>
      </body></html>
    `;
    mockFetch.mockResolvedValueOnce({ ok: true, text: async () => html });

    const result = await fetchGradescopeAssignments({} as any, "100", "CS 61A");
    expect(result[0].is_submitted).toBe(false);
  });

  it("should generate fallback external_id when no assignment ID found", async () => {
    const html = `
      <html><body>
        <table><tbody>
          <tr>
            <td><div class="table--primaryLink">Midterm Review</div></td>
          </tr>
        </tbody></table>
      </body></html>
    `;
    mockFetch.mockResolvedValueOnce({ ok: true, text: async () => html });

    const result = await fetchGradescopeAssignments({} as any, "100", "CS 61A");
    expect(result).toHaveLength(1);
    expect(result[0].external_id).toBe("gs-100-Midterm-Review");
    expect(result[0].source_url).toBeNull();
  });

  it("should parse assignments from tr[role='row'] with th cells (newer layout)", async () => {
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
    mockFetch.mockResolvedValueOnce({ ok: true, text: async () => html });

    const result = await fetchGradescopeAssignments({} as any, "200", "DATA 100");
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Lab 01");
    expect(result[0].external_id).toBe("901");
    expect(result[0].is_submitted).toBe(true);
    expect(result[0].points_possible).toBe(10);
    expect(result[1].title).toBe("Homework 01");
    expect(result[1].external_id).toBe("902");
    expect(result[1].is_submitted).toBe(false);
  });

  it("should extract ID from button.js-submitAssignment", async () => {
    const html = `
      <html><body>
        <table><tbody>
          <tr role="row">
            <th>Project 1</th>
            <td><button class="js-submitAssignment" data-assignment-id="1050">Submit</button></td>
            <td><span class="submissionTimeChart--dueDate" datetime="2026-03-01 23:59:00 -0800">Mar 1</span></td>
          </tr>
        </tbody></table>
      </body></html>
    `;
    mockFetch.mockResolvedValueOnce({ ok: true, text: async () => html });

    const result = await fetchGradescopeAssignments({} as any, "200", "CS 61A");
    expect(result).toHaveLength(1);
    expect(result[0].external_id).toBe("1050");
    expect(result[0].title).toBe("Project 1");
  });

  it("should deduplicate assignments matched by multiple selectors", async () => {
    const html = `
      <html><body>
        <table><tbody>
          <tr role="row">
            <td><div class="table--primaryLink"><a href="/courses/123/assignments/456">HW 1</a></div></td>
          </tr>
        </tbody></table>
      </body></html>
    `;
    mockFetch.mockResolvedValueOnce({ ok: true, text: async () => html });

    const result = await fetchGradescopeAssignments({} as any, "123", "CS 61A");
    expect(result).toHaveLength(1);
  });

  it("should parse points from 'X / Y' grade format", async () => {
    const html = `
      <html><body>
        <table><tbody>
          <tr role="row">
            <th><a href="/courses/200/assignments/999">HW 2</a></th>
            <td><span class="submissionStatus--score">8.5 / 10</span></td>
          </tr>
        </tbody></table>
      </body></html>
    `;
    mockFetch.mockResolvedValueOnce({ ok: true, text: async () => html });

    const result = await fetchGradescopeAssignments({} as any, "200", "CS 61A");
    expect(result[0].points_possible).toBe(10);
    expect(result[0].is_submitted).toBe(true);
  });
});
