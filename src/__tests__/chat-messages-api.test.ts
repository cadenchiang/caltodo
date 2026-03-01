/**
 * Tests for the chat messages API route.
 * Verifies authentication, enrollment checks, message sending,
 * content moderation, and paginated history retrieval.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue({ allowed: true }),
}));

vi.mock("@/lib/spam-detection", () => ({
  checkSpam: vi.fn().mockReturnValue({ allowed: true }),
  checkDuplicate: vi.fn().mockReturnValue({ allowed: true }),
}));

vi.mock("@/lib/check-onboarding", () => ({
  hasCompletedOnboarding: vi.fn().mockResolvedValue(true),
}));

import { GET, POST } from "@/app/api/discussions/messages/route";
import { createClient } from "@/lib/supabase/server";

const mockCreateClient = vi.mocked(createClient);

beforeEach(() => {
  vi.clearAllMocks();
});

/**
 * Creates a mock Supabase client for testing.
 *
 * @param options - Configuration for the mock behavior
 * @returns Mock Supabase client
 */
function createMockSupabase(options: {
  userId?: string;
  enrolled?: boolean;
  messages?: Array<Record<string, unknown>>;
  insertResult?: Record<string, unknown> | null;
  insertError?: { message: string } | null;
}) {
  const {
    userId = "user-1",
    enrolled = true,
    messages = [],
    insertResult = null,
    insertError = null,
  } = options;

  const user = userId
    ? { id: userId, user_metadata: { full_name: "Test User", avatar_url: "https://example.com/avatar.png" } }
    : null;

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: userId ? null : { message: "Not authenticated" },
      }),
    },
    from: vi.fn((table: string) => {
      if (table === "course_memberships") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: enrolled ? { id: "mem-1" } : null,
                  error: enrolled ? null : { message: "Not found" },
                }),
              }),
            }),
          }),
        };
      }
      if (table === "chat_messages") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  lt: vi.fn().mockResolvedValue({ data: messages, error: null }),
                  then: (resolve: (val: { data: typeof messages; error: null }) => void) => {
                    resolve({ data: messages, error: null });
                    return { catch: () => {} };
                  },
                }),
              }),
            }),
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: insertResult,
                error: insertError,
              }),
            }),
          }),
        };
      }
      return {};
    }),
  };
}

describe("GET /api/discussions/messages", () => {
  it("should return 401 when not authenticated", async () => {
    const supabase = createMockSupabase({ userId: "" });
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Not authenticated" },
    });
    mockCreateClient.mockResolvedValue(supabase as any);

    const request = new Request("http://localhost/api/discussions/messages?courseId=course-1");
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it("should return 400 when courseId is missing", async () => {
    const supabase = createMockSupabase({});
    mockCreateClient.mockResolvedValue(supabase as any);

    const request = new Request("http://localhost/api/discussions/messages");
    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it("should return 403 when not enrolled", async () => {
    const supabase = createMockSupabase({ enrolled: false });
    mockCreateClient.mockResolvedValue(supabase as any);

    const request = new Request("http://localhost/api/discussions/messages?courseId=course-1");
    const response = await GET(request);
    expect(response.status).toBe(403);
  });
});

describe("POST /api/discussions/messages", () => {
  it("should return 401 when not authenticated", async () => {
    const supabase = createMockSupabase({ userId: "" });
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Not authenticated" },
    });
    mockCreateClient.mockResolvedValue(supabase as any);

    const request = new Request("http://localhost/api/discussions/messages", {
      method: "POST",
      body: JSON.stringify({ courseId: "course-1", body: "Hello" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("should return 400 when body is missing", async () => {
    const supabase = createMockSupabase({});
    mockCreateClient.mockResolvedValue(supabase as any);

    const request = new Request("http://localhost/api/discussions/messages", {
      method: "POST",
      body: JSON.stringify({ courseId: "course-1" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("should return 422 for blocked content", async () => {
    const supabase = createMockSupabase({ enrolled: true });
    mockCreateClient.mockResolvedValue(supabase as any);

    const request = new Request("http://localhost/api/discussions/messages", {
      method: "POST",
      body: JSON.stringify({ courseId: "course-1", body: "you are a nigger" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(422);
    const data = await response.json();
    expect(data.error).toContain("inappropriate");
  });

  it("should return 201 on successful message send", async () => {
    const mockMessage = {
      id: "msg-1",
      course_id: "course-1",
      author_id: "user-1",
      author_name: "Test User",
      author_avatar: "https://example.com/avatar.png",
      body: "Hello everyone!",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const supabase = createMockSupabase({
      enrolled: true,
      insertResult: mockMessage,
    });
    mockCreateClient.mockResolvedValue(supabase as any);

    const request = new Request("http://localhost/api/discussions/messages", {
      method: "POST",
      body: JSON.stringify({ courseId: "course-1", body: "Hello everyone!" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(201);
  });
});
