/**
 * Tests for Canvas REST API client.
 * Mocks fetch to simulate Canvas API responses, pagination, and error codes.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchCanvasCourses, fetchAllCanvasAssignments } from "@/lib/canvas-client";

// Mock logger to prevent console output in tests
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const TOKEN = "test-token";
const BASE_URL = "https://bcourses.berkeley.edu";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fetchCanvasCourses", () => {
  it("should return courses from a single page", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [
        { id: 1, name: "CS 61A", course_code: "CS61A" },
        { id: 2, name: "Math 54", course_code: "MATH54" },
      ],
      headers: new Headers(),
    });

    const courses = await fetchCanvasCourses(TOKEN, BASE_URL);
    expect(courses).toHaveLength(2);
    expect(courses[0].name).toBe("CS 61A");
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/v1/courses?enrollment_state=active&per_page=50`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
  });

  it("should handle pagination via Link header", async () => {
    const page2Url = `${BASE_URL}/api/v1/courses?page=2&per_page=50`;

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [{ id: 1, name: "CS 61A", course_code: "CS61A" }],
        headers: new Headers({
          link: `<${page2Url}>; rel="next"`,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [{ id: 2, name: "Math 54", course_code: "MATH54" }],
        headers: new Headers(),
      });

    const courses = await fetchCanvasCourses(TOKEN, BASE_URL);
    expect(courses).toHaveLength(2);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should throw on 401 (invalid token)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      headers: new Headers(),
    });

    await expect(fetchCanvasCourses(TOKEN, BASE_URL)).rejects.toThrow(
      "Canvas token is invalid or expired"
    );
  });

  it("should throw on 403 (rate limit)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      headers: new Headers(),
    });

    await expect(fetchCanvasCourses(TOKEN, BASE_URL)).rejects.toThrow(
      "Canvas rate limit exceeded"
    );
  });

  it("should throw on unexpected status codes", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      headers: new Headers(),
    });

    await expect(fetchCanvasCourses(TOKEN, BASE_URL)).rejects.toThrow(
      "Canvas API error: 500"
    );
  });
});

describe("fetchAllCanvasAssignments", () => {
  it("should fetch courses then assignments for each course", async () => {
    // Courses request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [
        { id: 1, name: "CS 61A", course_code: "CS61A" },
      ],
      headers: new Headers(),
    });

    // Assignments for course 1
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [
        {
          id: 101,
          name: "Homework 1",
          due_at: "2026-03-01T23:59:00Z",
          html_url: "https://bcourses.berkeley.edu/courses/1/assignments/101",
          points_possible: 10,
          course_id: 1,
        },
        {
          id: 102,
          name: "Lab 1",
          due_at: null,
          html_url: "https://bcourses.berkeley.edu/courses/1/assignments/102",
          points_possible: 5,
          course_id: 1,
        },
      ],
      headers: new Headers(),
    });

    const results = await fetchAllCanvasAssignments(TOKEN, BASE_URL);
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      external_id: "101",
      course_name: "CS 61A",
      course_id: "1",
      title: "Homework 1",
      due_date: "2026-03-01T23:59:00Z",
      source_url: "https://bcourses.berkeley.edu/courses/1/assignments/101",
      points_possible: 10,
    });
    expect(results[1].title).toBe("Lab 1");
    expect(results[1].due_date).toBeNull();
  });

  it("should continue fetching other courses when one fails", async () => {
    // Courses request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [
        { id: 1, name: "CS 61A", course_code: "CS61A" },
        { id: 2, name: "Math 54", course_code: "MATH54" },
      ],
      headers: new Headers(),
    });

    // Course 1 assignments fail
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      headers: new Headers(),
    });

    // Course 2 assignments succeed
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [
        {
          id: 201,
          name: "Problem Set 1",
          due_at: "2026-03-05T23:59:00Z",
          html_url: "https://bcourses.berkeley.edu/courses/2/assignments/201",
          points_possible: 20,
          course_id: 2,
        },
      ],
      headers: new Headers(),
    });

    const results = await fetchAllCanvasAssignments(TOKEN, BASE_URL);
    // Only course 2 assignments should be returned (course 1 failed gracefully)
    expect(results).toHaveLength(1);
    expect(results[0].course_name).toBe("Math 54");
  });
});
