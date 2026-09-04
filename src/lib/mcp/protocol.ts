/**
 * Stateless JSON-RPC 2.0 dispatch for the Model Context Protocol.
 *
 * Implements the subset of MCP that a tools-only server needs over the
 * Streamable HTTP transport: initialize, ping, tools/list and tools/call.
 * No session state is kept, so any serverless invocation can serve any request.
 *
 * @module mcp/protocol
 */

import { MCP_TOOLS, callTool } from "@/lib/mcp/tools";
import { toolsForScope, type McpScope } from "@/lib/mcp/scopes";
import { logger } from "@/lib/logger";

/** Protocol revisions this server can speak, newest first. */
export const SUPPORTED_PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"] as const;

/** Version used when the client asks for one this server does not know. */
export const DEFAULT_PROTOCOL_VERSION = SUPPORTED_PROTOCOL_VERSIONS[0];

/** Server identity reported in `initialize`. */
export const SERVER_INFO = { name: "caltodo", version: "1.0.0" } as const;

/** JSON-RPC error codes used by this server. */
export const ERROR_CODES = {
  parseError: -32700,
  invalidRequest: -32600,
  methodNotFound: -32601,
  invalidParams: -32602,
  internalError: -32603,
} as const;

/** An incoming JSON-RPC message. Requests have an id; notifications do not. */
export interface JsonRpcMessage {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
}

/** A JSON-RPC response returned to the client. */
export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string };
}

/**
 * Builds a JSON-RPC success response.
 *
 * @param id - Request id being answered
 * @param result - Result payload
 * @returns A well-formed JSON-RPC response
 */
export function success(id: string | number | null, result: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result };
}

/**
 * Builds a JSON-RPC error response.
 *
 * @param id - Request id being answered, or null when it could not be read
 * @param code - JSON-RPC error code, see {@link ERROR_CODES}
 * @param message - Human-readable error message
 * @returns A well-formed JSON-RPC error response
 */
export function failure(
  id: string | number | null,
  code: number,
  message: string
): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

/**
 * Picks the protocol version to answer `initialize` with.
 *
 * @param requested - Version string sent by the client, if any
 * @returns The requested version when supported, otherwise {@link DEFAULT_PROTOCOL_VERSION}
 */
export function negotiateProtocolVersion(requested: unknown): string {
  if (
    typeof requested === "string" &&
    (SUPPORTED_PROTOCOL_VERSIONS as readonly string[]).includes(requested)
  ) {
    return requested;
  }
  return DEFAULT_PROTOCOL_VERSION;
}

/**
 * Handles one JSON-RPC message.
 *
 * @param message - Parsed JSON-RPC request or notification
 * @param userId - caltodo user the request is authenticated as
 * @param scope - Access level of the key that authenticated the request.
 *                Required rather than defaulted: a permission that falls back
 *                to full access when a caller forgets it fails open.
 * @returns The response to send, or null for notifications (which get no response)
 * @remarks Unknown notifications are accepted silently, as the spec requires.
 *          Tool failures come back as successful results flagged `isError`, not
 *          JSON-RPC errors, so the calling model can read and recover from them.
 */
export async function handleMessage(
  message: JsonRpcMessage,
  userId: string,
  scope: McpScope
): Promise<JsonRpcResponse | null> {
  const id = message.id ?? null;
  const isNotification = message.id === undefined || message.id === null;
  const method = message.method;

  if (typeof method !== "string" || method.length === 0) {
    logger.warn("mcp.protocol: invalid request", {
      cause: "missing or non-string method",
      impact: "returned JSON-RPC invalidRequest",
    });
    return isNotification ? null : failure(id, ERROR_CODES.invalidRequest, "Missing method");
  }

  switch (method) {
    case "initialize": {
      const protocolVersion = negotiateProtocolVersion(message.params?.protocolVersion);
      logger.info("mcp.protocol: initialize", { userId, protocolVersion });
      return success(id, {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
      });
    }

    case "ping":
      return isNotification ? null : success(id, {});

    case "tools/list":
      // Filtered by scope so a read-only key is never offered a tool it would
      // be refused. `callTool` re-checks, since a client can call a tool it
      // was never advertised.
      return success(id, {
        tools: toolsForScope(scope, MCP_TOOLS).map(
          ({ name, title, description, inputSchema }) => ({
            name,
            title,
            description,
            inputSchema,
          })
        ),
      });

    case "tools/call": {
      const name = message.params?.name;
      if (typeof name !== "string") {
        logger.warn("mcp.protocol: tools/call missing name", {
          cause: "params.name absent or not a string",
          userId,
          impact: "returned JSON-RPC invalidParams",
        });
        return failure(id, ERROR_CODES.invalidParams, "tools/call requires a string 'name'");
      }

      const rawArgs = message.params?.arguments;
      const args =
        rawArgs && typeof rawArgs === "object" && !Array.isArray(rawArgs)
          ? (rawArgs as Record<string, unknown>)
          : {};

      const { text, isError } = await callTool(name, args, userId, scope);
      return success(id, { content: [{ type: "text", text }], isError });
    }

    default: {
      if (isNotification || method.startsWith("notifications/")) {
        logger.info("mcp.protocol: notification ignored", { method, userId });
        return null;
      }
      logger.warn("mcp.protocol: unknown method", {
        cause: `no handler for "${method}"`,
        userId,
        impact: "returned JSON-RPC methodNotFound",
      });
      return failure(id, ERROR_CODES.methodNotFound, `Unknown method "${method}"`);
    }
  }
}

/**
 * Handles a parsed request body, which may be a single message or a batch.
 *
 * @param body - Parsed JSON body from the client
 * @param userId - caltodo user the request is authenticated as
 * @param scope - Access level of the key that authenticated the request,
 *                applied to every message in a batch
 * @returns Responses to send; empty when the body held only notifications
 * @remarks An empty array or a non-object body yields a single invalidRequest error.
 */
export async function handleBody(
  body: unknown,
  userId: string,
  scope: McpScope
): Promise<JsonRpcResponse[]> {
  if (Array.isArray(body)) {
    if (body.length === 0) {
      return [failure(null, ERROR_CODES.invalidRequest, "Empty batch")];
    }
    const responses = await Promise.all(
      body.map((entry) => handleMessage((entry ?? {}) as JsonRpcMessage, userId, scope))
    );
    return responses.filter((r): r is JsonRpcResponse => r !== null);
  }

  if (!body || typeof body !== "object") {
    return [failure(null, ERROR_CODES.invalidRequest, "Request body must be a JSON object")];
  }

  const response = await handleMessage(body as JsonRpcMessage, userId, scope);
  return response ? [response] : [];
}
