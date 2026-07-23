import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client authenticated with the Bearer token from the request.
 *
 * @param req - The incoming request with Authorization: Bearer <token> header.
 * @returns Authenticated Supabase client, or null if no valid token.
 */
function getAuthClient(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
}

/**
 * GET /api/mobile/tasks
 * Fetches all non-dismissed tasks for the authenticated user.
 */
export async function GET(req: NextRequest) {
  const supabase = getAuthClient(req);
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .is("dismissed_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to load tasks" }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * POST /api/mobile/tasks
 * Creates a new task for the authenticated user.
 */
export async function POST(req: NextRequest) {
  const supabase = getAuthClient(req);
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Allowlist creatable fields — don't let the client set id/source/
  // external_id/is_submitted/timestamps on its own rows. user_id is forced
  // to the authenticated user.
  const ALLOWED = [
    "title", "description", "due_date", "due_time", "is_completed", "color",
    "repeat_interval", "repeat_unit", "repeat_end_date", "repeat_end_count",
    "completed_at", "tags", "snoozed_until", "sort_order", "course_name",
  ] as const;
  const insert: Record<string, unknown> = { user_id: user.id };
  for (const key of ALLOWED) {
    if (key in body) insert[key] = body[key];
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert(insert)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }

  return NextResponse.json(data);
}
