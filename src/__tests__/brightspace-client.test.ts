/**
 * Tests for the Brightspace (D2L) iCal client — parseBrightspaceEvents summary
 * parsing, the all-day DTEND-exclusive fix, stable external_ids, and the
 * fetch-level non-calendar guard.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  parseBrightspaceEvents,
  fetchBrightspaceAssignments,
} from "@/lib/brightspace-client";

/** Builds a minimal Brightspace iCal document with the given VEVENTs. */
function makeIcal(events: string[]): string {
  return ["BEGIN:VCALENDAR", "VERSION:2.0", ...events, "END:VCALENDAR"].join("\r\n");
}

/** Builds a single VEVENT block. */
function vevent(fields: { uid: string; summary: string; dtstart?: string; dtend?: string; allDay?: boolean }): string {
  const lines = ["BEGIN:VEVENT", `UID:${fields.uid}`, `SUMMARY:${fields.summary}`];
  const tag = fields.allDay ? ";VALUE=DATE" : "";
  if (fields.dtstart) lines.push(`DTSTART${tag}:${fields.dtstart}`);
  if (fields.dtend) lines.push(`DTEND${tag}:${fields.dtend}`);
  lines.push("END:VEVENT");
  return lines.join("\r\n");
}

describe("parseBrightspaceEvents — summary parsing", () => {
  it("parses 'Title [CourseName]' format", () => {
    const [r] = parseBrightspaceEvents(makeIcal([vevent({ uid: "1", summary: "HW 1 [CS 101]" })]));
    expect(r.title).toBe("HW 1");
    expect(r.course_name).toBe("CS 101");
  });

  it("parses 'Title - CourseName' format", () => {
    const [r] = parseBrightspaceEvents(makeIcal([vevent({ uid: "2", summary: "Essay - ENGL 200" })]));
    expect(r.title).toBe("Essay");
    expect(r.course_name).toBe("ENGL 200");
  });

  it("falls back to 'Brightspace' course when no delimiter", () => {
    const [r] = parseBrightspaceEvents(makeIcal([vevent({ uid: "3", summary: "Read chapter 4" })]));
    expect(r.course_name).toBe("Brightspace");
  });
});

describe("parseBrightspaceEvents — all-day DTEND exclusivity", () => {
  it("uses DTSTART for an all-day event (DTEND is exclusive, would be one day late)", () => {
    // All-day event on 2026-03-01; RFC 5545 makes DTEND the next day (03-02).
    const [r] = parseBrightspaceEvents(
      makeIcal([vevent({ uid: "4", summary: "Quiz [CS 101]", dtstart: "20260301", dtend: "20260302", allDay: true })])
    );
    // Correct day is 03-01; the exclusive DTEND would have made it 03-02.
    expect(r.due_date).toMatch(/^2026-03-01/);
  });
});

describe("parseBrightspaceEvents — stable external_id", () => {
  it("keeps distinct UIDs distinct (no collapse to first digit run)", () => {
    const results = parseBrightspaceEvents(
      makeIcal([
        vevent({ uid: "abc-12-xyz", summary: "A [C]" }),
        vevent({ uid: "abc-12-def", summary: "B [C]" }),
      ])
    );
    const ids = results.map((r) => r.external_id);
    expect(new Set(ids).size).toBe(2);
    expect(ids).toEqual(["bs-abc-12-xyz", "bs-abc-12-def"]);
  });
});

describe("fetchBrightspaceAssignments — non-calendar guard", () => {
  afterEach(() => vi.restoreAllMocks());

  it("throws when a 200 response is an HTML login page, not iCal", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("<!DOCTYPE html><html><body>Please log in</body></html>", { status: 200 })
    );
    await expect(fetchBrightspaceAssignments("https://school.brightspace.com/feed.ics")).rejects.toThrow(
      /didn't return a calendar/
    );
  });

  it("throws on a non-OK status", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("nope", { status: 404 }));
    await expect(fetchBrightspaceAssignments("https://school.brightspace.com/feed.ics")).rejects.toThrow(
      /fetch failed: 404/
    );
  });
});
