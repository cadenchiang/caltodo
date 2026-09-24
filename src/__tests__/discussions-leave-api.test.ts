/**
 * Tests for POST and PATCH /api/discussions/leave.
 *
 * Audit H12: leaving hard-deleted the membership, so the next sync
 * re-created it. The route now soft-deletes (sets deleted_at), which is the
 * record the sync respects, and the migration that makes the chat's read
 * paths honour deleted_at ships alongside it.
 *
 * Leave is now "hide" (D3): PATCH clears deleted_at again, and system
 * courses are refused server-side (D5, finding 24) because the client
 * hides those per device instead.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue({ allowed: true }),
}));

import { POST, PATCH } from "@/app/api/discussions/leave/route";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const mockCreateClient = vi.mocked(createClient);
const mockCreateAdmin = vi.mocked(createAdminClient);

const ROOT = path.resolve(__dirname, "../..");

/**
 * A user client whose membership lookup resolves to `membership` and whose
 * course lookup reports `source` (the route refuses system courses).
 */
function userClient(membership: { id: string } | null, source = "canvas") {
  const lookup = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: { source }, error: null }),
    single: vi.fn().mockResolvedValue({
      data: membership,
      error: membership ? null : { message: "no rows" },
    }),
  };
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }) },
    from: vi.fn(() => lookup),
    _lookup: lookup,
  };
}

/** An admin client that records the update it is asked to make. */
function adminClient(error: { message: string } | null = null) {
  const chain = {
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockResolvedValue({ error }),
  };
  return { from: vi.fn(() => chain), _chain: chain };
}

/**
 * Admin client for PATCH: the first from() is the hidden-row lookup, the
 * second is the update whose terminal call is eq("id", ...).
 */
function unhideAdminClient(hidden: { id: string } | null, error: { message: string } | null = null) {
  const lookup = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: hidden, error: null }),
  };
  const update = {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ error }),
  };
  let calls = 0;
  return { from: vi.fn(() => (calls++ === 0 ? lookup : update)), _lookup: lookup, _update: update };
}

function request(body: unknown) {
  return new Request("http://localhost/api/discussions/leave", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/discussions/leave", () => {
  it("soft-deletes the membership instead of removing the row", async () => {
    const user = userClient({ id: "m-1" });
    const admin = adminClient();
    mockCreateClient.mockResolvedValue(user as any);
    mockCreateAdmin.mockReturnValue(admin as any);

    const res = await POST(request({ courseId: "course-1" }));

    expect(res.status).toBe(200);
    expect(admin._chain.update).toHaveBeenCalledWith({ deleted_at: expect.any(String) });
    expect(admin._chain.delete).not.toHaveBeenCalled();
    expect(admin._chain.eq).toHaveBeenCalledWith("id", "m-1");
    expect(admin._chain.is).toHaveBeenCalledWith("deleted_at", null);
  });

  it("only looks for a live membership, so leaving twice is a 404", async () => {
    const user = userClient(null);
    mockCreateClient.mockResolvedValue(user as any);
    mockCreateAdmin.mockReturnValue(adminClient() as any);

    const res = await POST(request({ courseId: "course-1" }));

    expect(res.status).toBe(404);
    expect(user._lookup.is).toHaveBeenCalledWith("deleted_at", null);
  });

  it("reports a failed soft delete as a 500 without claiming success", async () => {
    mockCreateClient.mockResolvedValue(userClient({ id: "m-1" }) as any);
    mockCreateAdmin.mockReturnValue(adminClient({ message: "boom" }) as any);

    const res = await POST(request({ courseId: "course-1" }));

    expect(res.status).toBe(500);
  });

  it("rejects a missing courseId", async () => {
    mockCreateClient.mockResolvedValue(userClient({ id: "m-1" }) as any);

    expect((await POST(request({}))).status).toBe(400);
  });

  it("refuses to hide a system course and leaves the membership alone", async () => {
    const user = userClient({ id: "m-1" }, "system");
    const admin = adminClient();
    mockCreateClient.mockResolvedValue(user as any);
    mockCreateAdmin.mockReturnValue(admin as any);

    const res = await POST(request({ courseId: "calyak" }));

    expect(res.status).toBe(403);
    expect(admin._chain.update).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/discussions/leave (unhide)", () => {
  const patch = (body: unknown) =>
    new Request("http://localhost/api/discussions/leave", { method: "PATCH", body: JSON.stringify(body) });

  it("clears deleted_at on the hidden membership", async () => {
    const admin = unhideAdminClient({ id: "m-1" });
    mockCreateClient.mockResolvedValue(userClient(null) as any);
    mockCreateAdmin.mockReturnValue(admin as any);

    const res = await PATCH(patch({ courseId: "course-1" }));

    expect(res.status).toBe(200);
    expect(admin._lookup.not).toHaveBeenCalledWith("deleted_at", "is", null);
    expect(admin._update.update).toHaveBeenCalledWith({ deleted_at: null });
    expect(admin._update.eq).toHaveBeenCalledWith("id", "m-1");
  });

  it("is a 404 when nothing is hidden", async () => {
    const admin = unhideAdminClient(null);
    mockCreateClient.mockResolvedValue(userClient(null) as any);
    mockCreateAdmin.mockReturnValue(admin as any);

    const res = await PATCH(patch({ courseId: "course-1" }));

    expect(res.status).toBe(404);
    expect(admin._update.update).not.toHaveBeenCalled();
  });

  it("reports a failed unhide as a 500", async () => {
    mockCreateClient.mockResolvedValue(userClient(null) as any);
    mockCreateAdmin.mockReturnValue(unhideAdminClient({ id: "m-1" }, { message: "boom" }) as any);

    expect((await PATCH(patch({ courseId: "course-1" }))).status).toBe(500);
  });
});

describe("membership read paths honour deleted_at", () => {
  const sql = fs.readFileSync(
    path.join(ROOT, "supabase/migrations/20260921000004_memberships_respect_soft_delete.sql"),
    "utf8"
  );

  it("filters get_my_course_ids, which gates the chat RLS policies", () => {
    expect(sql).toMatch(/FUNCTION get_my_course_ids\(\)[\s\S]*?WHERE user_id = auth\.uid\(\) AND deleted_at IS NULL/);
  });

  it("filters the sidebar list and its member counts", () => {
    const boards = sql.slice(sql.indexOf("FUNCTION get_user_boards"));
    expect(boards).toContain("WHERE cm.user_id = auth.uid()\n    AND cm.deleted_at IS NULL");
    expect(boards).toContain("cmem2.deleted_at IS NULL");
    expect(boards).toContain("cmem.deleted_at IS NULL");
  });

  it("filters the member list for both the members and the caller", () => {
    const members = sql.slice(sql.indexOf("FUNCTION get_course_members"), sql.indexOf("FUNCTION get_user_boards"));
    expect(members).toContain("cm.deleted_at IS NULL");
    expect(members).toContain("my_mem.deleted_at IS NULL");
  });
});
