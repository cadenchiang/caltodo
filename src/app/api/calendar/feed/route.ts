/**
 * GET /api/calendar/feed?token=<calendar_token>
 *
 * Public iCal feed endpoint for calendar subscription (e.g., Google Calendar).
 * Authenticates via a per-user calendar token (no cookies needed).
 * Uses the admin Supabase client to bypass RLS.
 *
 * Returns a text/calendar response with all tasks that have due dates.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateICalFeed } from "@/lib/ical";
import { logger } from "@/lib/logger";
import type { Task } from "@/lib/types";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    logger.warn("GET /api/calendar/feed — missing token param");
    return NextResponse.json({ error: "Missing token parameter" }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    logger.error("GET /api/calendar/feed — admin client creation failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  // Look up user by calendar token
  const { data: credential, error: credError } = await admin
    .from("integration_credentials")
    .select("user_id")
    .eq("calendar_token", token)
    .single();

  if (credError || !credential) {
    logger.warn("GET /api/calendar/feed — invalid token", {
      errorCode: credError?.code,
    });
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const userId = credential.user_id;

  // Fetch all tasks with due dates for this user
  const { data: tasks, error: tasksError } = await admin
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .not("due_date", "is", null)
    .order("due_date", { ascending: true });

  if (tasksError) {
    logger.error("GET /api/calendar/feed — failed to fetch tasks", {
      userId,
      error: tasksError.message,
    });
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }

  const ical = generateICalFeed((tasks as Task[]) || []);

  logger.info("GET /api/calendar/feed — success", {
    userId,
    taskCount: tasks?.length ?? 0,
  });

  return new Response(ical, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="caltodo.ics"',
      // Allow Vercel CDN to cache for 60s, but clients always revalidate.
      // This ensures fresh data on subscription while reducing origin load.
      "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
      "CDN-Cache-Control": "public, s-maxage=60",
    },
  });
}
