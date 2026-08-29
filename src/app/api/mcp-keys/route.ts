/**
 * API route for managing the signed-in user's MCP API keys.
 * Cookie-authenticated (standard Supabase session), so RLS scopes every
 * statement to the caller.
 *
 * Lives at /api/mcp-keys rather than under /api/mcp so it cannot be confused
 * with the MCP endpoint's catch-all route.
 *
 * GET    — Lists the user's keys (metadata only, never the secret).
 * POST   — Creates a key and returns its plaintext exactly once.
 * DELETE — Revokes a key by id, passed as ?id=<uuid>.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createApiKey, listApiKeys, revokeApiKey, renameApiKey } from "@/lib/mcp/api-keys";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/** Requests per minute per user across all methods on this route. */
const RATE_LIMIT_PER_MINUTE = 30;

/**
 * Resolves the signed-in user and applies the rate limit.
 *
 * @returns The user id, or a response to return immediately
 */
async function requireUser(): Promise<
  { userId: string; supabase: Awaited<ReturnType<typeof createClient>> } | NextResponse
> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`mcp-keys:${user.id}`, RATE_LIMIT_PER_MINUTE, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  return { userId: user.id, supabase };
}

/**
 * GET /api/mcp-keys
 * Lists the user's MCP keys. Secrets are never returned.
 */
export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const keys = await listApiKeys(auth.supabase, auth.userId);
    return NextResponse.json({ keys });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("GET /api/mcp-keys failed", {
      cause: message,
      userId: auth.userId,
      impact: "settings could not list the user's MCP keys",
    });
    return NextResponse.json({ error: "Failed to load API keys" }, { status: 500 });
  }
}

/**
 * POST /api/mcp-keys
 * Creates a key. The plaintext is in the response and is never retrievable again.
 * Accepts an optional { label } in the body.
 */
export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  let label = "Poke";
  let expiresInDays: number | null = null;
  try {
    const body = await request.json();
    if (typeof body?.label === "string") label = body.label;
    // Anything but a positive number means "never expires".
    if (typeof body?.expiresInDays === "number" && body.expiresInDays > 0) {
      expiresInDays = Math.floor(body.expiresInDays);
    }
  } catch {
    // No body is fine — the defaults apply.
  }

  try {
    const { key, record } = await createApiKey(auth.supabase, auth.userId, label, expiresInDays);
    return NextResponse.json({ key, record }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("POST /api/mcp-keys failed", {
      cause: message,
      userId: auth.userId,
      impact: "user could not generate an MCP key",
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/mcp-keys
 * Body: { id, label }. Renames a key; nothing else about a key is editable.
 */
export async function PATCH(request: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : null;
  const label = typeof body.label === "string" ? body.label : null;
  if (!id || label === null) {
    return NextResponse.json({ error: "Missing key id or label" }, { status: 400 });
  }

  try {
    const record = await renameApiKey(auth.supabase, auth.userId, id, label);
    return NextResponse.json({ record });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn("PATCH /api/mcp-keys failed", {
      cause: message,
      userId: auth.userId,
      keyId: id,
      impact: "key was not renamed",
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * DELETE /api/mcp-keys?id=<uuid>
 * Revokes one key. Any client using it stops working immediately.
 */
export async function DELETE(request: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing key id" }, { status: 400 });
  }

  try {
    await revokeApiKey(auth.supabase, auth.userId, id);
    return NextResponse.json({ revoked: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn("DELETE /api/mcp-keys failed", {
      cause: message,
      userId: auth.userId,
      keyId: id,
      impact: "key was not revoked",
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
