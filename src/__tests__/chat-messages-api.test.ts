/**
 * Tests for the chat messages API route.
 *
 * Verifies authentication, enrollment checks, content moderation, the
 * safe column set (author_id never leaves the server, audit C2), the
 * author-key header, client nonces, the single-message lookup used for
 * quoted replies, and attachment cleanup on unsend.
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
vi.mock("@/lib/spam-detection", () => ({
  checkSpam: vi.fn().mockReturnValue({ allowed: true }),
  checkDuplicate: vi.fn().mockReturnValue({ allowed: true }),
}));
vi.mock("@/lib/check-onboarding", () => ({
  hasCompletedOnboarding: vi.fn().mockResolvedValue(true),
}));

import { GET, POST, DELETE } from "@/app/api/discussions/messages/route";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeAuthorKey } from "@/lib/chat-author-key";
import { MESSAGE_COLUMNS, AUTHOR_KEY_HEADER } from "@/lib/chat-message-shape";

const mockCreateClient = vi.mocked(createClient);
const mockCreateAdmin = vi.mocked(createAdminClient);

const COURSE = "11111111-1111-4111-8111-111111111111";
const MSG = "22222222-2222-4222-8222-222222222222";

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://proj.supabase.co";
});

/** A user client: membership lookup plus a recording message query chain. */
function userClient(opts: { userId?: string; enrolled?: boolean; rows?: unknown[] } = {}) {
  const { userId = "user-1", enrolled = true, rows = [] } = opts;
  const chain: Record<string, unknown> = {};
  const terminal = Promise.resolve({ data: rows, error: null });
  for (const m of ["select", "eq", "order", "limit", "lt"]) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  (chain as { then: unknown }).then = terminal.then.bind(terminal);
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: userId ? { id: userId, user_metadata: { full_name: "Test User" } } : null },
        error: userId ? null : { message: "Not authenticated" },
      }),
    },
    from: vi.fn((table: string) => {
      if (table === "course_memberships") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: enrolled ? { id: "mem-1" } : null, error: null }),
              }),
            }),
          }),
        };
      }
      return chain;
    }),
    _chain: chain,
  };
}

/** An admin client for insert / delete / lookups. */
function adminClient(opts: { inserted?: Record<string, unknown> | null; owner?: string; body?: string } = {}) {
  const insertSelect = vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: opts.inserted ?? null, error: opts.inserted ? null : { message: "boom" } }) });
  const insert = vi.fn().mockReturnValue({ select: insertSelect });
  const del = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
  const remove = vi.fn().mockResolvedValue({ error: null });
  return {
    from: vi.fn(() => ({
      insert,
      delete: del,
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: { id: MSG }, error: null }) }),
          maybeSingle: vi.fn().mockResolvedValue({
            data: opts.owner ? { id: MSG, author_id: opts.owner, course_id: COURSE, body: opts.body ?? "hi" } : null,
            error: null,
          }),
        }),
      }),
    })),
    storage: { from: vi.fn(() => ({ remove })) },
    _insert: insert,
    _insertSelect: insertSelect,
    _delete: del,
    _remove: remove,
  };
}

describe("GET /api/discussions/messages", () => {
  it("should return 401 when not authenticated", async () => {
    mockCreateClient.mockResolvedValue(userClient({ userId: "" }) as any);
    const res = await GET(new Request(`http://localhost/api/discussions/messages?courseId=${COURSE}`));
    expect(res.status).toBe(401);
  });

  it("should return 400 when courseId is missing", async () => {
    mockCreateClient.mockResolvedValue(userClient() as any);
    expect((await GET(new Request("http://localhost/api/discussions/messages"))).status).toBe(400);
  });

  it("should return 403 when not enrolled", async () => {
    mockCreateClient.mockResolvedValue(userClient({ enrolled: false }) as any);
    const res = await GET(new Request(`http://localhost/api/discussions/messages?courseId=${COURSE}`));
    expect(res.status).toBe(403);
  });

  it("selects only the safe columns and sends the viewer's author key in a header", async () => {
    const client = userClient({ rows: [{ id: MSG, author_key: "k" }] });
    mockCreateClient.mockResolvedValue(client as any);
    const res = await GET(new Request(`http://localhost/api/discussions/messages?courseId=${COURSE}`));
    expect(res.status).toBe(200);
    expect(client._chain.select).toHaveBeenCalledWith(MESSAGE_COLUMNS);
    expect(MESSAGE_COLUMNS).not.toContain("author_id");
    expect(res.headers.get(AUTHOR_KEY_HEADER)).toBe(computeAuthorKey("user-1", COURSE));
  });

  it("fetches one message by id for quoted replies", async () => {
    const client = userClient({ rows: [{ id: MSG }] });
    mockCreateClient.mockResolvedValue(client as any);
    const res = await GET(new Request(`http://localhost/api/discussions/messages?courseId=${COURSE}&messageId=${MSG}`));
    expect(res.status).toBe(200);
    expect(client._chain.eq).toHaveBeenCalledWith("id", MSG);
    expect(client._chain.order).not.toHaveBeenCalled();
  });

  it("rejects a non-uuid messageId", async () => {
    mockCreateClient.mockResolvedValue(userClient() as any);
    const res = await GET(new Request(`http://localhost/api/discussions/messages?courseId=${COURSE}&messageId=nope`));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/discussions/messages", () => {
  const post = (body: unknown) => new Request("http://localhost/api/discussions/messages", { method: "POST", body: JSON.stringify(body) });

  it("should return 401 when not authenticated", async () => {
    mockCreateClient.mockResolvedValue(userClient({ userId: "" }) as any);
    expect((await POST(post({ courseId: COURSE, body: "Hello" }))).status).toBe(401);
  });

  it("should return 400 when body is missing", async () => {
    mockCreateClient.mockResolvedValue(userClient() as any);
    expect((await POST(post({ courseId: COURSE }))).status).toBe(400);
  });

  it("should return 422 for blocked content", async () => {
    mockCreateClient.mockResolvedValue(userClient() as any);
    const res = await POST(post({ courseId: COURSE, body: "you are a nigger" }));
    expect(res.status).toBe(422);
    expect((await res.json()).error).toContain("inappropriate");
  });

  it("inserts with author_key and the client nonce, returning safe columns", async () => {
    const inserted = { id: MSG, course_id: COURSE, author_key: computeAuthorKey("user-1", COURSE), body: "Hello", client_nonce: "n-1" };
    const admin = adminClient({ inserted });
    mockCreateClient.mockResolvedValue(userClient() as any);
    mockCreateAdmin.mockReturnValue(admin as any);

    const res = await POST(post({ courseId: COURSE, body: "Hello", clientNonce: "n-1", anonymous: true }));

    expect(res.status).toBe(201);
    expect(admin._insert).toHaveBeenCalledWith(expect.objectContaining({
      author_id: "user-1",
      author_key: computeAuthorKey("user-1", COURSE),
      author_name: null,
      client_nonce: "n-1",
    }));
    expect(admin._insertSelect).toHaveBeenCalledWith(MESSAGE_COLUMNS);
    expect(res.headers.get(AUTHOR_KEY_HEADER)).toBe(computeAuthorKey("user-1", COURSE));
    expect(await res.json()).toEqual(inserted);
  });

  it("returns 403 when not enrolled", async () => {
    mockCreateClient.mockResolvedValue(userClient({ enrolled: false }) as any);
    mockCreateAdmin.mockReturnValue(adminClient() as any);
    expect((await POST(post({ courseId: COURSE, body: "Hello" }))).status).toBe(403);
  });
});

describe("DELETE /api/discussions/messages", () => {
  const del = (body: unknown) => new Request("http://localhost/api/discussions/messages", { method: "DELETE", body: JSON.stringify(body) });

  it("refuses to delete someone else's message", async () => {
    mockCreateClient.mockResolvedValue(userClient() as any);
    mockCreateAdmin.mockReturnValue(adminClient({ owner: "someone-else" }) as any);
    expect((await DELETE(del({ messageId: MSG }))).status).toBe(403);
  });

  it("deletes an own message and removes its own-bucket attachments", async () => {
    const url = "https://proj.supabase.co/storage/v1/object/public/chat-attachments/user-1/c/a.png";
    const admin = adminClient({ owner: "user-1", body: `look\n${url}\nhttps://evil.example/tracker.png` });
    mockCreateClient.mockResolvedValue(userClient() as any);
    mockCreateAdmin.mockReturnValue(admin as any);

    const res = await DELETE(del({ messageId: MSG }));

    expect(res.status).toBe(200);
    expect(admin._delete).toHaveBeenCalled();
    expect(admin._remove).toHaveBeenCalledWith(["user-1/c/a.png"]);
  });
});
