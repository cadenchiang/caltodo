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
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/**
 * The "template owner" — when a caller has no saved board of their own,
 * we serve this user's saved board as the default for new accounts.
 * Whatever this user edits becomes the layout that everyone signing up
 * fresh sees on their first visit. Configurable via env so production
 * and local dev can point at different template owners; falls back to
 * Caden's local dev UUID if unset.
 */
const TEMPLATE_USER_ID =
  process.env.BOARD_TEMPLATE_USER_ID ?? "f6fe5372-9a08-489d-bb0a-d29c4512c04f";

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

    // Caller has their own row — serve it as-is.
    if (data) {
      return NextResponse.json({ layout: data.layout, updatedAt: data.updated_at });
    }

    // No row of their own: fall back to the template owner's layout so
    // first-time accounts inherit the curated default instead of an
    // empty board. The template owner editing their own board (which
    // they DO have a row for) implicitly updates this default for every
    // future new account. Use the admin client so we can read across
    // users without breaking RLS for the regular path.
    if (user.id !== TEMPLATE_USER_ID) {
      const admin = createAdminClient();
      const { data: template, error: templateError } = await admin
        .from("board_layouts")
        .select("layout, updated_at")
        .eq("user_id", TEMPLATE_USER_ID)
        .single();

      if (templateError && templateError.code !== "PGRST116") {
        logger.error("GET /api/board-layout: template fetch failed", {
          userId: user.id,
          error: templateError.message,
        });
        // Fall through to empty default rather than 500 — a missing
        // template should never block users from seeing the home page.
      } else if (template) {
        logger.info("GET /api/board-layout: served template default", { userId: user.id });
        return NextResponse.json({ layout: template.layout, updatedAt: template.updated_at });
      }
    }

    // No row + no template (or caller IS the template owner with no row yet).
    return NextResponse.json({ layout: null, updatedAt: null });
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

/**
 * DELETE /api/board-layout
 * Removes the caller's board layout row. The next GET returns null so
 * the client falls back to the empty default layout — equivalent to
 * "reset my board". Used when a user wants to wipe their personal
 * customizations and start from the shared default.
 */
export async function DELETE() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`board-layout:delete:${user.id}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { error } = await supabase
      .from("board_layouts")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      logger.error("DELETE /api/board-layout failed", { userId: user.id, error: error.message });
      return NextResponse.json({ error: "Failed to delete board layout" }, { status: 500 });
    }

    logger.info("DELETE /api/board-layout success", { userId: user.id });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("DELETE /api/board-layout unexpected error", { userId: user.id, error: message });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
