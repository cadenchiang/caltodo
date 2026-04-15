/**
 * API route for reading and saving the user's board layout.
 * GET: Returns the persisted layout JSONB (or null for new users).
 * PUT/POST: Upserts the full layout object. POST is used by sendBeacon
 * for reliable saves during page unload (sendBeacon only supports POST).
 *
 * @module api/board-layout
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/board-layout
 * Returns the user's board layout from the board_layouts table.
 *
 * @returns JSON with `layout` (object | null) and `updatedAt` (ISO string | null)
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`board-layout:get:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { data, error } = await supabase
      .from("board_layouts")
      .select("layout, updated_at")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      logger.error("GET /api/board-layout failed", { userId: user.id, error: error.message });
      return NextResponse.json({ error: "Failed to fetch board layout" }, { status: 500 });
    }

    // PGRST116 = no rows found — return null for new users
    if (!data) {
      return NextResponse.json({ layout: null, updatedAt: null });
    }

    return NextResponse.json({ layout: data.layout, updatedAt: data.updated_at });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("GET /api/board-layout unexpected error", { userId: user.id, error: message });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/board-layout
 * Upserts the user's board layout. Accepts the full PersistedLayout object in the body.
 *
 * @param request - Request with JSON body containing the layout object
 * @returns JSON with `success: true` on success
 */
/**
 * Shared upsert handler for PUT and POST (sendBeacon uses POST).
 *
 * @param request - Request with JSON body containing the layout object
 * @returns JSON response with success or error
 */
async function upsertLayout(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`board-layout:put:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be a JSON object" }, { status: 400 });
  }

  // Minimal shape check — reject obvious junk before it reaches JSONB.
  // We don't validate every field because the PersistedLayout shape evolves;
  // the client is authoritative for its own layout. But the server should
  // refuse absurd payloads that would inflate the DB row.
  const layout = body as Record<string, unknown>;
  const MAX_LAYOUT_BYTES = 512 * 1024; // 512 KB — roomy for widget configs, fails closed on abuse
  const serialized = JSON.stringify(layout);
  if (serialized.length > MAX_LAYOUT_BYTES) {
    logger.warn("PUT /api/board-layout rejected: payload too large", {
      userId: user.id,
      size: serialized.length,
    });
    return NextResponse.json({ error: "Layout payload too large" }, { status: 413 });
  }
  if (!Array.isArray(layout.widgets) || typeof layout.layouts !== "object" || layout.layouts === null) {
    return NextResponse.json({ error: "Layout must contain widgets[] and layouts{}" }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from("board_layouts")
      .upsert(
        {
          user_id: user.id,
          layout: layout,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      logger.error("PUT /api/board-layout failed", { userId: user.id, error: error.message });
      return NextResponse.json({ error: "Failed to save board layout" }, { status: 500 });
    }

    logger.info("PUT /api/board-layout success", { userId: user.id });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("PUT /api/board-layout unexpected error", { userId: user.id, error: message });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return upsertLayout(request);
}

/**
 * POST /api/board-layout
 * Alias for PUT — used by navigator.sendBeacon during page unload,
 * which only supports POST requests.
 */
export async function POST(request: Request) {
  return upsertLayout(request);
}
