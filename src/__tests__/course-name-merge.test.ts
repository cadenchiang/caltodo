import { describe, it, expect } from "vitest";
import { extractCourseCode, buildCourseNameMap, getCanonicalName } from "@/lib/course-name-merge";

describe("extractCourseCode", () => {
  it("extracts standard UC Berkeley course codes", () => {
    expect(extractCourseCode("UGBA 101A")).toBe("UGBA 101A");
    expect(extractCourseCode("CS 188")).toBe("CS 188");
    expect(extractCourseCode("EE 16B")).toBe("EE 16B");
    expect(extractCourseCode("MATH 53")).toBe("MATH 53");
    expect(extractCourseCode("EECS 126")).toBe("EECS 126");
  });

  it("extracts code from Canvas-style verbose names", () => {
    expect(extractCourseCode("UGBA 101A-LEC-002 Microeconomics for Business Decisions")).toBe("UGBA 101A");
    expect(extractCourseCode("CS 188 - Introduction to Artificial Intelligence")).toBe("CS 188");
    expect(extractCourseCode("MATH 53 Section 201")).toBe("MATH 53");
  });

  it("handles irregular spacing", () => {
    expect(extractCourseCode("UGBA  101A")).toBe("UGBA 101A");
    expect(extractCourseCode("CS188")).toBe("CS188");
  });

  it("does not treat a term stamp as a course code", () => {
    expect(extractCourseCode("Fall 2026.BIOL.2970.01")).not.toBe("FALL 2026");
    expect(extractCourseCode("Fall 2026 Physics 1740 All Sections")).not.toBe("FALL 2026");
    expect(extractCourseCode("Spring 2027 Chemistry")).toBeNull();
    expect(extractCourseCode("Summer 2026")).toBeNull();
    expect(extractCourseCode("Winter 2026")).toBeNull();
  });

  it("still finds a real code alongside a term stamp", () => {
    expect(extractCourseCode("Fall 2026 - CS 188")).toBe("CS 188");
    expect(extractCourseCode("Fall 2026 (MATH 53)")).toBe("MATH 53");
  });

  it("returns null for non-course names", () => {
    expect(extractCourseCode("History and Culture of Afghanistan")).toBeNull();
    expect(extractCourseCode("My Study Group")).toBeNull();
    expect(extractCourseCode("")).toBeNull();
  });

  it("handles case insensitivity", () => {
    expect(extractCourseCode("ugba 101a-LEC-002")).toBe("UGBA 101A");
    expect(extractCourseCode("cs 188")).toBe("CS 188");
  });

  it("extracts parenthesized course codes", () => {
    expect(extractCourseCode("Calculus II (MATH 53)")).toBe("MATH 53");
    expect(extractCourseCode("Intro to Artificial Intelligence (CS 188)")).toBe("CS 188");
  });

  it("extracts course codes after a separator", () => {
    expect(extractCourseCode("Intro to AI - CS 188")).toBe("CS 188");
    expect(extractCourseCode("Microeconomics: UGBA 101A")).toBe("UGBA 101A");
    expect(extractCourseCode("Linear Algebra – MATH 54")).toBe("MATH 54");
  });

  it("extracts course codes at the end of the name", () => {
    expect(extractCourseCode("Section 1 MATH 53")).toBe("MATH 53");
  });
});

describe("buildCourseNameMap", () => {
  it("maps verbose Canvas name to shorter Gradescope name", () => {
    const courses = [
      { source: "canvas", name: "UGBA 101A-LEC-002 Microeconomics for Business Decisions" },
      { source: "gradescope", name: "UGBA 101A" },
    ];
    const map = buildCourseNameMap(courses);
    expect(map.get("UGBA 101A-LEC-002 Microeconomics for Business Decisions")).toBe("UGBA 101A");
    expect(map.has("UGBA 101A")).toBeFalsy(); // canonical name doesn't need mapping
  });

  it("handles multiple cross-platform duplicates", () => {
    const courses = [
      { source: "canvas", name: "CS 188 - Introduction to AI" },
      { source: "gradescope", name: "CS 188" },
      { source: "canvas", name: "UGBA 101A-LEC-002 Microeconomics" },
      { source: "gradescope", name: "UGBA 101A" },
    ];
    const map = buildCourseNameMap(courses);
    expect(map.get("CS 188 - Introduction to AI")).toBe("CS 188");
    expect(map.get("UGBA 101A-LEC-002 Microeconomics")).toBe("UGBA 101A");
  });

  it("does not map courses with no cross-platform match", () => {
    const courses = [
      { source: "canvas", name: "CS 188" },
      { source: "canvas", name: "EE 16B" },
    ];
    const map = buildCourseNameMap(courses);
    expect(map.size).toBe(0);
  });

  // Regression: a user reported every Canvas assignment showing the same
  // class. All six of their courses began with "Fall 2026", the code pattern
  // read that as a course code, and the whole enrollment collapsed onto the
  // shortest name.
  it("does not collapse a whole enrollment that shares a term prefix", () => {
    const courses = [
      { source: "canvas", name: "Fall 2026 Physics 1740 All Sections" },
      { source: "canvas", name: "Fall 2026.BIOL.2970.01" },
      { source: "canvas", name: "Fall 2026.BIOL.2970.Z" },
      { source: "canvas", name: "Fall 2026.CHEM.2501.01 & 02" },
      { source: "canvas", name: "Fall 2026.ELIT.2152.01" },
      { source: "canvas", name: "Fall 2026.PHYSICS.1741.01" },
    ];
    const map = buildCourseNameMap(courses);
    expect(map.size).toBe(0);
    for (const c of courses) {
      expect(getCanonicalName(c.name, map)).toBe(c.name);
    }
  });

  it("leaves the reporter's real cross-platform enrollment intact", () => {
    const courses = [
      { source: "canvas", name: "Fall 2026 Physics 1740 All Sections" },
      { source: "canvas", name: "Fall 2026.BIOL.2970.01" },
      { source: "canvas", name: "Fall 2026.BIOL.2970.Z" },
      { source: "canvas", name: "Fall 2026.CHEM.2501.01 & 02" },
      { source: "canvas", name: "Fall 2026.ELIT.2152.01" },
      { source: "canvas", name: "Fall 2026.PHYSICS.1741.01" },
      { source: "gradescope", name: "Organic Chemistry I Lab" },
      { source: "gradescope", name: "Organic Chemistry I M & W" },
      { source: "gradescope", name: "Fall_2026.CHEM.2565 - Organic Chemistry Problem Solving Workshops I" },
      { source: "gradescope", name: "Physics Lab 1741" },
    ];
    const canonicals = courses.map((c) =>
      getCanonicalName(c.name, buildCourseNameMap(courses))
    );
    // Ten distinct courses must stay ten distinct names.
    expect(new Set(canonicals).size).toBe(courses.length);
  });

  it("never maps two courses from the same platform onto one name", () => {
    const courses = [
      { source: "canvas", name: "CS 188 Section A" },
      { source: "canvas", name: "CS 188 Section B" },
      { source: "gradescope", name: "CS 188" },
    ];
    const map = buildCourseNameMap(courses);
    const canonicals = courses.map((c) => getCanonicalName(c.name, map));
    expect(new Set(canonicals).size).toBe(courses.length);
  });

  it("handles courses with no extractable code", () => {
    const courses = [
      { source: "canvas", name: "History and Culture of Afghanistan" },
      { source: "gradescope", name: "History and Culture of Afghanistan" },
    ];
    const map = buildCourseNameMap(courses);
    expect(map.size).toBe(0);
  });
});

describe("getCanonicalName", () => {
  it("returns mapped name when exists", () => {
    const map = new Map([["CS 188 - Intro to AI", "CS 188"]]);
    expect(getCanonicalName("CS 188 - Intro to AI", map)).toBe("CS 188");
  });

  it("returns original name when no mapping", () => {
    const map = new Map<string, string>();
    expect(getCanonicalName("CS 188", map)).toBe("CS 188");
  });
});
