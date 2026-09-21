/**
 * Tests for POST /api/gcal/disconnect.
 *
 * Verifies the credentials row is cleared, every task's google_event_id is
 * cleared so a reconnect resyncs everything, and a failure to clear the
 * event ids is reported (not swallowed) while the disconnect still stands.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockCredsSingle = vi.fn();
const mockCredsUpdateEq = vi.fn();
const mockTasksSelect = vi.fn();
const mockTasksUpdate = vi.fn();
const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: (table: string) => {
        if (table === "tasks") {
          return {
            update: (payload: unknown) => {
              mockTasksUpdate(payload);
              return { eq: () => ({ not: () => ({ select: mockTasksSelect }) }) };
            },
          };
        }
        return {
          select: () => ({ eq: () => ({ single: mockCredsSingle }) }),
          update: () => ({ eq: mockCredsUpdateEq }),
        };
      },
    })
  ),
}));
vi.mock("@/lib/logger", () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: vi.fn(() => ({ allowed: true })) }));
vi.mock("@/lib/gcal/token-manager", () => ({ getValidAccessToken: vi.fn(async () => "access-token") }));
const mockStop = vi.fn();
vi.mock("@/lib/gcal/watch-manager", () => ({ stopWatchChannel: (...args: unknown[]) => mockStop(...args) }));

import { POST } from "@/app/api/gcal/disconnect/route";

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
  mockCredsSingle.mockResolvedValue({ data: { gcal_channel_id: "ch", gcal_channel_resource_id: "r" } });
  mockCredsUpdateEq.mockResolvedValue({ error: null });
  mockTasksSelect.mockResolvedValue({ data: [{ id: "t1" }, { id: "t2" }], error: null });
  fetchMock.mockResolvedValue({ ok: true });
});

describe("POST /api/gcal/disconnect", () => {
  it("clears the tokens, stops the channel and clears every task's event id", async () => {
    const res = await POST();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ disconnected: true, eventIdsCleared: true });
    expect(mockStop).toHaveBeenCalledWith("access-token", "ch", "r");
    expect(mockCredsUpdateEq).toHaveBeenCalled();
    expect(mockTasksUpdate).toHaveBeenCalledWith({ google_event_id: null });
  });

  it("reports when the event ids could not be cleared but keeps the disconnect", async () => {
    mockTasksSelect.mockResolvedValue({ data: null, error: { message: "db down" } });
    const res = await POST();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ disconnected: true, eventIdsCleared: false });
  });

  it("fails with 500 and leaves task ids alone when the tokens cannot be cleared", async () => {
    mockCredsUpdateEq.mockResolvedValue({ error: { message: "db down" } });
    const res = await POST();
    expect(res.status).toBe(500);
    expect(mockTasksUpdate).not.toHaveBeenCalled();
  });

  it("returns 401 without a session", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "no" } });
    expect((await POST()).status).toBe(401);
  });
});
