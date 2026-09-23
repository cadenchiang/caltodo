/**
 * Tests for the shared chat action utilities in chat-actions.ts.
 * Verifies localStorage persistence, custom event dispatch, the system
 * course mute default, the first-visit read baseline and the unread rule.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  toggleMute,
  markAsUnread,
  markAsRead,
  togglePin,
  isPinned,
  isChatMuted,
  isChatUnread,
  ensureReadBaseline,
  MUTE_KEY_PREFIX,
  READ_AT_PREFIX,
  PIN_KEY_PREFIX,
  LAST_SENT_PREFIX,
} from "@/lib/chat-actions";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string): string | null => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: () => {
      store = {};
    },
  };
})();

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string): string | null => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });
Object.defineProperty(globalThis, "sessionStorage", { value: sessionStorageMock });

// Track dispatched events
let dispatchedEvents: CustomEvent[] = [];
const originalDispatchEvent = globalThis.window?.dispatchEvent;

beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
  dispatchedEvents = [];

  // Mock window.dispatchEvent
  globalThis.window = globalThis.window ?? ({} as Window & typeof globalThis);
  globalThis.window.dispatchEvent = vi.fn((event: Event) => {
    if (event instanceof CustomEvent) {
      dispatchedEvents.push(event);
    }
    return true;
  });

  globalThis.fetch = vi.fn();
});

afterEach(() => {
  if (originalDispatchEvent) {
    globalThis.window.dispatchEvent = originalDispatchEvent;
  }
});

describe("toggleMute", () => {
  it("sets localStorage to true when unmuted and returns true", () => {
    const result = toggleMute("course-1", false);
    expect(result).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      MUTE_KEY_PREFIX + "course-1",
      "true"
    );
  });

  it("sets localStorage to false when muted and returns false", () => {
    const result = toggleMute("course-1", true);
    expect(result).toBe(false);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      MUTE_KEY_PREFIX + "course-1",
      "false"
    );
  });

  it("dispatches calchat-mute-changed event with correct detail", () => {
    toggleMute("course-2", false);
    expect(dispatchedEvents).toHaveLength(1);
    expect(dispatchedEvents[0].type).toBe("calchat-mute-changed");
    expect(dispatchedEvents[0].detail).toEqual({
      courseId: "course-2",
      muted: true,
    });
  });
});

describe("markAsUnread", () => {
  it("removes the read_at key from localStorage", () => {
    localStorageMock.setItem(READ_AT_PREFIX + "course-1", "2026-01-01T00:00:00Z");
    markAsUnread("course-1");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      READ_AT_PREFIX + "course-1"
    );
  });

  it("dispatches calchat-read-update event", () => {
    markAsUnread("course-3");
    expect(dispatchedEvents).toHaveLength(1);
    expect(dispatchedEvents[0].type).toBe("calchat-read-update");
    expect(dispatchedEvents[0].detail).toEqual({ courseId: "course-3" });
  });
});

describe("togglePin", () => {
  it("sets localStorage when unpinned and returns true", () => {
    const result = togglePin("course-1", false);
    expect(result).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      PIN_KEY_PREFIX + "course-1",
      "true"
    );
  });

  it("removes localStorage when pinned and returns false", () => {
    const result = togglePin("course-1", true);
    expect(result).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      PIN_KEY_PREFIX + "course-1"
    );
  });

  it("dispatches calchat-pin-changed event with correct detail", () => {
    togglePin("course-4", false);
    expect(dispatchedEvents).toHaveLength(1);
    expect(dispatchedEvents[0].type).toBe("calchat-pin-changed");
    expect(dispatchedEvents[0].detail).toEqual({
      courseId: "course-4",
      pinned: true,
    });
  });
});

describe("isChatMuted", () => {
  it("defaults system courses (CalYak) to muted", () => {
    expect(isChatMuted("calyak", true)).toBe(true);
  });

  it("defaults class chats to unmuted", () => {
    expect(isChatMuted("course-1", false)).toBe(false);
  });

  it("honours an explicit unmute on a system course", () => {
    localStorageMock.setItem(MUTE_KEY_PREFIX + "calyak", "false");
    expect(isChatMuted("calyak", true)).toBe(false);
  });

  it("honours an explicit mute on a class chat", () => {
    localStorageMock.setItem(MUTE_KEY_PREFIX + "course-1", "true");
    expect(isChatMuted("course-1", false)).toBe(true);
  });
});

describe("ensureReadBaseline", () => {
  it("marks never-opened rooms read as of now and leaves read rooms alone", () => {
    localStorageMock.setItem(READ_AT_PREFIX + "old", "2026-01-01T00:00:00Z");
    const seeded = ensureReadBaseline(["old", "new-1", "new-2"]);
    expect(seeded).toEqual(["new-1", "new-2"]);
    expect(localStorageMock.getItem(READ_AT_PREFIX + "old")).toBe("2026-01-01T00:00:00Z");
    expect(localStorageMock.getItem(READ_AT_PREFIX + "new-1")).not.toBeNull();
  });
});

describe("isChatUnread", () => {
  it("is false with no messages", () => {
    expect(isChatUnread("course-1", null)).toBe(false);
  });

  it("is false for a room with no read baseline (first visit is not unread)", () => {
    expect(isChatUnread("course-1", "2026-09-23T10:00:00Z")).toBe(false);
  });

  it("is true when the newest message is after read_at", () => {
    localStorageMock.setItem(READ_AT_PREFIX + "course-1", "2026-09-23T09:00:00Z");
    expect(isChatUnread("course-1", "2026-09-23T10:00:00Z")).toBe(true);
  });

  it("is false when the user sent after the newest message", () => {
    localStorageMock.setItem(READ_AT_PREFIX + "course-1", "2026-09-23T09:00:00Z");
    localStorageMock.setItem(LAST_SENT_PREFIX + "course-1", String(Date.parse("2026-09-23T10:00:01Z")));
    expect(isChatUnread("course-1", "2026-09-23T10:00:00Z")).toBe(false);
  });

  it("tolerates a message stamped a second after read_at (own send skew)", () => {
    localStorageMock.setItem(READ_AT_PREFIX + "course-1", "2026-09-23T10:00:00Z");
    expect(isChatUnread("course-1", "2026-09-23T10:00:01Z")).toBe(false);
    expect(isChatUnread("course-1", "2026-09-23T10:00:05Z")).toBe(true);
  });
});

describe("markAsRead", () => {
  it("stores read_at and dispatches calchat-read-update", () => {
    markAsRead("course-9");
    expect(localStorageMock.setItem).toHaveBeenCalledWith(READ_AT_PREFIX + "course-9", expect.any(String));
    expect(dispatchedEvents[0].type).toBe("calchat-read-update");
    expect(dispatchedEvents[0].detail).toEqual({ courseId: "course-9" });
  });
});

describe("isPinned", () => {
  it("returns true when localStorage has 'true'", () => {
    localStorageMock.getItem.mockReturnValue("true");
    expect(isPinned("course-1")).toBe(true);
  });

  it("returns false when localStorage has no value", () => {
    localStorageMock.getItem.mockReturnValue(null);
    expect(isPinned("course-nonexistent")).toBe(false);
  });
});

