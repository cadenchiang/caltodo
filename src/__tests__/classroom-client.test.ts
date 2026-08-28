/**
 * Tests for the Google Classroom API client.
 * Mocks fetch to cover due-date conversion, pagination, submission state,
 * per-course fault tolerance, and scope rejection.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import {
  fetchClassroomCourses,
  fetchCourseWork,
  fetchSubmittedIds,
  fetchClassroomAssignments,
  toDueIso,
  ClassroomScopeError,
} from "@/lib/classroom-client";

const TOKEN = "ya29.token";

/** Builds a Google API response stub. */
function googleResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("toDueIso", () => {
  it("combines a date and time into a UTC timestamp", () => {
    expect(toDueIso({ year: 2026, month: 9, day: 4 }, { hours: 17, minutes: 30 })).toBe(
      "2026-09-04T17:30:00.000Z"
    );
  });

  it("defaults a missing time to end of day, not midnight", () => {
    // Midnight UTC would land on the previous day in western timezones and
    // show the assignment as due a day early.
    expect(toDueIso({ year: 2026, month: 9, day: 4 }, undefined)).toBe(
      "2026-09-04T23:59:00.000Z"
    );
  });

  it("handles a zero hour without falling back to the default", () => {
    expect(toDueIso({ year: 2026, month: 9, day: 4 }, { hours: 0, minutes: 0 })).toBe(
      "2026-09-04T00:00:00.000Z"
    );
  });

  it("returns null when there is no due date", () => {
    expect(toDueIso(undefined, { hours: 12, minutes: 0 })).toBeNull();
    expect(toDueIso({ year: 2026 }, undefined)).toBeNull();
    expect(toDueIso({}, undefined)).toBeNull();
  });
});

describe("fetchClassroomCourses", () => {
  it("returns active courses the user is a student in", async () => {
    fetchMock.mockResolvedValue(
      googleResponse(200, { courses: [{ id: "c1", name: "Biology" }, { id: "c2", name: "Algebra" }] })
    );

    await expect(fetchClassroomCourses(TOKEN)).resolves.toEqual([
      { id: "c1", name: "Biology" },
      { id: "c2", name: "Algebra" },
    ]);

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("courseStates=ACTIVE");
    expect(url).toContain("studentId=me");
  });

  it("follows pagination", async () => {
    fetchMock
      .mockResolvedValueOnce(
        googleResponse(200, { courses: [{ id: "c1", name: "One" }], nextPageToken: "t2" })
      )
      .mockResolvedValueOnce(googleResponse(200, { courses: [{ id: "c2", name: "Two" }] }));

    const courses = await fetchClassroomCourses(TOKEN);
    expect(courses.map((c) => c.id)).toEqual(["c1", "c2"]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toContain("pageToken=t2");
  });

  it("names an untitled course rather than showing a blank", async () => {
    fetchMock.mockResolvedValue(googleResponse(200, { courses: [{ id: "c1" }] }));
    await expect(fetchClassroomCourses(TOKEN)).resolves.toEqual([
      { id: "c1", name: "Untitled course" },
    ]);
  });

  it("skips entries with no id", async () => {
    fetchMock.mockResolvedValue(
      googleResponse(200, { courses: [{ name: "Ghost" }, { id: "c1", name: "Real" }] })
    );
    await expect(fetchClassroomCourses(TOKEN)).resolves.toEqual([{ id: "c1", name: "Real" }]);
  });

  it("raises a scope error on 403 so the UI can prompt a reconnect", async () => {
    fetchMock.mockResolvedValue(googleResponse(403, { error: "insufficient scope" }));
    await expect(fetchClassroomCourses(TOKEN)).rejects.toBeInstanceOf(ClassroomScopeError);
  });

  it("raises a scope error on 401 too", async () => {
    fetchMock.mockResolvedValue(googleResponse(401, { error: "unauthorized" }));
    await expect(fetchClassroomCourses(TOKEN)).rejects.toBeInstanceOf(ClassroomScopeError);
  });

  it("raises a plain error on other failures", async () => {
    fetchMock.mockResolvedValue(googleResponse(500, { error: "boom" }));
    const promise = fetchClassroomCourses(TOKEN);
    await expect(promise).rejects.toThrow(/HTTP 500/);
    await expect(promise).rejects.not.toBeInstanceOf(ClassroomScopeError);
  });
});

describe("fetchCourseWork", () => {
  const course = { id: "c1", name: "Biology" };

  it("normalizes coursework into the shared assignment shape", async () => {
    fetchMock.mockResolvedValue(
      googleResponse(200, {
        courseWork: [
          {
            id: "w1",
            title: "Lab report",
            description: "Write it up",
            alternateLink: "https://classroom.google.com/w1",
            maxPoints: 20,
            dueDate: { year: 2026, month: 9, day: 4 },
            dueTime: { hours: 17, minutes: 30 },
          },
        ],
      })
    );

    await expect(fetchCourseWork(TOKEN, course)).resolves.toEqual([
      {
        external_id: "w1",
        course_name: "Biology",
        course_id: "c1",
        title: "Lab report",
        due_date: "2026-09-04T17:30:00.000Z",
        source_url: "https://classroom.google.com/w1",
        points_possible: 20,
        is_submitted: false,
        description: "Write it up",
      },
    ]);
  });

  it("requests only published work", async () => {
    fetchMock.mockResolvedValue(googleResponse(200, { courseWork: [] }));
    await fetchCourseWork(TOKEN, course);
    expect(fetchMock.mock.calls[0][0]).toContain("courseWorkStates=PUBLISHED");
  });

  it("handles work with no due date, points, link or description", async () => {
    fetchMock.mockResolvedValue(googleResponse(200, { courseWork: [{ id: "w1", title: "Read" }] }));
    const [work] = await fetchCourseWork(TOKEN, course);
    expect(work.due_date).toBeNull();
    expect(work.points_possible).toBeNull();
    expect(work.source_url).toBeNull();
    expect(work.description).toBeNull();
  });

  it("titles untitled work rather than showing a blank", async () => {
    fetchMock.mockResolvedValue(googleResponse(200, { courseWork: [{ id: "w1" }] }));
    const [work] = await fetchCourseWork(TOKEN, course);
    expect(work.title).toBe("Untitled assignment");
  });
});

describe("fetchSubmittedIds", () => {
  it("counts both turned-in and returned work as submitted", async () => {
    fetchMock
      .mockResolvedValueOnce(
        googleResponse(200, { studentSubmissions: [{ courseWorkId: "w1" }] })
      )
      .mockResolvedValueOnce(
        googleResponse(200, { studentSubmissions: [{ courseWorkId: "w2" }] })
      );

    const ids = await fetchSubmittedIds(TOKEN, "c1");
    expect([...ids].sort()).toEqual(["w1", "w2"]);
    expect(fetchMock.mock.calls[0][0]).toContain("states=TURNED_IN");
    expect(fetchMock.mock.calls[1][0]).toContain("states=RETURNED");
  });

  it("scopes the request to the signed-in student", async () => {
    fetchMock.mockResolvedValue(googleResponse(200, { studentSubmissions: [] }));
    await fetchSubmittedIds(TOKEN, "c1");
    expect(fetchMock.mock.calls[0][0]).toContain("userId=me");
  });
});

describe("fetchClassroomAssignments", () => {
  const courses = [
    { id: "c1", name: "Biology" },
    { id: "c2", name: "Algebra" },
  ];

  /** Routes a request to a canned response based on its URL. */
  function route(handler: (url: string) => Response) {
    fetchMock.mockImplementation((url: string) => Promise.resolve(handler(url)));
  }

  it("marks assignments the student already handed in", async () => {
    route((url) => {
      if (url.includes("studentSubmissions")) {
        return googleResponse(200, {
          studentSubmissions: url.includes("TURNED_IN") ? [{ courseWorkId: "w1" }] : [],
        });
      }
      return googleResponse(200, {
        courseWork: [{ id: "w1", title: "Done" }, { id: "w2", title: "Outstanding" }],
      });
    });

    const all = await fetchClassroomAssignments(TOKEN, [courses[0]]);
    expect(all.find((a) => a.external_id === "w1")?.is_submitted).toBe(true);
    expect(all.find((a) => a.external_id === "w2")?.is_submitted).toBe(false);
  });

  it("skips a broken course but keeps the others", async () => {
    route((url) => {
      if (url.includes("c2")) return googleResponse(500, { error: "boom" });
      if (url.includes("studentSubmissions")) return googleResponse(200, { studentSubmissions: [] });
      return googleResponse(200, { courseWork: [{ id: "w1", title: "Kept" }] });
    });

    const all = await fetchClassroomAssignments(TOKEN, courses);
    expect(all.map((a) => a.course_name)).toEqual(["Biology"]);
  });

  it("still returns assignments when submission state is unavailable", async () => {
    route((url) => {
      if (url.includes("studentSubmissions")) return googleResponse(500, { error: "boom" });
      return googleResponse(200, { courseWork: [{ id: "w1", title: "Work" }] });
    });

    const all = await fetchClassroomAssignments(TOKEN, [courses[0]]);
    expect(all).toHaveLength(1);
    expect(all[0].is_submitted).toBe(false);
  });

  it("rethrows a scope rejection instead of silently syncing nothing", async () => {
    fetchMock.mockResolvedValue(googleResponse(403, { error: "insufficient scope" }));
    await expect(fetchClassroomAssignments(TOKEN, courses)).rejects.toBeInstanceOf(
      ClassroomScopeError
    );
  });
});
