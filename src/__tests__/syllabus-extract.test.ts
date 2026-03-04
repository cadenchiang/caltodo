/**
 * Unit tests for the syllabus extraction API route validation and parsing logic.
 * Tests cover: MIME type validation, file size validation, response sanitization,
 * JSON parsing (including markdown-fenced responses), and date/time format validation.
 */

import { describe, it, expect } from "vitest";

/** Allowed MIME types matching the API route. */
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

/** Maximum file size in bytes (10 MB). */
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** Date format regex matching the API route validation. */
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Time format regex matching the API route validation. */
const TIME_REGEX = /^\d{2}:\d{2}$/;

/**
 * Sanitizes an extracted assignment the same way the API route does.
 *
 * @param a - Raw assignment object from Claude API response
 * @returns Sanitized assignment with validated types
 */
function sanitizeAssignment(a: Record<string, unknown>) {
  return {
    title: typeof a.title === "string" ? a.title : "Untitled Assignment",
    description: typeof a.description === "string" ? a.description : null,
    due_date:
      typeof a.due_date === "string" && DATE_REGEX.test(a.due_date)
        ? a.due_date
        : null,
    due_time:
      typeof a.due_time === "string" && TIME_REGEX.test(a.due_time)
        ? a.due_time
        : null,
    points_possible:
      typeof a.points_possible === "number" ? a.points_possible : null,
  };
}

/**
 * Strips markdown code fences from a JSON string, matching API route logic.
 *
 * @param text - Raw text that may contain markdown code fences
 * @returns Clean JSON string
 */
function stripCodeFences(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }
  return cleaned;
}

describe("MIME type validation", () => {
  it("accepts PDF files", () => {
    expect(ALLOWED_MIME_TYPES.has("application/pdf")).toBe(true);
  });

  it("accepts PNG files", () => {
    expect(ALLOWED_MIME_TYPES.has("image/png")).toBe(true);
  });

  it("accepts JPEG files", () => {
    expect(ALLOWED_MIME_TYPES.has("image/jpeg")).toBe(true);
  });

  it("accepts WebP files", () => {
    expect(ALLOWED_MIME_TYPES.has("image/webp")).toBe(true);
  });

  it("rejects text files", () => {
    expect(ALLOWED_MIME_TYPES.has("text/plain")).toBe(false);
  });

  it("rejects Word documents", () => {
    expect(ALLOWED_MIME_TYPES.has("application/vnd.openxmlformats-officedocument.wordprocessingml.document")).toBe(false);
  });
});

describe("file size validation", () => {
  it("accepts files under 10 MB", () => {
    const base64Length = Math.ceil((5 * 1024 * 1024 * 4) / 3);
    const estimatedBytes = Math.ceil((base64Length * 3) / 4);
    expect(estimatedBytes <= MAX_FILE_SIZE_BYTES).toBe(true);
  });

  it("rejects files over 10 MB", () => {
    const base64Length = Math.ceil((11 * 1024 * 1024 * 4) / 3);
    const estimatedBytes = Math.ceil((base64Length * 3) / 4);
    expect(estimatedBytes > MAX_FILE_SIZE_BYTES).toBe(true);
  });
});

describe("assignment sanitization", () => {
  it("passes through valid assignment data", () => {
    const raw = {
      title: "Homework 1",
      description: "Complete chapter 1 exercises",
      due_date: "2026-02-15",
      due_time: "23:59",
      points_possible: 100,
    };
    const result = sanitizeAssignment(raw);
    expect(result).toEqual(raw);
  });

  it("replaces missing title with default", () => {
    const result = sanitizeAssignment({ title: undefined } as Record<string, unknown>);
    expect(result.title).toBe("Untitled Assignment");
  });

  it("replaces non-string title with default", () => {
    const result = sanitizeAssignment({ title: 42 } as Record<string, unknown>);
    expect(result.title).toBe("Untitled Assignment");
  });

  it("nullifies invalid date formats", () => {
    const result = sanitizeAssignment({
      title: "Test",
      due_date: "Feb 15, 2026",
    } as Record<string, unknown>);
    expect(result.due_date).toBeNull();
  });

  it("nullifies partial date strings", () => {
    const result = sanitizeAssignment({
      title: "Test",
      due_date: "2026-02",
    } as Record<string, unknown>);
    expect(result.due_date).toBeNull();
  });

  it("nullifies invalid time formats", () => {
    const result = sanitizeAssignment({
      title: "Test",
      due_time: "11:59 PM",
    } as Record<string, unknown>);
    expect(result.due_time).toBeNull();
  });

  it("accepts valid 24h time", () => {
    const result = sanitizeAssignment({
      title: "Test",
      due_time: "14:30",
    } as Record<string, unknown>);
    expect(result.due_time).toBe("14:30");
  });

  it("nullifies non-numeric points_possible", () => {
    const result = sanitizeAssignment({
      title: "Test",
      points_possible: "100",
    } as Record<string, unknown>);
    expect(result.points_possible).toBeNull();
  });

  it("nullifies missing description", () => {
    const result = sanitizeAssignment({ title: "Test" } as Record<string, unknown>);
    expect(result.description).toBeNull();
  });
});

describe("JSON response parsing", () => {
  it("parses clean JSON", () => {
    const json = '{"course_name": "CS 101", "assignments": []}';
    const result = JSON.parse(stripCodeFences(json));
    expect(result.course_name).toBe("CS 101");
    expect(result.assignments).toEqual([]);
  });

  it("strips markdown code fences", () => {
    const fenced = '```json\n{"course_name": "CS 101", "assignments": []}\n```';
    const result = JSON.parse(stripCodeFences(fenced));
    expect(result.course_name).toBe("CS 101");
  });

  it("strips code fences without language tag", () => {
    const fenced = '```\n{"course_name": null, "assignments": []}\n```';
    const result = JSON.parse(stripCodeFences(fenced));
    expect(result.course_name).toBeNull();
  });

  it("handles whitespace around fences", () => {
    const fenced = '  ```json\n{"assignments": []}\n```  ';
    const result = JSON.parse(stripCodeFences(fenced));
    expect(result.assignments).toEqual([]);
  });
});

describe("external_id generation", () => {
  /**
   * Generates external_id matching the TaskContext implementation.
   *
   * @param title - Assignment title
   * @param dueDate - Due date string or empty
   * @returns Deterministic external_id
   */
  function generateExternalId(title: string, dueDate: string): string {
    const raw = `${title}|${dueDate}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
    }
    return `syllabus-${Math.abs(hash).toString(36)}`;
  }

  it("generates deterministic IDs for the same input", () => {
    const id1 = generateExternalId("Homework 1", "2026-02-15");
    const id2 = generateExternalId("Homework 1", "2026-02-15");
    expect(id1).toBe(id2);
  });

  it("generates different IDs for different titles", () => {
    const id1 = generateExternalId("Homework 1", "2026-02-15");
    const id2 = generateExternalId("Homework 2", "2026-02-15");
    expect(id1).not.toBe(id2);
  });

  it("generates different IDs for different dates", () => {
    const id1 = generateExternalId("Homework 1", "2026-02-15");
    const id2 = generateExternalId("Homework 1", "2026-03-15");
    expect(id1).not.toBe(id2);
  });

  it("starts with syllabus- prefix", () => {
    const id = generateExternalId("Test", "2026-01-01");
    expect(id.startsWith("syllabus-")).toBe(true);
  });

  it("handles empty due date", () => {
    const id = generateExternalId("Test", "");
    expect(id.startsWith("syllabus-")).toBe(true);
    expect(id.length).toBeGreaterThan("syllabus-".length);
  });
});
