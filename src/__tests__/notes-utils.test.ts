import { describe, it, expect } from "vitest";
import { extractTextPreview, extractFirstLine } from "@/lib/notes-utils";

describe("extractTextPreview", () => {
  it("returns empty string for empty doc", () => {
    expect(extractTextPreview({ type: "doc", content: [] })).toBe("");
  });

  it("returns empty string for doc with no content key", () => {
    expect(extractTextPreview({ type: "doc" })).toBe("");
  });

  it("extracts text from a single paragraph", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Hello world" }],
        },
      ],
    };
    expect(extractTextPreview(doc)).toBe("Hello world");
  });

  it("extracts text from nested heading + paragraph", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "heading",
          content: [{ type: "text", text: "Title" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Body text" }],
        },
      ],
    };
    expect(extractTextPreview(doc)).toBe("Title Body text");
  });

  it("truncates long text to maxLength with ellipsis", () => {
    const longText = "a".repeat(200);
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: longText }],
        },
      ],
    };
    const result = extractTextPreview(doc, 50);
    expect(result.length).toBe(51); // 50 chars + ellipsis
    expect(result.endsWith("\u2026")).toBe(true);
  });

  it("trims whitespace-only nodes", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "   " }],
        },
      ],
    };
    expect(extractTextPreview(doc)).toBe("");
  });

  it("preserves special characters and emoji", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Hello 🌍 café" }],
        },
      ],
    };
    expect(extractTextPreview(doc)).toBe("Hello 🌍 café");
  });

  it("handles deeply nested content within depth limit", () => {
    // Build a 10-level nested structure
    let node: Record<string, unknown> = { type: "text", text: "deep" };
    for (let i = 0; i < 10; i++) {
      node = { type: "paragraph", content: [node] };
    }
    const doc = { type: "doc", content: [node] };
    expect(extractTextPreview(doc)).toBe("deep");
  });
});

describe("extractFirstLine", () => {
  it("returns empty string for empty content", () => {
    expect(extractFirstLine({ type: "doc", content: [] })).toBe("");
  });

  it("returns empty string when content key is missing", () => {
    expect(extractFirstLine({ type: "doc" })).toBe("");
  });

  it("returns first text from heading", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "heading",
          content: [{ type: "text", text: "My Heading" }],
        },
      ],
    };
    expect(extractFirstLine(doc)).toBe("My Heading");
  });

  it("returns first text from paragraph", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "First line" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Second line" }],
        },
      ],
    };
    expect(extractFirstLine(doc)).toBe("First line");
  });

  it("skips empty text nodes", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "   " }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Actual text" }],
        },
      ],
    };
    expect(extractFirstLine(doc)).toBe("Actual text");
  });

  it("truncates to 100 chars", () => {
    const longText = "x".repeat(200);
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: longText }],
        },
      ],
    };
    expect(extractFirstLine(doc).length).toBe(100);
  });
});
