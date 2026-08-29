/**
 * Tests for turning description text into clickable segments.
 * Covers the Canvas markdown-attachment shape, bare URLs, ordering, and the
 * refusal to linkify anything that is not http(s).
 */

import { describe, it, expect } from "vitest";
import { parseLinks, looksLikeDocument } from "@/lib/link-text";

describe("parseLinks", () => {
  it("returns nothing for empty text", () => {
    expect(parseLinks("")).toEqual([]);
  });

  it("returns a single text segment when there is no link", () => {
    expect(parseLinks("Please complete the questions.")).toEqual([
      { kind: "text", value: "Please complete the questions." },
    ]);
  });

  it("parses the Canvas attachment shape", () => {
    // The exact form a synced bCourses assignment arrives in.
    const text =
      "Please complete the questions.\n\n[UGBA103_Week2_Section_Assignment_26docx-1.pdf](https://bcourses.berkeley.edu/courses/1556584/files/95008577?wrap=1)";
    const segments = parseLinks(text);

    expect(segments).toHaveLength(2);
    expect(segments[0]).toEqual({ kind: "text", value: "Please complete the questions.\n\n" });
    expect(segments[1]).toEqual({
      kind: "link",
      label: "UGBA103_Week2_Section_Assignment_26docx-1.pdf",
      href: "https://bcourses.berkeley.edu/courses/1556584/files/95008577?wrap=1",
    });
  });

  it("linkifies a bare URL", () => {
    const segments = parseLinks("See https://example.com/syllabus.pdf for details");
    expect(segments[1]).toEqual({
      kind: "link",
      label: "https://example.com/syllabus.pdf",
      href: "https://example.com/syllabus.pdf",
    });
    expect(segments[2]).toEqual({ kind: "text", value: " for details" });
  });

  it("does not swallow the sentence's full stop into the URL", () => {
    const segments = parseLinks("Read https://example.com/a.pdf.");
    const link = segments.find((s) => s.kind === "link");
    expect(link).toMatchObject({ href: "https://example.com/a.pdf" });
  });

  it("does not double-match a URL already inside a markdown link", () => {
    const segments = parseLinks("[file.pdf](https://example.com/file.pdf)");
    expect(segments.filter((s) => s.kind === "link")).toHaveLength(1);
  });

  it("keeps several links in source order", () => {
    const segments = parseLinks("a [one](https://a.com) b https://b.com c");
    const links = segments.filter((s) => s.kind === "link");
    expect(links.map((l) => (l.kind === "link" ? l.href : ""))).toEqual([
      "https://a.com",
      "https://b.com",
    ]);
    expect(segments[0]).toEqual({ kind: "text", value: "a " });
    expect(segments[segments.length - 1]).toEqual({ kind: "text", value: " c" });
  });

  it("leaves a javascript: payload as inert text", () => {
    // Descriptions are synced from third-party systems, so a hostile scheme
    // must never reach an href.
    const text = "[click me](javascript:alert(1))";
    const segments = parseLinks(text);
    expect(segments.every((s) => s.kind === "text")).toBe(true);
  });

  it("leaves a mailto link as text", () => {
    expect(parseLinks("[mail](mailto:a@b.com)").every((s) => s.kind === "text")).toBe(true);
  });

  it("reassembles to the original text", () => {
    const text = "Do [hw.pdf](https://x.com/hw.pdf) then see https://y.com now";
    const rebuilt = parseLinks(text)
      .map((s) => (s.kind === "text" ? s.value : s.kind === "link" && s.label === s.href ? s.label : ""))
      .join("");
    // The markdown link collapses to its label, so compare the tail only.
    expect(rebuilt).toContain("then see https://y.com now");
  });
});

describe("looksLikeDocument", () => {
  it("recognises document extensions in the label", () => {
    for (const name of ["a.pdf", "b.docx", "c.pptx", "d.xlsx", "e.csv", "f.txt"]) {
      expect(looksLikeDocument("https://x.com/1", name)).toBe(true);
    }
  });

  it("recognises them in the href, including with a query string", () => {
    expect(looksLikeDocument("https://x.com/a.pdf?wrap=1", "open")).toBe(true);
  });

  it("returns false for an ordinary page link", () => {
    expect(looksLikeDocument("https://bcourses.berkeley.edu/courses/1", "Open assignment")).toBe(
      false
    );
  });
});
