/**
 * Tests for GET/PUT /api/board-layout API route.
 * Mocks Supabase client to test auth, upsert, and error handling.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Supabase mock setup ---

const mockGetUser = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockFrom = vi.fn();

// The save path: a version read (select updated_at ... maybeSingle), then
// either an insert (no row yet) or an update conditional on that version
// (update ... eq user_id ... eq updated_at ... select).
const mockMaybeSingle = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockUpdateSelect = vi.fn();

// Admin client is used only for the template-owner fallback when a user has
// no row of their own. Its own single-result mock lets tests control whether
// a template layout exists.
const mockTemplateSingle = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    })
  ),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ single: mockTemplateSingle })),
      })),
    })),
  })),
}));

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => ({ allowed: true })),
}));

import { GET, PUT } from "@/app/api/board-layout/route";

const TEST_USER_ID = "user-abc-123";

/** Configures the Supabase mock chain for a given scenario. */
function setupMocks(options: {
  authenticated?: boolean;
  selectResult?: { data: unknown; error: unknown };
  /** Result of the save path's version read. Defaults to "no row yet". */
  versionResult?: { data: { updated_at: string } | null; error: { message: string } | null };
  insertResult?: { error: { code?: string; message: string } | null };
  /** Rows the conditional update reports as written. Defaults to one row. */
  updateResult?: { data: { updated_at: string }[] | null; error: { message: string } | null };
  /** Result of the template-owner fallback query. Defaults to "no template". */
  templateResult?: { data: unknown; error: unknown };
}) {
  const {
    authenticated = true, selectResult, versionResult, insertResult, updateResult, templateResult,
  } = options;

  if (authenticated) {
    mockGetUser.mockResolvedValue({ data: { user: { id: TEST_USER_ID } }, error: null });
  } else {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "Not authenticated" } });
  }

  mockSingle.mockResolvedValue(selectResult ?? { data: null, error: { code: "PGRST116" } });
  mockMaybeSingle.mockResolvedValue(versionResult ?? { data: null, error: null });
  mockEq.mockReturnValue({ single: mockSingle, maybeSingle: mockMaybeSingle });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockInsert.mockResolvedValue(insertResult ?? { error: null });
  mockUpdateSelect.mockResolvedValue(
    updateResult ?? { data: [{ updated_at: "2026-09-21T10:00:00.000Z" }], error: null },
  );
  const updateEq2 = vi.fn(() => ({ select: mockUpdateSelect }));
  const updateEq1 = vi.fn(() => ({ eq: updateEq2 }));
  mockUpdate.mockReturnValue({ eq: updateEq1 });
  mockTemplateSingle.mockResolvedValue(templateResult ?? { data: null, error: { code: "PGRST116" } });

  mockFrom.mockReturnValue({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
  });
  return { updateEq1, updateEq2 };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/board-layout", () => {
  it("returns 401 for unauthenticated requests", async () => {
    setupMocks({ authenticated: false });
    const res = await GET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns null layout for new users (no row)", async () => {
    setupMocks({
      selectResult: { data: null, error: { code: "PGRST116", message: "no rows" } },
    });
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.layout).toBeNull();
    expect(body.updatedAt).toBeNull();
  });

  it("returns layout and updatedAt for existing users", async () => {
    const mockLayout = { version: 10, widgets: [], boardTitle: "Test" };
    const mockUpdatedAt = "2026-03-01T12:00:00.000Z";
    setupMocks({
      selectResult: { data: { layout: mockLayout, updated_at: mockUpdatedAt }, error: null },
    });
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.layout).toEqual(mockLayout);
    expect(body.updatedAt).toBe(mockUpdatedAt);
  });

  it("returns 500 on unexpected database error", async () => {
    setupMocks({
      selectResult: { data: null, error: { code: "42P01", message: "relation not found" } },
    });
    const res = await GET();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Failed to fetch board layout");
  });
});

describe("PUT /api/board-layout", () => {
  it("returns 401 for unauthenticated requests", async () => {
    setupMocks({ authenticated: false });
    const req = new Request("http://localhost/api/board-layout", {
      method: "PUT",
      body: JSON.stringify({ boardTitle: "Test" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid JSON body", async () => {
    setupMocks({});
    const req = new Request("http://localhost/api/board-layout", {
      method: "PUT",
      body: "not-json",
      headers: { "Content-Type": "text/plain" },
    });
    const res = await PUT(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid JSON body");
  });

  /** A PUT carrying `layout` plus the optional base version. */
  function put(layout: Record<string, unknown>, baseUpdatedAt?: string | null) {
    return PUT(new Request("http://localhost/api/board-layout", {
      method: "PUT",
      body: JSON.stringify(baseUpdatedAt === undefined ? layout : { ...layout, baseUpdatedAt }),
      headers: { "Content-Type": "application/json" },
    }));
  }

  const LAYOUT = { version: 10, widgets: [], layouts: { lg: [] }, boardTitle: "My Board" };
  const CURRENT = "2026-09-21T10:00:00.000Z";

  it("inserts the first layout for a user and returns its version", async () => {
    setupMocks({ versionResult: { data: null, error: null } });
    const res = await put(LAYOUT, null);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(typeof body.updatedAt).toBe("string");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: TEST_USER_ID, layout: LAYOUT }),
    );
    // The version field never reaches the stored JSON.
    expect(mockInsert.mock.calls[0][0].layout).not.toHaveProperty("baseUpdatedAt");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("updates an existing row when the base version matches, conditionally on it (M10)", async () => {
    const { updateEq1, updateEq2 } = setupMocks({
      versionResult: { data: { updated_at: CURRENT }, error: null },
    });
    const res = await put(LAYOUT, CURRENT);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.updatedAt).toBe(CURRENT);
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ layout: LAYOUT }));
    expect(updateEq1).toHaveBeenCalledWith("user_id", TEST_USER_ID);
    expect(updateEq2).toHaveBeenCalledWith("updated_at", CURRENT);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("accepts the same instant in a different spelling", async () => {
    setupMocks({ versionResult: { data: { updated_at: "2026-09-21T10:00:00+00:00" }, error: null } });
    const res = await put(LAYOUT, CURRENT);
    expect(res.status).toBe(200);
  });

  it("refuses a save based on an older read with 409 and the current version (M10)", async () => {
    setupMocks({ versionResult: { data: { updated_at: CURRENT }, error: null } });
    const res = await put(LAYOUT, "2026-09-21T09:00:00.000Z");
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.updatedAt).toBe(CURRENT);
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("refuses a save with no base version when a row exists", async () => {
    setupMocks({ versionResult: { data: { updated_at: CURRENT }, error: null } });
    const res = await put(LAYOUT);
    expect(res.status).toBe(409);
  });

  it("returns 409 when a concurrent save wins between the check and the write", async () => {
    setupMocks({
      versionResult: { data: { updated_at: CURRENT }, error: null },
      updateResult: { data: [], error: null },
    });
    const res = await put(LAYOUT, CURRENT);
    expect(res.status).toBe(409);
  });

  it("returns 409 when the row appears between the read and the first insert", async () => {
    setupMocks({ insertResult: { error: { code: "23505", message: "duplicate key" } } });
    const res = await put(LAYOUT, null);
    expect(res.status).toBe(409);
  });

  it("returns 500 on insert failure", async () => {
    setupMocks({ insertResult: { error: { message: "DB error" } } });
    const res = await put({ widgets: [], layouts: {}, boardTitle: "Test" }, null);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Failed to save board layout");
  });

  it("returns 500 on update failure", async () => {
    setupMocks({
      versionResult: { data: { updated_at: CURRENT }, error: null },
      updateResult: { data: null, error: { message: "DB error" } },
    });
    const res = await put(LAYOUT, CURRENT);
    expect(res.status).toBe(500);
  });

  it("returns 500 when the version read fails", async () => {
    setupMocks({ versionResult: { data: null, error: { message: "DB error" } } });
    const res = await put(LAYOUT, CURRENT);
    expect(res.status).toBe(500);
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
