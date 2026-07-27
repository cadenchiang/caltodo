import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { isCanvasTokenValid, fetchCanvasAssignmentsForCourses } from "@/lib/canvas-client";

const BASE = "https://bcourses.berkeley.edu";
const TOKEN = "tok";

/** Minimal Response stand-in for the shapes the client inspects. */
function res(status: number, body: unknown = []): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    statusText: String(status),
    json: async () => body,
    headers: { get: () => null },
  } as unknown as Response;
}

describe("isCanvasTokenValid", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("reports valid when /users/self answers", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(res(200, { id: 1 })));
    expect(await isCanvasTokenValid(TOKEN, BASE)).toBe(true);
  });

  it("reports invalid only on an explicit 401", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(res(401)));
    expect(await isCanvasTokenValid(TOKEN, BASE)).toBe(false);
  });

  it("does not condemn the token on a server error or rate limit", async () => {
    for (const status of [403, 500, 503]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(res(status)));
      expect(await isCanvasTokenValid(TOKEN, BASE)).toBe(true);
    }
  });

  it("does not condemn the token when the network fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNRESET")));
    expect(await isCanvasTokenValid(TOKEN, BASE)).toBe(true);
  });
});

describe("fetchCanvasAssignmentsForCourses 401 handling", () => {
  const courses = [
    { id: 1553118, name: "Dropped Course" },
    { id: 1552387, name: "Working Course" },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /**
   * Routes fetch by URL: course-assignment reads answer with `perCourse`,
   * the /users/self probe answers with `selfStatus`.
   */
  function stubFetch(perCourse: Record<number, number>, selfStatus: number) {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes("/users/self")) return res(selfStatus, { id: 1 });
      const match = url.match(/courses\/(\d+)/);
      const courseId = match ? Number(match[1]) : 0;
      const status = perCourse[courseId] ?? 200;
      if (status !== 200) return res(status);
      return res(200, [
        { id: courseId * 10, name: "Essay", due_at: null, html_url: "u", points_possible: 1 },
      ]);
    });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("skips a course the token can no longer see and keeps the rest", async () => {
    // The reported production shape: the FIRST selected course 401s. Before
    // this fix that rethrew and zeroed out the whole account.
    stubFetch({ 1553118: 401 }, 200);

    const results = await fetchCanvasAssignmentsForCourses(TOKEN, BASE, courses);

    expect(results).toHaveLength(1);
    expect(results[0].course_id).toBe("1552387");
  });

  it("still fails the whole account when the token itself is dead", async () => {
    stubFetch({ 1553118: 401, 1552387: 401 }, 401);

    await expect(fetchCanvasAssignmentsForCourses(TOKEN, BASE, courses)).rejects.toThrow();
  });

  it("keeps swallowing non-auth per-course errors", async () => {
    stubFetch({ 1553118: 500 }, 200);

    const results = await fetchCanvasAssignmentsForCourses(TOKEN, BASE, courses);

    expect(results).toHaveLength(1);
  });

  it("does not probe /users/self when nothing 401s", async () => {
    const fetchMock = stubFetch({}, 200);

    await fetchCanvasAssignmentsForCourses(TOKEN, BASE, courses);

    const probed = fetchMock.mock.calls.some(([url]) => String(url).includes("/users/self"));
    expect(probed).toBe(false);
  });
});
