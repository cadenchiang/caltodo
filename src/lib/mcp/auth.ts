/**
 * API key authentication for the Poke MCP endpoint.
 *
 * Poke sends the integration's API key as `Authorization: Bearer <key>` on
 * every request. The key is a shared secret configured in the environment and
 * maps to exactly one caltodo user id, since the MCP endpoint has no session.
 *
 * @module mcp/auth
 */

import { timingSafeEqual } from "node:crypto";
import { logger } from "@/lib/logger";

/** Successful authentication: the caltodo user the request acts as. */
export interface McpAuthSuccess {
  ok: true;
  userId: string;
}

/** Failed authentication: HTTP status and a message safe to return to Poke. */
export interface McpAuthFailure {
  ok: false;
  status: 401 | 500;
  message: string;
}

export type McpAuthResult = McpAuthSuccess | McpAuthFailure;

/** Minimum length for the configured API key, to reject obviously weak secrets. */
const MIN_KEY_LENGTH = 24;

/**
 * Compares two strings without leaking length or content through timing.
 *
 * @param a - First string
 * @param b - Second string
 * @returns True when the strings are byte-identical
 * @remarks Different-length inputs return false without a timing-safe compare,
 *          which only leaks the length of the supplied key, not its content.
 */
function safeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Extracts the bearer token from an Authorization header value.
 *
 * @param header - Raw Authorization header value, or null when absent
 * @returns The token, or null when the header is missing or not a bearer token
 * @remarks The scheme is matched case-insensitively; surrounding whitespace is trimmed.
 */
export function extractBearerToken(header: string | null): string | null {
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match) return null;
  const token = match[1].trim();
  return token.length > 0 ? token : null;
}

/**
 * Authenticates an incoming MCP request against the configured Poke API key.
 *
 * @param headers - Request headers (reads `authorization` and `x-poke-user-id`)
 * @param env - Environment source, defaults to `process.env` (injectable for tests)
 * @returns Success with the mapped caltodo user id, or a failure with an HTTP status
 * @remarks Returns 500 when the server is misconfigured (missing or too-short
 *          POKE_MCP_API_KEY, or missing POKE_MCP_USER_ID) so a misconfiguration is
 *          never silently treated as an auth failure. Returns 401 for a missing or
 *          wrong key. Never logs the supplied or expected key.
 */
export function authenticateMcpRequest(
  headers: Headers,
  env: NodeJS.ProcessEnv = process.env
): McpAuthResult {
  const expectedKey = env.POKE_MCP_API_KEY;
  const userId = env.POKE_MCP_USER_ID;

  if (!expectedKey || expectedKey.length < MIN_KEY_LENGTH) {
    logger.error("mcp.auth: misconfigured API key", {
      cause: expectedKey ? "POKE_MCP_API_KEY shorter than minimum" : "POKE_MCP_API_KEY not set",
      minLength: MIN_KEY_LENGTH,
      impact: "MCP endpoint rejects all requests",
    });
    return { ok: false, status: 500, message: "MCP server is not configured" };
  }

  if (!userId) {
    logger.error("mcp.auth: misconfigured user mapping", {
      cause: "POKE_MCP_USER_ID not set",
      impact: "MCP endpoint cannot resolve which caltodo account to read",
    });
    return { ok: false, status: 500, message: "MCP server is not configured" };
  }

  const supplied = extractBearerToken(headers.get("authorization"));
  if (!supplied) {
    logger.warn("mcp.auth: rejected request", {
      cause: "missing or malformed Authorization header",
      pokeUserId: headers.get("x-poke-user-id"),
      impact: "request denied with 401",
    });
    return { ok: false, status: 401, message: "Missing Authorization: Bearer <api key>" };
  }

  if (!safeEquals(supplied, expectedKey)) {
    logger.warn("mcp.auth: rejected request", {
      cause: "API key mismatch",
      pokeUserId: headers.get("x-poke-user-id"),
      impact: "request denied with 401",
    });
    return { ok: false, status: 401, message: "Invalid API key" };
  }

  return { ok: true, userId };
}
