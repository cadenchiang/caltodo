/**
 * Tests for the Blackboard Learn iCal client.
 *
 * Covers the two things that have broken the sibling feed clients before: an
 * exclusive all-day DTEND reporting due dates a day late, and a revoked feed
 * answering 200 with an HTML login page so the sync "succeeds" with zero
 * assignments. Also pins the SUMMARY heuristics, which are the only part of
 * the format Blackboard does not standardise.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  parseBlackboardEvents,
  parseBlackboardSummary,
  fetchBlackboardAssignments,
  BLACKBOARD_FALLBACK_COURSE,
} from "@/lib/blackboard-client";

/** Wraps VEVENT bodies in a minimal valid VCALENDAR. */
const feed = (...events: string[]) =>
  ["BEGIN:VCALENDAR", "VERSION:2.0", ...events.map((e) =>
    `BEGIN:VEVENT\n${e}\nEND:VEVENT`), "END:VCALENDAR"].join("\n");

afterEach(() => { vi.unstubAllGlobals(); });

describe("parseBlackboardSummary", () => {
  it("prefers the bracketed form", () => {
    expect(parseBlackboardSummary("Lab Report 3 [BIOL 101]", null))
      .toEqual({ title: "Lab Report 3", courseName: "BIOL 101" });
  });

  it("splits Blackboard's course-first colon form", () => {
    expect(parseBlackboardSummary("BIOL 101: Lab Report 3", null))
      .toEqual({ title: "Lab Report 3", courseName: "BIOL 101" });
  });

  it("accepts a course code with no space", () => {
    expect(parseBlackboardSummary("CS10: Problem Set 4", null))
      .toEqual({ title: "Problem Set 4", courseName: "CS10" });
  });

  it("leaves a colon inside an ordinary title alone", () => {
    // The prefix is not a course code, so this must not split.
    expect(parseBlackboardSummary("Essay: The Great Gatsby", null))
      .toEqual({ title: "Essay: The Great Gatsby", courseName: BLACKBOARD_FALLBACK_COURSE });
  });

  it("splits the spaced-dash form title-first", () => {
    expect(parseBlackboardSummary("Problem Set 2 - MATH 1B", null))
      .toEqual({ title: "Problem Set 2", courseName: "MATH 1B" });
  });

  it("does not split a hyphenated word", () => {
    // No spaces around the dash, so this is one title.
    const out = parseBlackboardSummary("Pre-lab quiz", null);
    expect(out.title).toBe("Pre-lab quiz");
  });

  it("falls back to CATEGORIES", () => {
    expect(parseBlackboardSummary("Midterm", "PSYCH 2"))
      .toEqual({ title: "Midterm", courseName: "PSYCH 2" });
  });

  it("ignores a blank CATEGORIES", () => {
    expect(parseBlackboardSummary("Midterm", "   ").courseName)
      .toBe(BLACKBOARD_FALLBACK_COURSE);
  });

  it("always returns a non-empty course name", () => {
    expect(parseBlackboardSummary("Midterm", null).courseName)
      .toBe(BLACKBOARD_FALLBACK_COURSE);
  });
});

describe("parseBlackboardEvents", () => {
  it("parses a timed event and namespaces the id", () => {
    const [a] = parseBlackboardEvents(feed(
      "UID:abc-123\nSUMMARY:BIOL 101: Lab Report 3\nDTSTART:20260901T100000Z\nDTEND:20260901T235900Z"
    ));
    expect(a.external_id).toBe("bb-abc-123");
    expect(a.course_id).toBe("blackboard");
    expect(a.title).toBe("Lab Report 3");
    expect(a.course_name).toBe("BIOL 101");
    expect(a.due_is_all_day).toBe(false);
  });

  it("does not report an all-day event a day late", () => {
    // RFC 5545 makes an all-day DTEND exclusive, so DTSTART is the due day.
    const [a] = parseBlackboardEvents(feed(
      "UID:u1\nSUMMARY:Essay\nDTSTART;VALUE=DATE:20260901\nDTEND;VALUE=DATE:20260902"
    ));
    expect(a.due_is_all_day).toBe(true);
    expect(a.due_date?.slice(0, 10)).toBe("2026-09-01");
  });

  it("keeps the full UID so similar ids cannot collide", () => {
    const out = parseBlackboardEvents(feed(
      "UID:course-1-item-9\nSUMMARY:A\nDTSTART:20260901T100000Z",
      "UID:course-1-item-42\nSUMMARY:B\nDTSTART:20260901T100000Z"
    ));
    expect(out.map((a) => a.external_id))
      .toEqual(["bb-course-1-item-9", "bb-course-1-item-42"]);
  });

  it("skips events with no UID or no SUMMARY", () => {
    expect(parseBlackboardEvents(feed(
      "SUMMARY:No uid\nDTSTART:20260901T100000Z",
      "UID:u2\nDTSTART:20260901T100000Z"
    ))).toHaveLength(0);
  });

  it("unfolds continuation lines", () => {
    const [a] = parseBlackboardEvents(feed(
      "UID:u3\nSUMMARY:A very long assignment\n  title that wrapped\nDTSTART:20260901T100000Z"
    ));
    expect(a.title).toBe("A very long assignment title that wrapped");
  });

  it("decodes escaped text in the description", () => {
    const [a] = parseBlackboardEvents(feed(
      "UID:u4\nSUMMARY:Essay\nDESCRIPTION:Line one\\nLine two\\, with a comma\nDTSTART:20260901T100000Z"
    ));
    expect(a.description).toBe("Line one\nLine two, with a comma");
  });

  it("returns null for an empty description rather than an empty string", () => {
    const [a] = parseBlackboardEvents(feed(
      "UID:u5\nSUMMARY:Essay\nDESCRIPTION:   \nDTSTART:20260901T100000Z"
    ));
    expect(a.description).toBeNull();
  });

  it("carries a URL through when present, null when absent", () => {
    const [withUrl] = parseBlackboardEvents(feed(
      "UID:u6\nSUMMARY:Essay\nURL:https://bb.edu/item/1\nDTSTART:20260901T100000Z"
    ));
    const [without] = parseBlackboardEvents(feed(
      "UID:u7\nSUMMARY:Essay\nDTSTART:20260901T100000Z"
    ));
    expect(withUrl.source_url).toBe("https://bb.edu/item/1");
    expect(without.source_url).toBeNull();
  });

  it("returns nothing for a calendar with no events", () => {
    expect(parseBlackboardEvents("BEGIN:VCALENDAR\nEND:VCALENDAR")).toEqual([]);
  });
});

describe("fetchBlackboardAssignments", () => {
  it("parses a healthy feed", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: async () => feed("UID:u1\nSUMMARY:Essay\nDTSTART:20260901T100000Z"),
    }));
    await expect(fetchBlackboardAssignments("https://bb.edu/f.ics"))
      .resolves.toHaveLength(1);
  });

  it("throws on a non-OK response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 403 }));
    await expect(fetchBlackboardAssignments("https://bb.edu/f.ics"))
      .rejects.toThrow("403");
  });

  it("throws when a revoked feed answers 200 with a login page", async () => {
    // The failure this guard exists for: without it the sync reports success
    // with zero assignments and the broken integration stays invisible.
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "<!DOCTYPE html><html><body>Sign in</body></html>",
    }));
    await expect(fetchBlackboardAssignments("https://bb.edu/f.ics"))
      .rejects.toThrow(/didn't return a calendar/);
  });
});
