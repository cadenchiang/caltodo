/**
 * Tests for the discussion boards API route.
 *
 * Verifies that enrolled courses are returned with message stats, that
 * hidden rooms come back flagged, that sibling rows across viewers group
 * into one room with the oldest row as primary (D4), and that a viewer
 * who is only in a sibling row is enrolled into the room.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue({ allowed: true }),
}));

import { GET } from "@/app/api/discussions/boards/route";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const mockCreateClient = vi.mocked(createClient);
const mockCreateAdmin = vi.mocked(createAdminClient);

beforeEach(() => {
  vi.clearAllMocks();
});

/** A get_user_boards() row. */
function boardRow(id: string, name: string, source = "canvas", created = "2026-01-01T00:00:00Z", extra: Record<string, unknown> = {}) {
  return {
    course_id: id,
    course_source: source,
    course_external_id: `ext-${id}`,
    course_name: name,
    course_created_at: created,
    message_count: 0,
    last_message_body: null,
    last_message_author: null,
    last_message_at: null,
    member_count: 1,
    member_avatars: [],
    ...extra,
  };
}

/** A courses row for the sibling lookup. */
function courseRow(id: string, name: string, source: string, created: string) {
  return { id, source, external_id: `ext-${id}`, name, created_at: created };
}

/**
 * User client whose rpc returns `rpcPages` in order (the route reruns the
 * rpc after enrolling).
 */
function userClient(rpcPages: Array<Array<Record<string, unknown>>> | null, userId = "user-1") {
  const rpc = vi.fn();
  if (rpcPages === null) rpc.mockResolvedValue({ data: null, error: { message: "DB error" } });
  else for (const page of rpcPages) rpc.mockResolvedValueOnce({ data: page, error: null });
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: userId ? { id: userId } : null },
        error: userId ? null : { message: "Not authenticated" },
      }),
    },
    rpc,
  };
}

/** Admin client with canned hidden memberships and sibling courses. */
function adminClient(opts: { hidden?: Array<Record<string, unknown>>; siblings?: Array<Record<string, unknown>> } = {}) {
  const upsert = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn((table: string) => {
    if (table === "course_memberships") {
      return {
        upsert,
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            not: vi.fn().mockResolvedValue({ data: opts.hidden ?? [], error: null }),
          }),
        }),
      };
    }
    // courses: calyak lookup (.eq.eq.single) and sibling lookup (.in.neq)
    return {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }),
        }),
        in: vi.fn().mockReturnValue({
          neq: vi.fn().mockResolvedValue({ data: opts.siblings ?? [], error: null }),
        }),
      }),
    };
  });
  return { from, _upsert: upsert };
}

describe("GET /api/discussions/boards", () => {
  it("should return 401 when not authenticated", async () => {
    mockCreateClient.mockResolvedValue(userClient([[]], "") as any);
    mockCreateAdmin.mockReturnValue(adminClient() as any);
    expect((await GET()).status).toBe(401);
  });

  it("should return empty array when no boards", async () => {
    mockCreateClient.mockResolvedValue(userClient([[]]) as any);
    mockCreateAdmin.mockReturnValue(adminClient() as any);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
  });

  it("should return boards with message stats, sources and past flag", async () => {
    mockCreateClient.mockResolvedValue(
      userClient([[boardRow("c-1", "CS 61A", "canvas", "2026-01-01T00:00:00Z", {
        message_count: 5, last_message_body: "Hello!", last_message_author: "Alice", last_message_at: "2026-02-25T10:00:00Z", member_count: 3,
      })]]) as any,
    );
    mockCreateAdmin.mockReturnValue(adminClient({ siblings: [courseRow("c-1", "CS 61A", "canvas", "2026-01-01T00:00:00Z")] }) as any);

    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].message_count).toBe(5);
    expect(data[0].last_message_body).toBe("Hello!");
    expect(data[0].course.name).toBe("CS 61A");
    expect(data[0].sources).toEqual(["canvas"]);
    expect(data[0].past).toBe(false);
    expect(data[0].hidden).toBeUndefined();
  });

  it("should return 500 when rpc fails", async () => {
    mockCreateClient.mockResolvedValue(userClient(null) as any);
    mockCreateAdmin.mockReturnValue(adminClient() as any);
    expect((await GET()).status).toBe(500);
  });

  it("lists hidden rooms last, flagged, with no stats", async () => {
    mockCreateClient.mockResolvedValue(userClient([[boardRow("c-1", "CS 61A")]]) as any);
    mockCreateAdmin.mockReturnValue(adminClient({
      hidden: [{ course_id: "c-2", courses: courseRow("c-2", "MATH 53", "canvas", "2026-01-01T00:00:00Z") }],
    }) as any);

    const data = await (await GET()).json();
    expect(data.map((b: { course: { id: string } }) => b.course.id)).toEqual(["c-1", "c-2"]);
    expect(data[1].hidden).toBe(true);
    expect(data[1].member_count).toBe(0);
  });

  it("merges sibling rows into one room whose primary is the oldest row", async () => {
    // Viewer is in both the Gradescope row (older) and the Canvas row.
    mockCreateClient.mockResolvedValue(userClient([[
      boardRow("c-canvas", "UGBA 101A", "canvas", "2026-02-01T00:00:00Z", { message_count: 9 }),
      boardRow("c-gs", "UGBA 101A", "gradescope", "2026-01-15T00:00:00Z", { message_count: 2 }),
    ]]) as any);
    mockCreateAdmin.mockReturnValue(adminClient({ siblings: [
      courseRow("c-canvas", "UGBA 101A", "canvas", "2026-02-01T00:00:00Z"),
      courseRow("c-gs", "UGBA 101A", "gradescope", "2026-01-15T00:00:00Z"),
    ] }) as any);

    const data = await (await GET()).json();
    expect(data).toHaveLength(1);
    // Oldest row wins even though the Canvas row has more messages.
    expect(data[0].course.id).toBe("c-gs");
    expect(data[0].sources).toEqual(["gradescope", "canvas"]);
  });

  it("enrolls a viewer who is only in a sibling row into the primary room and reruns", async () => {
    const primary = courseRow("c-old", "CS 188", "canvas", "2025-09-01T00:00:00Z");
    const user = userClient([
      [boardRow("c-new", "CS 188", "gradescope", "2026-01-01T00:00:00Z")],
      [boardRow("c-new", "CS 188", "gradescope", "2026-01-01T00:00:00Z"), boardRow("c-old", "CS 188", "canvas", "2025-09-01T00:00:00Z", { message_count: 40 })],
    ]);
    const admin = adminClient({ siblings: [primary, courseRow("c-new", "CS 188", "gradescope", "2026-01-01T00:00:00Z")] });
    mockCreateClient.mockResolvedValue(user as any);
    mockCreateAdmin.mockReturnValue(admin as any);

    const data = await (await GET()).json();

    expect(admin._upsert).toHaveBeenCalledWith(
      [{ user_id: "user-1", course_id: "c-old" }],
      { onConflict: "user_id,course_id", ignoreDuplicates: true },
    );
    expect(user.rpc).toHaveBeenCalledTimes(2);
    expect(data).toHaveLength(1);
    expect(data[0].course.id).toBe("c-old");
    expect(data[0].message_count).toBe(40);
  });

  it("never merges the system course with anything", async () => {
    mockCreateClient.mockResolvedValue(userClient([[
      boardRow("yak", "CalYak", "system", "2025-01-01T00:00:00Z"),
      boardRow("c-1", "CalYak", "canvas", "2026-01-01T00:00:00Z"),
    ]]) as any);
    mockCreateAdmin.mockReturnValue(adminClient() as any);

    const data = await (await GET()).json();
    expect(data).toHaveLength(2);
  });
});
