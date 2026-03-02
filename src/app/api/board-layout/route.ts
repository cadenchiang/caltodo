/**
 * API route for reading and saving the user's board layout.
 * GET: Returns the persisted layout JSONB (or null for new users).
 * PUT: Upserts the full layout object.
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

  const { allowed } = rateLimit(`board-layout:${user.id}`, 30, 60_000);
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
export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`board-layout:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Request body must be a JSON object" }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from("board_layouts")
      .upsert(
        {
          user_id: user.id,
          layout: body,
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
