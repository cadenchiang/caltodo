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

  it("returns null for non-course names", () => {
    expect(extractCourseCode("History and Culture of Afghanistan")).toBeNull();
    expect(extractCourseCode("My Study Group")).toBeNull();
    expect(extractCourseCode("")).toBeNull();
  });

  it("handles case insensitivity", () => {
    expect(extractCourseCode("ugba 101a-LEC-002")).toBe("UGBA 101A");
    expect(extractCourseCode("cs 188")).toBe("CS 188");
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
