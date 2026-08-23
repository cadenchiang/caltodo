/**
 * MCP endpoint for Poke (Streamable HTTP transport).
 *
 * Accepts JSON-RPC over POST at /api/mcp (and any subpath, e.g. /api/mcp/sse,
 * so a client configured with either URL style works). Authentication is a
 * static API key sent as `Authorization: Bearer <key>`; see mcp/auth.
 */

import { NextRequest, NextResponse } from "next/server";
import { authenticateMcpRequest } from "@/lib/mcp/auth";
import { handleBody, ERROR_CODES, failure } from "@/lib/mcp/protocol";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

/** Node runtime: the auth compare and the Gradescope scraper need Node APIs. */
export const runtime = "nodejs";

/** Never cached — every call reflects live assignment data. */
export const dynamic = "force-dynamic";

/** Max MCP calls per minute per user, protecting Canvas/Gradescope from bursts. */
const RATE_LIMIT_PER_MINUTE = 60;

/**
 * Handles a JSON-RPC MCP request from Poke.
 *
 * @param request - POST request carrying a single JSON-RPC message or a batch
 * @returns JSON-RPC response(s) as JSON, 202 when the body held only notifications,
 *          401 on a missing or unknown API key, 429 when rate limited
 * @remarks Errors inside a tool are returned as JSON-RPC results flagged
 *          `isError`, not HTTP errors, so Poke surfaces them to the model.
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateMcpRequest(request.headers);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { allowed } = rateLimit(`mcp:${auth.userId}`, RATE_LIMIT_PER_MINUTE, 60_000);
  if (!allowed) {
    logger.warn("mcp.route: rate limited", {
      cause: `more than ${RATE_LIMIT_PER_MINUTE} MCP calls in one minute`,
      userId: auth.userId,
      impact: "request denied with 429",
    });
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn("mcp.route: unparseable body", {
      cause: message,
      userId: auth.userId,
      impact: "returned JSON-RPC parseError",
    });
    return NextResponse.json(failure(null, ERROR_CODES.parseError, "Invalid JSON"), {
      status: 400,
    });
  }

  try {
    const responses = await handleBody(body, auth.userId);

    // Notification-only bodies get an empty 202, as the MCP spec requires.
    if (responses.length === 0) {
      return new NextResponse(null, { status: 202 });
    }

    return NextResponse.json(responses.length === 1 ? responses[0] : responses);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("mcp.route: unhandled failure", {
      cause: message,
      userId: auth.userId,
      impact: "returned JSON-RPC internalError to Poke",
    });
    return NextResponse.json(
      failure(null, ERROR_CODES.internalError, "Internal server error"),
      { status: 500 }
    );
  }
}

/**
 * Rejects GET, which this stateless server does not support.
 *
 * @returns 405 with an Allow header naming POST
 * @remarks The legacy HTTP+SSE transport opens a GET stream; this server speaks
 *          only Streamable HTTP, where every exchange is a POST.
 */
export async function GET() {
  return NextResponse.json(
    { error: "This MCP server uses Streamable HTTP. Send JSON-RPC over POST." },
    { status: 405, headers: { Allow: "POST" } }
  );
}

/**
 * Rejects DELETE, which would terminate a session this server never creates.
 *
 * @returns 405 with an Allow header naming POST
 */
export async function DELETE() {
  return NextResponse.json(
    { error: "This MCP server is stateless; there is no session to delete." },
    { status: 405, headers: { Allow: "POST" } }
  );
}
