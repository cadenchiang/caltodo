/**
 * Tests for MCP JSON-RPC dispatch.
 * Mocks the tool registry to test initialize, tools/list, tools/call,
 * notifications, batches, and malformed input.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const mockCallTool = vi.fn();

vi.mock("@/lib/mcp/tools", () => ({
  MCP_TOOLS: [
    {
      name: "list_assignments",
      title: "List assignments",
      description: "List assignments",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute: vi.fn(),
    },
  ],
  callTool: (...args: unknown[]) => mockCallTool(...args),
}));

import {
  handleMessage,
  handleBody,
  negotiateProtocolVersion,
  success,
  failure,
  ERROR_CODES,
  DEFAULT_PROTOCOL_VERSION,
  SERVER_INFO,
} from "@/lib/mcp/protocol";

const USER_ID = "user-abc-123";

/** These suites exercise behaviour, not permissions, so they use a
    full-access key; scope enforcement has its own suite in mcp-scopes. */
const SCOPE = "full" as const;

describe("success / failure builders", () => {
  it("builds a JSON-RPC 2.0 success envelope", () => {
    expect(success(1, { ok: true })).toEqual({ jsonrpc: "2.0", id: 1, result: { ok: true } });
  });

  it("builds a JSON-RPC 2.0 error envelope", () => {
    expect(failure(null, ERROR_CODES.parseError, "bad")).toEqual({
      jsonrpc: "2.0",
      id: null,
      error: { code: ERROR_CODES.parseError, message: "bad" },
    });
  });
});

describe("negotiateProtocolVersion", () => {
  it("echoes a supported version", () => {
    expect(negotiateProtocolVersion("2024-11-05")).toBe("2024-11-05");
  });

  it("falls back to the default for an unknown version", () => {
    expect(negotiateProtocolVersion("1999-01-01")).toBe(DEFAULT_PROTOCOL_VERSION);
  });

  it("falls back to the default for a non-string", () => {
    expect(negotiateProtocolVersion(undefined)).toBe(DEFAULT_PROTOCOL_VERSION);
  });
});

describe("handleMessage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("answers initialize with capabilities and server info", async () => {
    const response = await handleMessage(
      { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26" } },
      USER_ID,
      SCOPE
    );
    expect(response).toEqual({
      jsonrpc: "2.0",
      id: 1,
      result: {
        protocolVersion: "2025-03-26",
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
      },
    });
  });

  it("answers ping with an empty result", async () => {
    const response = await handleMessage({ jsonrpc: "2.0", id: 2, method: "ping" }, USER_ID, SCOPE);
    expect(response).toEqual({ jsonrpc: "2.0", id: 2, result: {} });
  });

  it("lists tools with name, title, description and schema", async () => {
    const response = await handleMessage(
      { jsonrpc: "2.0", id: 3, method: "tools/list" },
      USER_ID,
      SCOPE
    );
    const tools = (response?.result as { tools: Array<Record<string, unknown>> }).tools;
    expect(tools).toHaveLength(1);
    expect(tools[0]).toMatchObject({ name: "list_assignments", title: "List assignments" });
    expect(tools[0].inputSchema).toBeDefined();
    expect(tools[0].execute).toBeUndefined();
  });

  it("calls a tool and wraps the text in MCP content", async () => {
    mockCallTool.mockResolvedValue({ text: "2 assignments", isError: false });
    const response = await handleMessage(
      {
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: { name: "list_assignments", arguments: { status: "today" } },
      },
      USER_ID,
      SCOPE
    );
    expect(mockCallTool).toHaveBeenCalledWith("list_assignments", { status: "today" }, USER_ID, SCOPE);
    expect(response?.result).toEqual({
      content: [{ type: "text", text: "2 assignments" }],
      isError: false,
    });
  });

  it("defaults missing tool arguments to an empty object", async () => {
    mockCallTool.mockResolvedValue({ text: "ok", isError: false });
    await handleMessage(
      { jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "list_assignments" } },
      USER_ID,
      SCOPE
    );
    expect(mockCallTool).toHaveBeenCalledWith("list_assignments", {}, USER_ID, SCOPE);
  });

  it("ignores non-object tool arguments", async () => {
    mockCallTool.mockResolvedValue({ text: "ok", isError: false });
    await handleMessage(
      {
        jsonrpc: "2.0",
        id: 6,
        method: "tools/call",
        params: { name: "list_assignments", arguments: "nope" },
      },
      USER_ID,
      SCOPE
    );
    expect(mockCallTool).toHaveBeenCalledWith("list_assignments", {}, USER_ID, SCOPE);
  });

  it("surfaces a tool error as an isError result, not a JSON-RPC error", async () => {
    mockCallTool.mockResolvedValue({ text: "connection reset", isError: true });
    const response = await handleMessage(
      { jsonrpc: "2.0", id: 7, method: "tools/call", params: { name: "list_assignments" } },
      USER_ID,
      SCOPE
    );
    expect(response?.error).toBeUndefined();
    expect(response?.result).toMatchObject({ isError: true });
  });

  it("returns invalidParams when tools/call has no name", async () => {
    const response = await handleMessage(
      { jsonrpc: "2.0", id: 8, method: "tools/call", params: {} },
      USER_ID,
      SCOPE
    );
    expect(response?.error?.code).toBe(ERROR_CODES.invalidParams);
    expect(mockCallTool).not.toHaveBeenCalled();
  });

  it("returns methodNotFound for an unknown method", async () => {
    const response = await handleMessage(
      { jsonrpc: "2.0", id: 9, method: "resources/list" },
      USER_ID,
      SCOPE
    );
    expect(response?.error?.code).toBe(ERROR_CODES.methodNotFound);
  });

  it("returns no response for the initialized notification", async () => {
    const response = await handleMessage(
      { jsonrpc: "2.0", method: "notifications/initialized" },
      USER_ID,
      SCOPE
    );
    expect(response).toBeNull();
  });

  it("returns invalidRequest when the method is missing", async () => {
    const response = await handleMessage({ jsonrpc: "2.0", id: 10 }, USER_ID, SCOPE);
    expect(response?.error?.code).toBe(ERROR_CODES.invalidRequest);
  });

  it("stays silent for a malformed notification", async () => {
    const response = await handleMessage({ jsonrpc: "2.0" }, USER_ID, SCOPE);
    expect(response).toBeNull();
  });
});

describe("handleBody", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns one response for a single request", async () => {
    const responses = await handleBody({ jsonrpc: "2.0", id: 1, method: "ping" }, USER_ID, SCOPE);
    expect(responses).toHaveLength(1);
  });

  it("returns no responses for a notification-only body", async () => {
    const responses = await handleBody(
      { jsonrpc: "2.0", method: "notifications/initialized" },
      USER_ID,
      SCOPE
    );
    expect(responses).toEqual([]);
  });

  it("answers a batch, dropping notification entries", async () => {
    const responses = await handleBody(
      [
        { jsonrpc: "2.0", id: 1, method: "ping" },
        { jsonrpc: "2.0", method: "notifications/initialized" },
        { jsonrpc: "2.0", id: 2, method: "tools/list" },
      ],
      USER_ID,
      SCOPE
    );
    expect(responses.map((r) => r.id)).toEqual([1, 2]);
  });

  it("returns invalidRequest for an empty batch", async () => {
    const responses = await handleBody([], USER_ID, SCOPE);
    expect(responses[0].error?.code).toBe(ERROR_CODES.invalidRequest);
  });

  it("returns invalidRequest for a non-object body", async () => {
    const responses = await handleBody("hello", USER_ID, SCOPE);
    expect(responses[0].error?.code).toBe(ERROR_CODES.invalidRequest);
  });

  it("returns invalidRequest for a null body", async () => {
    const responses = await handleBody(null, USER_ID, SCOPE);
    expect(responses[0].error?.code).toBe(ERROR_CODES.invalidRequest);
  });
});
