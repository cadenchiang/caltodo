/**
 * Tests for chat-room-groups.ts and chat-board-assembly.ts (D4).
 *
 * One class must be one room for everyone: the primary row is the oldest
 * (then lowest id) so two viewers with different subsets of the sibling
 * rows still agree, past-term rooms are flagged for the collapsed group,
 * and the platform badge lists every underlying source.
 */

import { describe, it, expect } from "vitest";
import { groupRooms, roomGroupKey, isPastTermCourse, platformLabel } from "@/lib/chat-room-groups";
import { assembleBoards } from "@/lib/chat-board-assembly";

const row = (id: string, name: string, source: string, created_at: string) => ({ id, name, source, created_at, external_id: `x-${id}` });

describe("roomGroupKey", () => {
  it("collapses whitespace and case", () => {
    expect(roomGroupKey("  CS  61A ")).toBe("cs 61a");
    expect(roomGroupKey("cs 61a")).toBe(roomGroupKey("CS 61A"));
  });
});

describe("groupRooms", () => {
  it("picks the oldest row as primary, then the lowest id on a tie", () => {
    const groups = groupRooms([
      row("b", "CS 61A", "canvas", "2026-02-01T00:00:00Z"),
      row("c", "CS 61A", "gradescope", "2026-01-01T00:00:00Z"),
      row("a", "CS 61A", "pensieve", "2026-01-01T00:00:00Z"),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].primary.id).toBe("a");
    expect(groups[0].sources).toEqual(["pensieve", "gradescope", "canvas"]);
  });

  it("is the same primary regardless of which subset a viewer holds", () => {
    const all = [
      row("old", "MATH 53", "canvas", "2025-09-01T00:00:00Z"),
      row("mid", "MATH 53", "gradescope", "2026-01-01T00:00:00Z"),
      row("new", "MATH 53", "pensieve", "2026-02-01T00:00:00Z"),
    ];
    expect(groupRooms(all)[0].primary.id).toBe("old");
    expect(groupRooms([all[0], all[2]])[0].primary.id).toBe("old");
    expect(groupRooms([all[2], all[0], all[1]])[0].primary.id).toBe("old");
  });

  it("never merges system rows, even with a matching name", () => {
    const groups = groupRooms([
      row("yak", "CalYak", "system", "2025-01-01T00:00:00Z"),
      row("c", "CalYak", "canvas", "2026-01-01T00:00:00Z"),
    ]);
    expect(groups).toHaveLength(2);
  });
});

describe("isPastTermCourse", () => {
  const now = new Date("2026-09-23T12:00:00Z"); // Fall 2026

  it("flags a name carrying an earlier term in any spelling", () => {
    expect(isPastTermCourse("CS 61A (Fall 2025)", now)).toBe(true);
    expect(isPastTermCourse("Spring 2026 - UGBA 101A", now)).toBe(true);
    expect(isPastTermCourse("MATH 53 SP26", now)).toBe(true);
    expect(isPastTermCourse("CS 188 F'25", now)).toBe(true);
    expect(isPastTermCourse("EECS 16A fa25", now)).toBe(true);
  });

  it("does not flag the current term, a future term, or no term", () => {
    expect(isPastTermCourse("CS 61A (Fall 2026)", now)).toBe(false);
    expect(isPastTermCourse("CS 61A Spring 2027", now)).toBe(false);
    expect(isPastTermCourse("History and Culture of Afghanistan", now)).toBe(false);
  });

  it("matches short spellings on word boundaries only", () => {
    // "sofa25" contains "fa25" but is not a term stamp.
    expect(isPastTermCourse("SOFA25 Lounge", now)).toBe(false);
  });
});

describe("platformLabel", () => {
  it("names the platforms students know", () => {
    expect(platformLabel("canvas")).toBe("Canvas");
    expect(platformLabel("pensieve")).toBe("Pensieve");
    expect(platformLabel("gradescope")).toBe("Gradescope");
  });
});

describe("assembleBoards", () => {
  const live = (id: string, name: string, source: string, created_at: string, message_count = 0) => ({
    ...row(id, name, source, created_at),
    message_count,
    last_message_body: null,
    last_message_author: null,
    last_message_at: null,
    member_count: 1,
    member_avatars: [],
  });

  it("emits one board per group using the primary's stats", () => {
    const { boards, enrollInto } = assembleBoards(
      [live("gs", "UGBA 101A", "gradescope", "2026-01-01T00:00:00Z", 2), live("cv", "UGBA 101A", "canvas", "2026-02-01T00:00:00Z", 9)],
      [],
      [],
    );
    expect(boards).toHaveLength(1);
    expect(boards[0].course.id).toBe("gs");
    expect(boards[0].message_count).toBe(2);
    expect(boards[0].sources).toEqual(["gradescope", "canvas"]);
    expect(enrollInto).toEqual([]);
  });

  it("asks for enrollment when the viewer is only in a sibling of the primary", () => {
    const { boards, enrollInto } = assembleBoards(
      [live("new", "CS 188", "gradescope", "2026-01-01T00:00:00Z")],
      [],
      [row("old", "CS 188", "canvas", "2025-09-01T00:00:00Z")],
    );
    expect(boards).toHaveLength(0);
    expect(enrollInto).toEqual(["old"]);
  });

  it("does not enroll into a room the viewer has hidden", () => {
    const { boards, enrollInto } = assembleBoards(
      [live("new", "CS 188", "gradescope", "2026-01-01T00:00:00Z")],
      [row("old", "CS 188", "canvas", "2025-09-01T00:00:00Z")],
      [],
    );
    expect(enrollInto).toEqual([]);
    expect(boards).toHaveLength(1);
    expect(boards[0].hidden).toBe(true);
    expect(boards[0].course.id).toBe("old");
  });

  it("ignores sibling rows of classes the viewer is not in at all", () => {
    const { boards, enrollInto } = assembleBoards([], [], [row("x", "PHYS 7A", "canvas", "2026-01-01T00:00:00Z")]);
    expect(boards).toEqual([]);
    expect(enrollInto).toEqual([]);
  });

  it("orders hidden boards last and flags past terms", () => {
    const now = new Date("2026-09-23T12:00:00Z");
    const { boards } = assembleBoards(
      [live("a", "CS 61A (Fall 2025)", "canvas", "2026-01-01T00:00:00Z")],
      [row("b", "MATH 53", "canvas", "2026-01-01T00:00:00Z")],
      [],
      now,
    );
    expect(boards.map((b) => b.course.id)).toEqual(["a", "b"]);
    expect(boards[0].past).toBe(true);
    expect(boards[1].hidden).toBe(true);
  });
});
