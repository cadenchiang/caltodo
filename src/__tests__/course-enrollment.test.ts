/**
 * Tests for course enrollment logic.
 * Verifies that courses are deduped by (source, external_id)
 * and memberships are created correctly.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { syncCourseEnrollments, gatherEnrollableCourses, type EnrollableCourse } from "@/lib/course-enrollment";

beforeEach(() => {
  vi.clearAllMocks();
});

function createMockAdminClient(options?: {
  upsertError?: { message: string } | null;
  selectData?: { id: string } | null;
  selectError?: { message: string } | null;
  membershipError?: { message: string } | null;
}) {
  const opts = {
    upsertError: null,
    selectData: { id: "course-uuid-1" },
    selectError: null,
    membershipError: null,
    ...options,
  };

  return {
    from: vi.fn((table: string) => {
      if (table === "courses") {
        return {
          upsert: vi.fn().mockReturnValue({ error: opts.upsertError }),
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: opts.selectData,
                  error: opts.selectError,
                }),
              }),
            }),
          }),
        };
      }
      if (table === "course_memberships") {
        return {
          upsert: vi.fn().mockReturnValue({ error: opts.membershipError }),
        };
      }
      return {};
    }),
  };
}

describe("syncCourseEnrollments", () => {
  it("should return 0 when no courses provided", async () => {
    const client = createMockAdminClient();
    const result = await syncCourseEnrollments(client as any, "user-1", []);
    expect(result).toBe(0);
  });

  it("should upsert courses and create memberships", async () => {
    const client = createMockAdminClient();
    const courses: EnrollableCourse[] = [
      { source: "canvas", external_id: "101", name: "CS 61A" },
    ];

    const result = await syncCourseEnrollments(client as any, "user-1", courses);

    expect(result).toBe(1);
    expect(client.from).toHaveBeenCalledWith("courses");
    expect(client.from).toHaveBeenCalledWith("course_memberships");
  });

  it("should deduplicate courses by (source, external_id)", async () => {
    const client = createMockAdminClient();
    const courses: EnrollableCourse[] = [
      { source: "canvas", external_id: "101", name: "CS 61A" },
      { source: "canvas", external_id: "101", name: "CS 61A - Renamed" },
    ];

    const result = await syncCourseEnrollments(client as any, "user-1", courses);

    // Should only upsert one course (deduped by source+external_id)
    expect(result).toBe(1);
  });

  it("should return 0 when course upsert fails", async () => {
    const client = createMockAdminClient({
      upsertError: { message: "DB error" },
    });
    const courses: EnrollableCourse[] = [
      { source: "canvas", external_id: "101", name: "CS 61A" },
    ];

    const result = await syncCourseEnrollments(client as any, "user-1", courses);
    expect(result).toBe(0);
  });

  it("should include deleted_at: null in membership rows to restore soft-deleted memberships", async () => {
    const upsertSpy = vi.fn().mockReturnValue({ error: null });
    const client = {
      from: vi.fn((table: string) => {
        if (table === "courses") {
          return {
            upsert: vi.fn().mockReturnValue({ error: null }),
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: "course-uuid-1" },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === "course_memberships") {
          return { upsert: upsertSpy };
        }
        return {};
      }),
    };

    const courses: EnrollableCourse[] = [
      { source: "canvas", external_id: "101", name: "CS 61A" },
    ];

    await syncCourseEnrollments(client as any, "user-1", courses);

    expect(upsertSpy).toHaveBeenCalledWith(
      [{ user_id: "user-1", course_id: "course-uuid-1", deleted_at: null }],
      { onConflict: "user_id,course_id" }
    );
  });

  it("should return 0 when course ID lookup fails", async () => {
    const client = createMockAdminClient({
      selectData: null,
      selectError: { message: "not found" },
    });
    const courses: EnrollableCourse[] = [
      { source: "canvas", external_id: "101", name: "CS 61A" },
    ];

    const result = await syncCourseEnrollments(client as any, "user-1", courses);
    expect(result).toBe(0);
  });
});

describe("gatherEnrollableCourses", () => {
  it("should gather Canvas courses", () => {
    const result = gatherEnrollableCourses({
      selected_canvas_courses: [{ id: 101, name: "CS 61A" }],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      source: "canvas",
      external_id: "101",
      name: "CS 61A",
    });
  });

  it("should gather Gradescope courses", () => {
    const result = gatherEnrollableCourses({
      selected_gradescope_courses: [{ id: "gs-1", name: "Data 100" }],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      source: "gradescope",
      external_id: "gs-1",
      name: "Data 100",
    });
  });

  it("should gather Pensieve courses", () => {
    const result = gatherEnrollableCourses({
      selected_pensieve_courses: [{ id: "pen-1", name: "CS 61B" }],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      source: "pensieve",
      external_id: "pen-1",
      name: "CS 61B",
    });
  });

  it("should namespace additional Canvas account courses", () => {
    const result = gatherEnrollableCourses({
      additional_canvas_accounts: [
        {
          id: "acc-1",
          selected_courses: [{ id: 200, name: "Stanford CS 101" }],
        },
      ],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      source: "canvas",
      external_id: "acc-1:200",
      name: "Stanford CS 101",
    });
  });

  it("should gather from all sources at once", () => {
    const result = gatherEnrollableCourses({
      selected_canvas_courses: [{ id: 1, name: "A" }],
      selected_gradescope_courses: [{ id: "2", name: "B" }],
      selected_pensieve_courses: [{ id: "3", name: "C" }],
      additional_canvas_accounts: [
        { id: "x", selected_courses: [{ id: 4, name: "D" }] },
      ],
    });

    expect(result).toHaveLength(4);
  });

  it("should handle null/empty course lists", () => {
    const result = gatherEnrollableCourses({
      selected_canvas_courses: null,
      selected_gradescope_courses: null,
      selected_pensieve_courses: null,
    });

    expect(result).toHaveLength(0);
  });

  it("should produce identical external_id for iCal courses whose names differ only in formatting", () => {
    // Reproduces the duplicate-group-chats bug: an iCal feed re-emits the
    // same course with slightly different whitespace/case across syncs, and
    // each variation used to produce a different hash → a new course row →
    // a new group chat. After normalization, all variations collapse.
    const variations = [
      "UGBA 101A-LEC-002 SP26",
      "UGBA 101A-LEC-002 SP26 ", // trailing space
      "  UGBA 101A-LEC-002 SP26", // leading whitespace
      "ugba 101a-lec-002 sp26", // lowercase
      "UGBA  101A-LEC-002  SP26", // double spaces
      "UGBA 101A-LEC-002 SP26", // non-breaking spaces
    ];

    const ids = variations.map((name) => {
      const result = gatherEnrollableCourses({
        canvas_ical_url: "https://example.com/feed.ics",
        selected_canvas_courses: [{ id: 0, name }],
      });
      return result[0].external_id;
    });

    const unique = new Set(ids);
    expect(unique.size).toBe(1);
    expect(ids[0]).toMatch(/^ical-\d+$/);
  });

  it("should produce different external_id for genuinely different course names", () => {
    // Sanity check: different sections should NOT collapse.
    const a = gatherEnrollableCourses({
      canvas_ical_url: "https://example.com/feed.ics",
      selected_canvas_courses: [{ id: 0, name: "UGBA 101A-LEC-001 SP26" }],
    });
    const b = gatherEnrollableCourses({
      canvas_ical_url: "https://example.com/feed.ics",
      selected_canvas_courses: [{ id: 0, name: "UGBA 101A-LEC-002 SP26" }],
    });
    expect(a[0].external_id).not.toBe(b[0].external_id);
  });
});
