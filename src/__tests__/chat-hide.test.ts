/**
 * Tests for chat-hide.ts: hide / unhide semantics (D3, D5).
 *
 * Leaving used to hard-delete the membership and promise "you cannot join
 * back ever again", then /app/discussions read calchat_last_course and
 * sent the user straight back into the room. Hiding soft-deletes, keeps a
 * Hidden chats group to unhide from, and clears the last-room pointer.
 * System courses are hidden per device only.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  hideChat,
  unhideChat,
  isBoardHidden,
  clearRoomState,
  pickInitialRoom,
  SYSTEM_HIDDEN_KEY_PREFIX,
  BOARDS_CACHE_KEY,
  BOARDS_CHANGED_EVENT,
} from "@/lib/chat-hide";
import { LAST_CHAT_KEY, MUTE_KEY_PREFIX, READ_AT_PREFIX, MSG_CACHE_PREFIX } from "@/lib/chat-actions";
import type { DiscussionBoard } from "@/lib/types";

function storageMock() {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((k: string) => store[k] ?? null),
    setItem: vi.fn((k: string, v: string) => { store[k] = v; }),
    removeItem: vi.fn((k: string) => { delete store[k]; }),
    clear: () => { store = {}; },
  };
}
const ls = storageMock();
const ss = storageMock();
Object.defineProperty(globalThis, "localStorage", { value: ls });
Object.defineProperty(globalThis, "sessionStorage", { value: ss });

let events: Event[] = [];
beforeEach(() => {
  vi.clearAllMocks();
  ls.clear();
  ss.clear();
  events = [];
  globalThis.window = globalThis.window ?? ({} as Window & typeof globalThis);
  globalThis.window.dispatchEvent = vi.fn((e: Event) => { events.push(e); return true; });
  globalThis.fetch = vi.fn();
});

/** A minimal board. */
function board(id: string, source = "canvas", hidden = false): DiscussionBoard {
  return {
    course: { id, source, external_id: id, name: `Course ${id}`, created_at: "2026-01-01T00:00:00Z" } as DiscussionBoard["course"],
    message_count: 0,
    member_count: 0,
    member_avatars: [],
    hidden,
  };
}

describe("hideChat (class chat)", () => {
  it("POSTs to the leave route, clears room state, invalidates the boards cache", async () => {
    ls.setItem(LAST_CHAT_KEY, "c1");
    ls.setItem(READ_AT_PREFIX + "c1", "x");
    ss.setItem(MSG_CACHE_PREFIX + "c1", "x");
    ss.setItem(BOARDS_CACHE_KEY, "x");
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(new Response("{}", { status: 200 }));

    expect(await hideChat("c1", false)).toBe(true);

    expect(globalThis.fetch).toHaveBeenCalledWith("/api/discussions/leave", expect.objectContaining({ method: "POST" }));
    expect(ls.getItem(LAST_CHAT_KEY)).toBeNull();
    expect(ls.getItem(READ_AT_PREFIX + "c1")).toBeNull();
    expect(ss.getItem(MSG_CACHE_PREFIX + "c1")).toBeNull();
    expect(ss.getItem(BOARDS_CACHE_KEY)).toBeNull();
    expect(events.map((e) => e.type)).toContain(BOARDS_CHANGED_EVENT);
  });

  it("leaves everything in place when the API refuses", async () => {
    ls.setItem(LAST_CHAT_KEY, "c1");
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ error: "nope" }), { status: 403 }));

    expect(await hideChat("c1", false)).toBe(false);
    expect(ls.getItem(LAST_CHAT_KEY)).toBe("c1");
    expect(events).toHaveLength(0);
  });

  it("does not clear the last-room pointer when it points elsewhere", () => {
    ls.setItem(LAST_CHAT_KEY, "other");
    clearRoomState("c1");
    expect(ls.getItem(LAST_CHAT_KEY)).toBe("other");
  });
});

describe("hideChat (system course)", () => {
  it("never calls the API; stores a per-device flag and mutes", async () => {
    expect(await hideChat("yak", true)).toBe(true);
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(ls.getItem(SYSTEM_HIDDEN_KEY_PREFIX + "yak")).toBe("true");
    expect(ls.getItem(MUTE_KEY_PREFIX + "yak")).toBe("true");
    expect(events.map((e) => e.type)).toContain(BOARDS_CHANGED_EVENT);
  });

  it("unhide removes the flag without calling the API", async () => {
    ls.setItem(SYSTEM_HIDDEN_KEY_PREFIX + "yak", "true");
    expect(await unhideChat("yak", true)).toBe(true);
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(ls.getItem(SYSTEM_HIDDEN_KEY_PREFIX + "yak")).toBeNull();
  });
});

describe("unhideChat (class chat)", () => {
  it("PATCHes the leave route and invalidates the boards cache", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(new Response("{}", { status: 200 }));
    expect(await unhideChat("c1", false)).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/discussions/leave", expect.objectContaining({ method: "PATCH" }));
    expect(events.map((e) => e.type)).toContain(BOARDS_CHANGED_EVENT);
  });

  it("reports failure", async () => {
    vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error("offline"));
    expect(await unhideChat("c1", false)).toBe(false);
  });
});

describe("isBoardHidden", () => {
  it("is the server flag for class chats", () => {
    expect(isBoardHidden(board("c1", "canvas", true))).toBe(true);
    expect(isBoardHidden(board("c1"))).toBe(false);
  });

  it("is the per-device flag for system courses", () => {
    expect(isBoardHidden(board("yak", "system"))).toBe(false);
    ls.setItem(SYSTEM_HIDDEN_KEY_PREFIX + "yak", "true");
    expect(isBoardHidden(board("yak", "system"))).toBe(true);
  });
});

describe("pickInitialRoom", () => {
  it("prefers the last opened room when it is still visible", () => {
    ls.setItem(LAST_CHAT_KEY, "c2");
    expect(pickInitialRoom([board("c1"), board("c2")])?.course.id).toBe("c2");
  });

  it("never picks a hidden room, even if it was the last one opened", () => {
    ls.setItem(LAST_CHAT_KEY, "c2");
    expect(pickInitialRoom([board("c1"), board("c2", "canvas", true)])?.course.id).toBe("c1");
  });

  it("returns null when every room is hidden", () => {
    expect(pickInitialRoom([board("c1", "canvas", true)])).toBeNull();
  });
});

describe("copy", () => {
  it("no longer threatens permanent removal anywhere in the chat", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const dir = path.resolve(__dirname, "../components/discussions");
    for (const f of fs.readdirSync(dir)) {
      const src = fs.readFileSync(path.join(dir, f), "utf8");
      expect(src, f).not.toMatch(/cannot join back|Leave Group|Leave Chat/);
    }
    expect(fs.existsSync(path.join(dir, "LeaveGroupModal.tsx"))).toBe(false);
  });
});
