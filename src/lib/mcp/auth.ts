/**
 * API key authentication for the MCP endpoint.
 *
 * Clients send their key as `Authorization: Bearer <key>` on every request.
 * Keys are per-user, generated in Settings and stored hashed, so any user can
 * connect their own integration; the key identifies which account the request
 * acts as.
 *
 * @module mcp/auth
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { findKeyOwner, touchApiKey } from "@/lib/mcp/api-keys";
import { logger } from "@/lib/logger";
import type { McpScope } from "@/lib/mcp/scopes";

/** Successful authentication: the caltodo user the request acts as. */
export interface McpAuthSuccess {
  ok: true;
  userId: string;
  keyId: string;
  /** What the presented key is allowed to do. Enforced per tool call. */
  scope: McpScope;
}

/** Failed authentication: HTTP status and a message safe to return. */
export interface McpAuthFailure {
  ok: false;
  status: 401;
  message: string;
}

export type McpAuthResult = McpAuthSuccess | McpAuthFailure;

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
 * Authenticates an incoming MCP request against the stored API keys.
 *
 * @param headers - Request headers (reads `authorization` and `x-poke-user-id`)
 * @param client - Supabase client able to read every key, defaults to a
 *                 service-role admin client (injectable for tests)
 * @returns Success with the owning user, key id and key scope, or a 401 failure
 * @remarks Uses the service role because MCP requests carry no user session.
 *          Never logs the presented key. The key's `last_used_at` is stamped
 *          in the background so the settings UI can show whether the
 *          integration has ever connected; that write never blocks or fails
 *          the request.
 */
export async function authenticateMcpRequest(
  headers: Headers,
  client: SupabaseClient = createAdminClient()
): Promise<McpAuthResult> {
  const supplied = extractBearerToken(headers.get("authorization"));
  if (!supplied) {
    logger.warn("mcp.auth: rejected request", {
      cause: "missing or malformed Authorization header",
      pokeUserId: headers.get("x-poke-user-id"),
      impact: "request denied with 401",
    });
    return { ok: false, status: 401, message: "Missing Authorization: Bearer <api key>" };
  }

  const owner = await findKeyOwner(client, supplied);
  if (!owner) {
    logger.warn("mcp.auth: rejected request", {
      cause: "no stored key matches the presented one",
      pokeUserId: headers.get("x-poke-user-id"),
      impact: "request denied with 401",
    });
    return {
      ok: false,
      status: 401,
      message: "Invalid API key. Generate one in caltodo Settings → Integrations.",
    };
  }

  // Bookkeeping only — deliberately not awaited so it cannot delay or fail the call.
  void touchApiKey(client, owner.keyId);

  return { ok: true, userId: owner.userId, keyId: owner.keyId, scope: owner.scope };
}
