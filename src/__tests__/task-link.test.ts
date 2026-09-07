/**
 * Tests for the task link normaliser.
 *
 * The result becomes an `href`, so the refusals matter as much as the
 * successes: anything that is not http(s) must not survive this function.
 */

import { describe, it, expect } from "vitest";
import { normaliseTaskLink, displayTaskLink } from "@/lib/task-link";

/** Builds a string with a raw control character in the middle. */
function withCharCode(before: string, code: number, after: string): string {
  return before + String.fromCharCode(code) + after;
}

describe("normaliseTaskLink", () => {
  it("keeps an absolute https URL", () => {
    expect(normaliseTaskLink("https://bcourses.berkeley.edu/courses/1")).toBe(
      "https://bcourses.berkeley.edu/courses/1"
    );
  });

  it("keeps http, which plenty of course pages still are", () => {
    expect(normaliseTaskLink("http://example.com/a")).toBe("http://example.com/a");
  });

  it("assumes https for a bare host", () => {
    expect(normaliseTaskLink("bcourses.berkeley.edu/courses/1")).toBe(
      "https://bcourses.berkeley.edu/courses/1"
    );
  });

  it("trims surrounding space", () => {
    expect(normaliseTaskLink("  example.com  ")).toBe("https://example.com/");
  });

  it("keeps the query string", () => {
    expect(normaliseTaskLink("example.com/a?b=1&c=2")).toBe("https://example.com/a?b=1&c=2");
  });

  it("refuses empty input", () => {
    expect(normaliseTaskLink("")).toBeNull();
    expect(normaliseTaskLink("   ")).toBeNull();
  });

  it("refuses a javascript: URL", () => {
    // The whole point of the function.
    expect(normaliseTaskLink("javascript:alert(1)")).toBeNull();
    expect(normaliseTaskLink("JavaScript:alert(1)")).toBeNull();
  });

  it("refuses a javascript: URL broken up by a control character", () => {
    // 10 = newline, 9 = tab, 13 = carriage return, 0 = NUL.
    for (const code of [10, 9, 13, 0]) {
      expect(normaliseTaskLink(withCharCode("java", code, "script:alert(1)"))).toBeNull();
    }
    expect(normaliseTaskLink("java script:alert(1)")).toBeNull();
  });

  it("refuses other schemes that are not navigation", () => {
    for (const bad of [
      "data:text/html;base64,PHNjcmlwdD4=",
      "file:///etc/passwd",
      "vbscript:msgbox(1)",
      "blob:https://example.com/x",
      "mailto:someone@example.com",
    ]) {
      expect(normaliseTaskLink(bad)).toBeNull();
    }
  });

  it("does not turn a blocked scheme into a hostname", () => {
    // Prepending https:// to "javascript:alert(1)" would produce a valid URL
    // pointing at a host named "javascript", which is worse than refusing.
    // Whatever comes back, it must not be that.
    for (const bad of ["javascript:alert(1)", "data:text/html,x", "vbscript:x"]) {
      const result = normaliseTaskLink(bad);
      expect(result).toBeNull();
      expect(result ?? "").not.toContain("javascript");
      expect(result ?? "").not.toContain("vbscript");
    }
  });

  it("refuses text with spaces inside", () => {
    expect(normaliseTaskLink("read chapter 5")).toBeNull();
  });

  it("refuses a bare word that is not a host", () => {
    expect(normaliseTaskLink("notes")).toBeNull();
    expect(normaliseTaskLink("todo")).toBeNull();
  });

  it("allows localhost, which has no dot", () => {
    expect(normaliseTaskLink("http://localhost:3000/app")).toBe("http://localhost:3000/app");
  });

  it("refuses a URL with no host", () => {
    expect(normaliseTaskLink("https:///path")).toBeNull();
  });

  it("refuses something far too long to be a link", () => {
    expect(normaliseTaskLink(`https://example.com/${"a".repeat(2100)}`)).toBeNull();
  });
});

describe("displayTaskLink", () => {
  it("drops the scheme", () => {
    expect(displayTaskLink("https://bcourses.berkeley.edu/courses/1")).toBe(
      "bcourses.berkeley.edu/courses/1"
    );
  });

  it("drops a bare trailing slash", () => {
    expect(displayTaskLink("https://example.com/")).toBe("example.com");
  });

  it("keeps the port and the query", () => {
    expect(displayTaskLink("http://localhost:3000/app?tab=1")).toBe("localhost:3000/app?tab=1");
  });

  it("returns the input unchanged when it cannot be parsed", () => {
    expect(displayTaskLink("not a url")).toBe("not a url");
  });
});
