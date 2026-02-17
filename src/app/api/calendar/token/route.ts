/**
 * API route for managing the user's calendar feed token.
 * Cookie-authenticated (standard Supabase session).
 *
 * GET    — Returns the current calendar_token (or null).
 * POST   — Generates a new token (replaces any existing one).
 * DELETE — Sets the token to null (disables the feed).
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCalendarToken } from "@/lib/calendar-token";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/calendar/token
 * Returns the user's current calendar token, or null if not set.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`calendar-token:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { data, error } = await supabase
    .from("integration_credentials")
    .select("calendar_token")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    logger.error("GET /api/calendar/token failed", {
      userId: user.id,
      error: error.message,
      code: error.code,
    });
    return NextResponse.json(
      { error: "Failed to fetch calendar token" },
      { status: 500 }
    );
  }

  return NextResponse.json({ calendar_token: data?.calendar_token ?? null });
}

/**
 * POST /api/calendar/token
 * Generates a new calendar token via upsert. Replaces any existing token.
 * If no integration_credentials row exists, creates one.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`calendar-token:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const newToken = generateCalendarToken();

  // Check if user already has a credentials row
  const { data: existing, error: fetchError } = await supabase
    .from("integration_credentials")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    logger.error("POST /api/calendar/token — fetch check failed", {
      userId: user.id,
      error: fetchError.message,
      code: fetchError.code,
    });
    return NextResponse.json(
      { error: "Failed to check credentials" },
      { status: 500 }
    );
  }

  let dbError;

  if (existing) {
    // Row exists — update it
    const { error } = await supabase
      .from("integration_credentials")
      .update({ calendar_token: newToken })
      .eq("user_id", user.id);
    dbError = error;
  } else {
    // No row — insert one
    const { error } = await supabase
      .from("integration_credentials")
      .insert({ user_id: user.id, calendar_token: newToken });
    dbError = error;
  }

  if (dbError) {
    logger.error("POST /api/calendar/token failed", {
      userId: user.id,
      error: dbError.message,
      code: dbError.code,
      hint: dbError.hint,
    });
    return NextResponse.json(
      { error: "Failed to generate calendar token" },
      { status: 500 }
    );
  }

  logger.info("POST /api/calendar/token — token generated", { userId: user.id });

  return NextResponse.json({ calendar_token: newToken });
}

/**
 * DELETE /api/calendar/token
 * Clears the calendar token, disabling the feed.
 */
export async function DELETE() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`calendar-token:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { error } = await supabase
    .from("integration_credentials")
    .update({ calendar_token: null })
    .eq("user_id", user.id);

  if (error) {
    logger.error("DELETE /api/calendar/token failed", {
      userId: user.id,
      error: error.message,
      code: error.code,
    });
    return NextResponse.json(
      { error: "Failed to disable calendar feed" },
      { status: 500 }
    );
  }

  logger.info("DELETE /api/calendar/token — feed disabled", { userId: user.id });

  return NextResponse.json({ calendar_token: null });
}
