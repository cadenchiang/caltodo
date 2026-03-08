/**
 * Tests for Google Calendar client: listWritableCalendars.
 * Validates calendar listing with access role filtering.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { listWritableCalendars } from "@/lib/gcal/calendar-client";

describe("listWritableCalendars", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return writable calendars filtered by access role", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        items: [
          { id: "primary", summary: "My Calendar", primary: true, backgroundColor: "#4285f4", accessRole: "owner" },
          { id: "work", summary: "Work", primary: false, backgroundColor: "#33B679", accessRole: "writer" },
          { id: "holidays", summary: "Holidays", primary: false, backgroundColor: "#E67C73", accessRole: "reader" },
        ],
      }),
    });

    const calendars = await listWritableCalendars("access-token");

    expect(calendars).toHaveLength(2);
    expect(calendars![0].id).toBe("primary");
    expect(calendars![0].primary).toBe(true);
    expect(calendars![1].id).toBe("work");
    expect(calendars![1].primary).toBe(false);
  });

  it("should return null on API failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve("Unauthorized"),
    });

    const calendars = await listWritableCalendars("bad-token");
    expect(calendars).toBeNull();
  });

  it("should handle empty calendar list", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ items: [] }),
    });

    const calendars = await listWritableCalendars("access-token");
    expect(calendars).toHaveLength(0);
  });

  it("should use correct API endpoint", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ items: [] }),
    });

    await listWritableCalendars("access-token");

    expect(fetch).toHaveBeenCalledWith(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer access-token",
        }),
      })
    );
  });

  it("should default missing fields to safe values", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        items: [
          { id: "test", accessRole: "owner" },
        ],
      }),
    });

    const calendars = await listWritableCalendars("access-token");

    expect(calendars).toHaveLength(1);
    expect(calendars![0].summary).toBe("(No name)");
    expect(calendars![0].primary).toBe(false);
    expect(calendars![0].backgroundColor).toBe("#4285f4");
  });
});
