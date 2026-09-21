/**
 * Tests for deferred invite activation (H8).
 *
 * Covers the lib function against a stub service-role client, the thin API
 * route around it, and that the OAuth callback and One Tap both reach it
 * with a real session rather than a pre-exchange cookie.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => {
    throw new Error("real admin client must not be built in tests");
  }),
}));

const mockGetUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve({ auth: { getUser: mockGetUser } })),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => ({ allowed: true })),
}));

import { processDeferredInvites } from "@/lib/process-deferred-invites";
import { POST } from "@/app/api/auth/process-deferred/route";
import { logger } from "@/lib/logger";

const mockIs = vi.fn();
const mockIn = vi.fn();
const mockUpdate = vi.fn();
const mockFrom = vi.fn();

/** Builds a stub client whose select and update chains resolve as given. */
function stubClient(
  selectResult: { data: { id: string }[] | null; error: { message: string } | null },
  updateResult: { error: { message: string } | null } = { error: null },
): SupabaseClient {
  mockIs.mockResolvedValue(selectResult);
  mockIn.mockResolvedValue(updateResult);
  mockUpdate.mockReturnValue({ in: mockIn });
  mockFrom.mockReturnValue({
    select: vi.fn(() => ({ eq: vi.fn(() => ({ is: mockIs })) })),
    update: mockUpdate,
  });
  return { from: mockFrom } as unknown as SupabaseClient;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("processDeferredInvites", () => {
  it("claims every deferred share for the email and reports the count", async () => {
    const client = stubClient({ data: [{ id: "s1" }, { id: "s2" }], error: null });
    const processed = await processDeferredInvites("user-1", "New@Example.com", client);
    expect(processed).toBe(2);
    expect(mockFrom).toHaveBeenCalledWith("task_shares");
    expect(mockUpdate).toHaveBeenCalledWith({ invitee_id: "user-1", status: "pending" });
    expect(mockIn).toHaveBeenCalledWith("id", ["s1", "s2"]);
  });

  it("matches the email lowercased, since that is how invites store it", async () => {
    const eq = vi.fn(() => ({ is: mockIs }));
    mockIs.mockResolvedValue({ data: [], error: null });
    mockFrom.mockReturnValue({ select: vi.fn(() => ({ eq })), update: mockUpdate });
    await processDeferredInvites("user-1", "New@Example.com", { from: mockFrom } as unknown as SupabaseClient);
    expect(eq).toHaveBeenCalledWith("invitee_email", "new@example.com");
  });

  it("is a no-op when nothing is deferred", async () => {
    const client = stubClient({ data: [], error: null });
    expect(await processDeferredInvites("user-1", "a@b.c", client)).toBe(0);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("resolves 0 without querying when the user has no email", async () => {
    const client = stubClient({ data: [{ id: "s1" }], error: null });
    expect(await processDeferredInvites("user-1", null, client)).toBe(0);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("throws and logs when the read fails", async () => {
    const client = stubClient({ data: null, error: { message: "read boom" } });
    await expect(processDeferredInvites("user-1", "a@b.c", client)).rejects.toThrow("read boom");
    expect(logger.error).toHaveBeenCalledWith(
      "processDeferredInvites: failed to fetch deferred shares",
      expect.objectContaining({ userId: "user-1", error: "read boom" }),
    );
  });

  it("throws and logs when the write fails", async () => {
    const client = stubClient({ data: [{ id: "s1" }], error: null }, { error: { message: "write boom" } });
    await expect(processDeferredInvites("user-1", "a@b.c", client)).rejects.toThrow("write boom");
    expect(logger.error).toHaveBeenCalledWith(
      "processDeferredInvites: failed to claim deferred shares",
      expect.objectContaining({ shareIds: ["s1"], error: "write boom" }),
    );
  });
});

describe("POST /api/auth/process-deferred", () => {
  it("returns 401 without a session", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "no session" } });
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it("returns 500 when activation fails, without leaking the cause", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1", email: "a@b.c" } }, error: null });
    // The route builds the real admin client, which the mock makes throw.
    const res = await POST();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Failed to process invites" });
    expect(logger.error).toHaveBeenCalledWith(
      "POST /api/auth/process-deferred: failed",
      expect.objectContaining({ userId: "u1" }),
    );
  });
});

describe("sign-in paths reach the activation with a real session", () => {
  const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

  it("the OAuth callback awaits the lib in-process after the code exchange", () => {
    const src = read("src/app/auth/callback/route.ts");
    const exchange = src.indexOf("exchangeCodeForSession(code)");
    const call = src.indexOf("await processDeferredInvites(user.id, user.email)");
    expect(call).toBeGreaterThan(exchange);
    // The old fire-and-forget fetch forwarded a pre-exchange cookie and got 401.
    expect(src).not.toContain("/api/auth/process-deferred");
  });

  it("One Tap, which skips the callback, calls the endpoint after signing in", () => {
    const src = read("src/components/auth/GoogleOneTap.tsx");
    const signIn = src.indexOf("signInWithIdToken({");
    const call = src.indexOf('fetch("/api/auth/process-deferred", { method: "POST" })');
    expect(call).toBeGreaterThan(signIn);
    expect(call).toBeLessThan(src.indexOf("router.push(\"/app/inbox\")"));
  });
});
