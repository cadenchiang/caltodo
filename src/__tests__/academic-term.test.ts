/**
 * Tests the term filter that decides which unselected courses sync offers.
 *
 * The bug this replaces was silent: a hardcoded list of Spring 2026 spellings
 * matched nothing once the term rolled over, so students were simply never
 * told a new class had appeared. The tests that matter are therefore the ones
 * that pin the behaviour across a term boundary and across a year boundary.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  getCurrentTerm,
  termSpellings,
  acceptableTerms,
  namesAnotherTerm,
  isCurrentTermCourse,
} from "@/lib/academic-term";

const ROOT = path.resolve(__dirname, "../..");

/** Local-time date, so the month boundaries are read the way a user sees them. */
const on = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12, 0, 0);

describe("getCurrentTerm", () => {
  const cases: Array<[string, Date, string, number]> = [
    ["January", on(2026, 1, 15), "Spring", 2026],
    ["May (last Spring month)", on(2026, 5, 31), "Spring", 2026],
    ["June (first Summer month)", on(2026, 6, 1), "Summer", 2026],
    ["July (last Summer month)", on(2026, 7, 31), "Summer", 2026],
    ["August (first Fall month)", on(2026, 8, 1), "Fall", 2026],
    ["December", on(2026, 12, 31), "Fall", 2026],
  ];
  for (const [label, date, season, year] of cases) {
    it(`reads ${label} as ${season} ${year}`, () => {
      expect(getCurrentTerm(date)).toEqual({ season, year });
    });
  }
});

describe("termSpellings", () => {
  it("covers the spellings Berkeley course names actually use", () => {
    const fall = termSpellings({ season: "Fall", year: 2026 });
    expect(fall).toContain("fa26");
    expect(fall).toContain("fall 2026");
    expect(fall).toContain("f26");
  });

  it("pads a single-digit year", () => {
    expect(termSpellings({ season: "Spring", year: 2027 })).toContain("sp27");
    expect(termSpellings({ season: "Fall", year: 2005 })).toContain("fa05");
  });

  it("does not collide across seasons", () => {
    const spring = new Set(termSpellings({ season: "Spring", year: 2026 }));
    const fall = termSpellings({ season: "Fall", year: 2026 });
    for (const spelling of fall) expect(spring.has(spelling)).toBe(false);
  });
});

describe("acceptableTerms", () => {
  it("includes the next term, whose sites go up early", () => {
    expect(acceptableTerms({ season: "Spring", year: 2026 })).toEqual([
      { season: "Spring", year: 2026 },
      { season: "Summer", year: 2026 },
    ]);
  });

  it("rolls the year over after Fall", () => {
    expect(acceptableTerms({ season: "Fall", year: 2026 })).toEqual([
      { season: "Fall", year: 2026 },
      { season: "Spring", year: 2027 },
    ]);
  });
});

describe("isCurrentTermCourse", () => {
  const august2026 = on(2026, 8, 31);

  it("offers the user's own Fall 2026 courses", () => {
    // The exact names from the reported case, which the old filter dropped.
    for (const name of [
      "UGBA 103-LEC-001 FA26",
      "UGBA 107-LEC-001 FA26",
      "UGBA 105-LEC-001 FA26",
    ]) {
      expect(isCurrentTermCourse(name, august2026)).toBe(true);
    }
  });

  it("offers a course whose name carries no term at all", () => {
    // Most course names have no term in them; withholding those was never
    // the intent, and it is the conservative direction to keep them.
    for (const name of ["ASTRON 11- ASTROBIO", "UGBA 100-LEC-003", "Physics 7A"]) {
      expect(isCurrentTermCourse(name, august2026)).toBe(true);
    }
  });

  it("withholds a course from a term that has passed", () => {
    for (const name of ["UGBA 101A-LEC-002 SP26", "Chem 1A Fall 2024", "Math 54 sp2025"]) {
      expect(isCurrentTermCourse(name, august2026)).toBe(false);
    }
  });

  it("offers next term while the current one is still running", () => {
    expect(isCurrentTermCourse("CS 61B SP27", august2026)).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isCurrentTermCourse("ugba 103 fa26", august2026)).toBe(true);
    expect(isCurrentTermCourse("UGBA 103 Fa26", august2026)).toBe(true);
    expect(isCurrentTermCourse("MATH 54 SP25", august2026)).toBe(false);
  });

  it("keeps working after the term rolls over", () => {
    // The whole point: the old list stopped matching at a fixed date.
    const spring2027 = on(2027, 2, 1);
    expect(isCurrentTermCourse("UGBA 103-LEC-001 FA26", spring2027)).toBe(false);
    expect(isCurrentTermCourse("UGBA 120-LEC-001 SP27", spring2027)).toBe(true);
  });

  it("offers current-term courses in every month of several years", () => {
    for (let year = 2026; year <= 2029; year++) {
      for (let month = 1; month <= 12; month++) {
        const date = on(year, month, 15);
        const term = getCurrentTerm(date);
        const name = `UGBA 103 ${termSpellings(term)[2].toUpperCase()}`;
        expect(isCurrentTermCourse(name, date)).toBe(true);
      }
    }
  });

  it("agrees with namesAnotherTerm", () => {
    for (const name of ["UGBA 103 FA26", "Math 54 SP25", "ASTRON 11"]) {
      expect(isCurrentTermCourse(name, august2026)).toBe(!namesAnotherTerm(name, august2026));
    }
  });
});

describe("sync engine wiring", () => {
  const engine = fs.readFileSync(path.join(ROOT, "src/lib/sync-engine.ts"), "utf8");

  it("no longer hardcodes a single term's spellings", () => {
    expect(engine).not.toContain('"Spring 2026"');
    expect(engine).not.toContain("termPatterns");
  });

  it("filters new courses through the derived term", () => {
    expect(engine).toContain("isCurrentTermCourse(c.name)");
    expect(engine).toContain('from "@/lib/academic-term"');
  });
});

describe("class totals", () => {
  const section = fs.readFileSync(
    path.join(ROOT, "src/components/settings/ClassesSection.tsx"),
    "utf8"
  );

  it("counts syllabus courses on both sides of the N/M summary", () => {
    // totalSelected has always included them; the denominator did not, so the
    // summary could claim more selected than available.
    expect(section).toContain(
      "cachedTotals.canvas + cachedTotals.gradescope + cachedTotals.pensieve + syllabusCourses.length"
    );
    expect(section).toContain(
      "canvasSelected.length + gsSelected.length + pensieveSelected.length + syllabusCourses.length"
    );
  });
});
