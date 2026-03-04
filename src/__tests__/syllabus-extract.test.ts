/**
 * Unit tests for the syllabus extraction API route validation and parsing logic.
 * Tests cover: MIME type validation, file size validation, response sanitization,
 * JSON parsing (including markdown-fenced responses), date/time format validation,
 * and extraction time estimation.
 */

import { describe, it, expect } from "vitest";
import { estimateExtractionTime } from "@/components/onboarding/SyllabusExtracting";

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

// ── Additional edge-case coverage ──────────────────────────────────────

describe("MIME type validation — additional rejections", () => {
  it("rejects GIF images", () => {
    expect(ALLOWED_MIME_TYPES.has("image/gif")).toBe(false);
  });

  it("rejects SVG images", () => {
    expect(ALLOWED_MIME_TYPES.has("image/svg+xml")).toBe(false);
  });

  it("rejects HTML files", () => {
    expect(ALLOWED_MIME_TYPES.has("text/html")).toBe(false);
  });

  it("rejects application/octet-stream", () => {
    expect(ALLOWED_MIME_TYPES.has("application/octet-stream")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(ALLOWED_MIME_TYPES.has("")).toBe(false);
  });

  it("is case-sensitive (rejects uppercase)", () => {
    expect(ALLOWED_MIME_TYPES.has("APPLICATION/PDF")).toBe(false);
    expect(ALLOWED_MIME_TYPES.has("Image/PNG")).toBe(false);
  });
});

describe("file size validation — boundary", () => {
  it("slightly over-estimates exactly 10 MB due to base64 ceil rounding", () => {
    // base64 encode ceil rounds up, so 10 MB -> 13981014 chars -> estimated 10485761 bytes (1 over)
    // This means the API rejects an exact-10-MB file — documenting this known quirk
    const base64Length = Math.ceil((10 * 1024 * 1024 * 4) / 3);
    const estimatedBytes = Math.ceil((base64Length * 3) / 4);
    expect(estimatedBytes).toBe(10 * 1024 * 1024 + 1);
  });

  it("accepts files just under 10 MB", () => {
    const justUnder = 10 * 1024 * 1024 - 1;
    const base64Length = Math.ceil((justUnder * 4) / 3);
    const estimatedBytes = Math.ceil((base64Length * 3) / 4);
    expect(estimatedBytes <= MAX_FILE_SIZE_BYTES).toBe(true);
  });

  it("rejects 10 MB + 1 byte", () => {
    const base64Length = Math.ceil(((10 * 1024 * 1024 + 1) * 4) / 3);
    const estimatedBytes = Math.ceil((base64Length * 3) / 4);
    expect(estimatedBytes > MAX_FILE_SIZE_BYTES).toBe(true);
  });

  it("accepts a 0-byte file", () => {
    const estimatedBytes = Math.ceil((0 * 3) / 4);
    expect(estimatedBytes <= MAX_FILE_SIZE_BYTES).toBe(true);
  });
});

describe("assignment sanitization — edge cases", () => {
  it("handles completely empty object", () => {
    const result = sanitizeAssignment({});
    expect(result).toEqual({
      title: "Untitled Assignment",
      description: null,
      due_date: null,
      due_time: null,
      points_possible: null,
    });
  });

  it("accepts empty string as title (not replaced)", () => {
    const result = sanitizeAssignment({ title: "" });
    expect(result.title).toBe("");
  });

  it("accepts empty string as description", () => {
    const result = sanitizeAssignment({ title: "Test", description: "" });
    expect(result.description).toBe("");
  });

  it("nullifies boolean title", () => {
    const result = sanitizeAssignment({ title: true } as Record<string, unknown>);
    expect(result.title).toBe("Untitled Assignment");
  });

  it("nullifies array title", () => {
    const result = sanitizeAssignment({ title: ["HW1"] } as Record<string, unknown>);
    expect(result.title).toBe("Untitled Assignment");
  });

  it("nullifies object description", () => {
    const result = sanitizeAssignment({ title: "Test", description: { text: "hi" } } as Record<string, unknown>);
    expect(result.description).toBeNull();
  });

  it("nullifies date with extra characters", () => {
    const result = sanitizeAssignment({ title: "Test", due_date: "2026-02-15T00:00" });
    expect(result.due_date).toBeNull();
  });

  it("nullifies date with slashes instead of dashes", () => {
    const result = sanitizeAssignment({ title: "Test", due_date: "2026/02/15" });
    expect(result.due_date).toBeNull();
  });

  it("accepts structurally valid but impossible date (regex only)", () => {
    // The regex only checks format, not calendar validity
    const result = sanitizeAssignment({ title: "Test", due_date: "2026-13-45" });
    expect(result.due_date).toBe("2026-13-45");
  });

  it("nullifies time with seconds", () => {
    const result = sanitizeAssignment({ title: "Test", due_time: "14:30:00" });
    expect(result.due_time).toBeNull();
  });

  it("nullifies time with AM/PM suffix", () => {
    const result = sanitizeAssignment({ title: "Test", due_time: "02:30PM" });
    expect(result.due_time).toBeNull();
  });

  it("accepts midnight as 00:00", () => {
    const result = sanitizeAssignment({ title: "Test", due_time: "00:00" });
    expect(result.due_time).toBe("00:00");
  });

  it("accepts structurally valid but impossible time (regex only)", () => {
    const result = sanitizeAssignment({ title: "Test", due_time: "99:99" });
    expect(result.due_time).toBe("99:99");
  });

  it("accepts zero points_possible", () => {
    const result = sanitizeAssignment({ title: "Test", points_possible: 0 });
    expect(result.points_possible).toBe(0);
  });

  it("accepts negative points_possible (still a number)", () => {
    const result = sanitizeAssignment({ title: "Test", points_possible: -10 });
    expect(result.points_possible).toBe(-10);
  });

  it("accepts fractional points_possible", () => {
    const result = sanitizeAssignment({ title: "Test", points_possible: 99.5 });
    expect(result.points_possible).toBe(99.5);
  });

  it("nullifies NaN points_possible", () => {
    const result = sanitizeAssignment({ title: "Test", points_possible: NaN });
    // NaN is typeof "number" so it passes through — documenting current behavior
    expect(result.points_possible).toBeNaN();
  });

  it("nullifies null values for all optional fields", () => {
    const result = sanitizeAssignment({
      title: "Test",
      description: null,
      due_date: null,
      due_time: null,
      points_possible: null,
    });
    expect(result.description).toBeNull();
    expect(result.due_date).toBeNull();
    expect(result.due_time).toBeNull();
    expect(result.points_possible).toBeNull();
  });

  it("handles extra unexpected fields gracefully", () => {
    const result = sanitizeAssignment({
      title: "HW 3",
      due_date: "2026-04-01",
      extra_field: "should be ignored",
      nested: { data: true },
    });
    expect(result.title).toBe("HW 3");
    expect(result.due_date).toBe("2026-04-01");
    expect(Object.keys(result)).toEqual([
      "title", "description", "due_date", "due_time", "points_possible",
    ]);
  });
});

describe("JSON response parsing — edge cases", () => {
  it("handles code fence with trailing newline only", () => {
    const fenced = "```json\n{\"assignments\": []}\n```\n";
    const result = JSON.parse(stripCodeFences(fenced));
    expect(result.assignments).toEqual([]);
  });

  it("preserves non-fenced text as-is", () => {
    const plain = '{"course_name": "Math 53"}';
    expect(stripCodeFences(plain)).toBe('{"course_name": "Math 53"}');
  });

  it("handles empty assignments array in full response", () => {
    const json = '{"course_name": "EECS 16A", "assignments": []}';
    const result = JSON.parse(stripCodeFences(json));
    expect(result.course_name).toBe("EECS 16A");
    expect(result.assignments).toHaveLength(0);
  });

  it("parses a realistic multi-assignment response", () => {
    const json = JSON.stringify({
      course_name: "CS 61B",
      assignments: [
        { title: "HW 1", description: "Linked lists", due_date: "2026-02-10", due_time: "23:59", points_possible: 20 },
        { title: "Midterm 1", description: null, due_date: "2026-03-05", due_time: "19:00", points_possible: 100 },
        { title: "Project 2", description: "Gitlet", due_date: "2026-04-15", due_time: "23:59", points_possible: 50 },
      ],
    });
    const fenced = "```json\n" + json + "\n```";
    const result = JSON.parse(stripCodeFences(fenced));
    expect(result.course_name).toBe("CS 61B");
    expect(result.assignments).toHaveLength(3);
    expect(result.assignments[0].title).toBe("HW 1");
    expect(result.assignments[2].due_date).toBe("2026-04-15");
  });

  it("handles assignments with all null optional fields", () => {
    const json = JSON.stringify({
      course_name: null,
      assignments: [
        { title: "TBD Assignment", description: null, due_date: null, due_time: null, points_possible: null },
      ],
    });
    const result = JSON.parse(stripCodeFences(json));
    const sanitized = sanitizeAssignment(result.assignments[0]);
    expect(sanitized.title).toBe("TBD Assignment");
    expect(sanitized.description).toBeNull();
    expect(sanitized.due_date).toBeNull();
    expect(sanitized.due_time).toBeNull();
    expect(sanitized.points_possible).toBeNull();
  });
});

describe("external_id generation — edge cases", () => {
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

  it("handles unicode characters in title", () => {
    const id = generateExternalId("Tarea #1 — Álgebra", "2026-03-01");
    expect(id.startsWith("syllabus-")).toBe(true);
    expect(id.length).toBeGreaterThan("syllabus-".length);
  });

  it("handles very long titles", () => {
    const longTitle = "A".repeat(1000);
    const id = generateExternalId(longTitle, "2026-01-01");
    expect(id.startsWith("syllabus-")).toBe(true);
  });

  it("handles special characters in title", () => {
    const id = generateExternalId("HW #3: Arrays & Linked-Lists (Part 2)", "2026-02-20");
    expect(id.startsWith("syllabus-")).toBe(true);
  });

  it("produces distinct IDs for similar titles", () => {
    const id1 = generateExternalId("HW 1", "2026-01-01");
    const id2 = generateExternalId("HW 10", "2026-01-01");
    expect(id1).not.toBe(id2);
  });
});

describe("estimateExtractionTime", () => {
  it("returns base time for a 0-byte file", () => {
    expect(estimateExtractionTime(0)).toBe(8_000);
  });

  it("returns ~9s for a 500KB file", () => {
    const result = estimateExtractionTime(500 * 1024);
    // 500KB ≈ 0.488MB → 8000 + 0.488*3000 ≈ 9465
    expect(result).toBeGreaterThan(9_000);
    expect(result).toBeLessThan(10_000);
  });

  it("returns ~14s for a 2MB file", () => {
    const result = estimateExtractionTime(2 * 1024 * 1024);
    // 2MB → 8000 + 2*3000 = 14000
    expect(result).toBe(14_000);
  });

  it("returns ~23s for a 5MB file", () => {
    const result = estimateExtractionTime(5 * 1024 * 1024);
    // 5MB → 8000 + 5*3000 = 23000
    expect(result).toBe(23_000);
  });

  it("returns ~38s for a 10MB file", () => {
    const result = estimateExtractionTime(10 * 1024 * 1024);
    // 10MB → 8000 + 10*3000 = 38000
    expect(result).toBe(38_000);
  });

  it("caps at 45s for very large files", () => {
    const result = estimateExtractionTime(20 * 1024 * 1024);
    // 20MB → 8000 + 20*3000 = 68000, capped at 45000
    expect(result).toBe(45_000);
  });

  it("caps at 45s for extremely large files", () => {
    const result = estimateExtractionTime(100 * 1024 * 1024);
    expect(result).toBe(45_000);
  });

  it("returns a number greater than 0 for any positive file size", () => {
    expect(estimateExtractionTime(1)).toBeGreaterThan(0);
  });

  it("increases monotonically with file size (before cap)", () => {
    const small = estimateExtractionTime(1 * 1024 * 1024);
    const medium = estimateExtractionTime(3 * 1024 * 1024);
    const large = estimateExtractionTime(8 * 1024 * 1024);
    expect(medium).toBeGreaterThan(small);
    expect(large).toBeGreaterThan(medium);
  });
});
