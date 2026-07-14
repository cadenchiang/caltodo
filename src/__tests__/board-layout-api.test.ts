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
const mockUpsert = vi.fn();
const mockFrom = vi.fn();

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
  upsertResult?: { error: unknown };
  /** Result of the template-owner fallback query. Defaults to "no template". */
  templateResult?: { data: unknown; error: unknown };
}) {
  const { authenticated = true, selectResult, upsertResult, templateResult } = options;

  if (authenticated) {
    mockGetUser.mockResolvedValue({ data: { user: { id: TEST_USER_ID } }, error: null });
  } else {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "Not authenticated" } });
  }

  mockSingle.mockResolvedValue(selectResult ?? { data: null, error: { code: "PGRST116" } });
  mockEq.mockReturnValue({ single: mockSingle });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockUpsert.mockResolvedValue(upsertResult ?? { error: null });
  mockTemplateSingle.mockResolvedValue(templateResult ?? { data: null, error: { code: "PGRST116" } });

  mockFrom.mockReturnValue({
    select: mockSelect,
    upsert: mockUpsert,
  });
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

  it("upserts layout and returns success", async () => {
    setupMocks({});
    const layout = { version: 10, widgets: [], layouts: { lg: [] }, boardTitle: "My Board" };
    const req = new Request("http://localhost/api/board-layout", {
      method: "PUT",
      body: JSON.stringify(layout),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    // Verify upsert was called with correct args
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: TEST_USER_ID,
        layout,
      }),
      { onConflict: "user_id" }
    );
  });

  it("returns 500 on upsert failure", async () => {
    setupMocks({ upsertResult: { error: { message: "DB error" } } });
    const req = new Request("http://localhost/api/board-layout", {
      method: "PUT",
      body: JSON.stringify({ widgets: [], layouts: {}, boardTitle: "Test" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Failed to save board layout");
  });
});
