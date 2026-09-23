/**
 * Tests for the shared chat action utilities in chat-actions.ts.
 * Verifies localStorage persistence, custom event dispatch,
 * and API call handling for mute, unread, pin, and leave operations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  toggleMute,
  markAsUnread,
  togglePin,
  isPinned,
  leaveGroup,
  MUTE_KEY_PREFIX,
  READ_AT_PREFIX,
  PIN_KEY_PREFIX,
  NAME_KEY_PREFIX,
  MSG_CACHE_PREFIX,
  MEM_CACHE_PREFIX,
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

  // Mock fetch for leaveGroup tests
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

describe("leaveGroup", () => {
  it("calls the leave API and clears all caches on success", async () => {
    const courseId = "course-leave";
    // Set up some cached data
    localStorageMock.setItem(NAME_KEY_PREFIX + courseId, "Test Group");
    localStorageMock.setItem(MUTE_KEY_PREFIX + courseId, "true");
    localStorageMock.setItem(PIN_KEY_PREFIX + courseId, "true");
    localStorageMock.setItem(READ_AT_PREFIX + courseId, "2026-01-01T00:00:00Z");
    sessionStorageMock.setItem(MSG_CACHE_PREFIX + courseId, "cached");
    sessionStorageMock.setItem(MEM_CACHE_PREFIX + courseId, "cached");

    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );

    const result = await leaveGroup(courseId);
    expect(result).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/discussions/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });

    // Verify all caches cleared
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith(MSG_CACHE_PREFIX + courseId);
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith(MEM_CACHE_PREFIX + courseId);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(NAME_KEY_PREFIX + courseId);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(MUTE_KEY_PREFIX + courseId);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(PIN_KEY_PREFIX + courseId);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(READ_AT_PREFIX + courseId);
  });

  it("returns false on API failure", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Not enrolled" }), { status: 403 })
    );

    const result = await leaveGroup("course-fail");
    expect(result).toBe(false);
  });

  it("returns false on network error", async () => {
    vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error("Network error"));

    const result = await leaveGroup("course-error");
    expect(result).toBe(false);
  });
});
