/**
 * Tests for the task invite API routes.
 * Validates invite creation, share listing, and share revocation logic.
 *
 * These tests mock Supabase and admin clients to test route handler logic
 * without database or network dependencies.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// ── Mocks ──────────────────────────────────────────────

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue({ allowed: true }),
}));

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockSupabase = {
  auth: { getUser: mockGetUser },
  from: mockFrom,
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
}));

const mockAdminFrom = vi.fn();
const mockAdminListUsers = vi.fn();
const mockAdminClient = {
  auth: { admin: { listUsers: mockAdminListUsers } },
  from: mockAdminFrom,
};

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn().mockReturnValue(mockAdminClient),
}));

vi.mock("@/lib/gcal/token-manager", () => ({
  getValidAccessToken: vi.fn().mockResolvedValue(null),
  getCalendarId: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/gcal/calendar-attendees", () => ({
  addAttendeeToEvent: vi.fn().mockResolvedValue(true),
  removeAttendeeFromEvent: vi.fn().mockResolvedValue(true),
}));

// ── Helpers ────────────────────────────────────────────

const INVITER_ID = "user-111";
const INVITER_EMAIL = "inviter@example.com";
const INVITEE_ID = "user-222";
const INVITEE_EMAIL = "classmate@example.com";
const TASK_ID = "task-abc";
const SHARE_ID = "share-xyz";

function mockAuthUser(id: string, email: string) {
  mockGetUser.mockResolvedValue({
    data: { user: { id, email } },
    error: null,
  });
}

/** Creates a chainable Supabase query mock that resolves to the given result. */
function chainMock(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const resolver = () => Promise.resolve(result);
  const chainFn = () => chain;

  chain.select = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.delete = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockImplementation(resolver);
  chain.order = vi.fn().mockImplementation(resolver);
  chain.then = vi.fn().mockImplementation((cb: (v: unknown) => unknown) => cb(result));

  return chain;
}

// ── Tests ──────────────────────────────────────────────

describe("POST /api/tasks/invite — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser(INVITER_ID, INVITER_EMAIL);
  });

  it("should reject unauthenticated requests", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "No session" } });

    const { POST } = await import("@/app/api/tasks/invite/route");
    const req = new Request("http://localhost/api/tasks/invite", {
      method: "POST",
      body: JSON.stringify({ taskId: TASK_ID, email: INVITEE_EMAIL }),
    });

    const res = await POST(req as never);
    expect(res.status).toBe(401);
  });

  it("should reject missing taskId or email", async () => {
    const { POST } = await import("@/app/api/tasks/invite/route");
    const req = new Request("http://localhost/api/tasks/invite", {
      method: "POST",
      body: JSON.stringify({ taskId: TASK_ID }),
    });

    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it("should reject self-invite by email match", async () => {
    const { POST } = await import("@/app/api/tasks/invite/route");
    const req = new Request("http://localhost/api/tasks/invite", {
      method: "POST",
      body: JSON.stringify({ taskId: TASK_ID, email: INVITER_EMAIL }),
    });

    const res = await POST(req as never);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.code).toBe("self_invite");
  });
});

describe("POST /api/tasks/invite — invitee lookup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser(INVITER_ID, INVITER_EMAIL);
  });

  it("should create deferred invite when invitee not on caltodo", async () => {
    // Task ownership passes
    mockFrom.mockReturnValue(
      chainMock({
        data: { id: TASK_ID, user_id: INVITER_ID, title: "HW1", description: "", google_event_id: null, tags: [] },
        error: null,
      })
    );

    // Invitee not found — listUsers returns no match
    mockAdminListUsers.mockResolvedValue({
      data: { users: [] },
      error: null,
    });

    // Admin client: deferred duplicate check returns null, then insert succeeds
    let adminCallCount = 0;
    mockAdminFrom.mockImplementation(() => {
      adminCallCount++;
      if (adminCallCount === 1) {
        // Deferred duplicate check — no existing deferred share
        const chain = chainMock({ data: null, error: { code: "PGRST116" } });
        chain.is = vi.fn().mockReturnValue(chain);
        return chain;
      }
      // Deferred share insert
      return chainMock({
        data: {
          id: SHARE_ID, source_task_id: TASK_ID, inviter_id: INVITER_ID,
          invitee_id: null, copied_task_id: null,
          invitee_email: "nobody@example.com", status: "deferred",
          created_at: new Date().toISOString(),
        },
        error: null,
      });
    });

    const { POST } = await import("@/app/api/tasks/invite/route");
    const req = new Request("http://localhost/api/tasks/invite", {
      method: "POST",
      body: JSON.stringify({ taskId: TASK_ID, email: "nobody@example.com" }),
    });

    const res = await POST(req as never);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.deferred).toBe(true);
    expect(body.share).toBeDefined();
  });
});

describe("POST /api/tasks/invite — duplicate check", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser(INVITER_ID, INVITER_EMAIL);
  });

  it("should return 409 when share already exists", async () => {
    // First call: task ownership check
    // Second call: duplicate share check
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return chainMock({
          data: { id: TASK_ID, user_id: INVITER_ID, title: "HW1", description: "", google_event_id: null, tags: [] },
          error: null,
        });
      }
      return chainMock({ data: { id: SHARE_ID }, error: null });
    });

    mockAdminListUsers.mockResolvedValue({
      data: { users: [{ id: INVITEE_ID, email: INVITEE_EMAIL }] },
      error: null,
    });

    const { POST } = await import("@/app/api/tasks/invite/route");
    const req = new Request("http://localhost/api/tasks/invite", {
      method: "POST",
      body: JSON.stringify({ taskId: TASK_ID, email: INVITEE_EMAIL }),
    });

    const res = await POST(req as never);
    const body = await res.json();
    expect(res.status).toBe(409);
    expect(body.code).toBe("already_shared");
  });
});

describe("POST /api/tasks/invite — success path", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser(INVITER_ID, INVITER_EMAIL);
  });

  it("should create task copy and share record on success", async () => {
    let fromCallCount = 0;
    mockFrom.mockImplementation(() => {
      fromCallCount++;
      if (fromCallCount === 1) {
        // Task ownership check
        return chainMock({
          data: {
            id: TASK_ID, user_id: INVITER_ID, title: "HW1", description: "Do the homework",
            due_date: "2026-03-01", due_time: null, color: "#0e89d6", course_name: "CS61A",
            google_event_id: null, tags: ["homework"],
          },
          error: null,
        });
      }
      if (fromCallCount === 2) {
        // Duplicate check — no existing share
        return chainMock({ data: null, error: { code: "PGRST116" } });
      }
      // Share insert
      return chainMock({
        data: {
          id: SHARE_ID, source_task_id: TASK_ID, inviter_id: INVITER_ID,
          invitee_id: INVITEE_ID, copied_task_id: "copied-task-1",
          invitee_email: INVITEE_EMAIL, created_at: new Date().toISOString(),
        },
        error: null,
      });
    });

    // Admin: user lookup
    mockAdminListUsers.mockResolvedValue({
      data: { users: [{ id: INVITEE_ID, email: INVITEE_EMAIL }] },
      error: null,
    });

    // Admin: share insert (uses admin client to bypass RLS)
    mockAdminFrom.mockReturnValue(
      chainMock({
        data: {
          id: SHARE_ID, source_task_id: TASK_ID, inviter_id: INVITER_ID,
          invitee_id: INVITEE_ID, copied_task_id: null,
          invitee_email: INVITEE_EMAIL, status: "pending",
          created_at: new Date().toISOString(),
        },
        error: null,
      })
    );

    const { POST } = await import("@/app/api/tasks/invite/route");
    const req = new Request("http://localhost/api/tasks/invite", {
      method: "POST",
      body: JSON.stringify({ taskId: TASK_ID, email: INVITEE_EMAIL }),
    });

    const res = await POST(req as never);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.share).toBeDefined();
    expect(body.share.id).toBe(SHARE_ID);
  });
});
