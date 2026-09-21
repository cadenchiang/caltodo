import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { authenticateMobile, applyCompletionInvariant } from "@/lib/mobile-task-helpers";
import { fetchAllTaskPages } from "@/lib/task-pages";

/**
 * GET /api/mobile/tasks
 * Fetches all non-dismissed tasks for the authenticated user.
 */
export async function GET(req: NextRequest) {
  const auth = await authenticateMobile(req, "GET /api/mobile/tasks");
  if ("response" in auth) return auth.response;
  const { supabase, user } = auth;

  // Paged past PostgREST's silent 1000-row cap, id as the tiebreaker.
  const { data, error } = await fetchAllTaskPages(
    (from, to) =>
      supabase
        .from("tasks")
        .select("*")
        .is("dismissed_at", null)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, to),
    "GET /api/mobile/tasks",
    user.id,
  );

  if (error) {
    logger.error("GET /api/mobile/tasks: query failed", {
      userId: user.id,
      error: error.message,
      impact: "client shows an error instead of its task list",
    });
    return NextResponse.json({ error: "Failed to load tasks" }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * POST /api/mobile/tasks
 * Creates a new task for the authenticated user.
 */
export async function POST(req: NextRequest) {
  const auth = await authenticateMobile(req, "POST /api/mobile/tasks");
  if ("response" in auth) return auth.response;
  const { supabase, user } = auth;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Allowlist creatable fields: don't let the client set id/source/
  // external_id/is_submitted/timestamps on its own rows. user_id is forced
  // to the authenticated user.
  const ALLOWED = [
    "title", "description", "due_date", "due_time", "is_completed", "color",
    "repeat_interval", "repeat_unit", "repeat_end_date", "repeat_end_count",
    "completed_at", "tags", "snoozed_until", "sort_order", "course_name",
  ] as const;
  const fields: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (key in body) fields[key] = body[key];
  }
  // A task created already complete gets its completed_at the same way a
  // PATCH does, so the archive purge can see it.
  const insert = { ...applyCompletionInvariant(fields), user_id: user.id };

  const { data, error } = await supabase
    .from("tasks")
    .insert(insert)
    .select()
    .single();

  if (error) {
    logger.error("POST /api/mobile/tasks: insert failed", {
      userId: user.id,
      error: error.message,
      impact: "task not created; client shows an error",
    });
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }

  return NextResponse.json(data);
}
