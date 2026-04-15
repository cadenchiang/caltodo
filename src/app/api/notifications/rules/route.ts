/**
 * GET  /api/notifications/rules — list the user's notification rules.
 * POST /api/notifications/rules — create a new rule.
 *
 * Auth via createClient(); RLS enforces ownership.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import type { CreateRuleInput, NotificationRule } from "@/lib/notifications/types";

/** Maximum rules per user — keeps the cron query cheap. */
const MAX_RULES_PER_USER = 20;

/** Returns the caller's notification rules, ordered by creation time. */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("notification_rules")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    logger.error("notifications/rules: list failed", { userId: user.id, error: error.message });
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }
  return NextResponse.json({ rules: (data ?? []) as NotificationRule[] });
}

/**
 * Creates a new notification rule. Validates the union: before_deadline
 * requires minutes_before > 0; daily_digest requires HH:MM time_of_day.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: CreateRuleInput;
  try {
    body = (await request.json()) as CreateRuleInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validation = validateInput(body);
  if (validation) return NextResponse.json({ error: validation }, { status: 400 });

  const { count } = await supabase
    .from("notification_rules")
    .select("id", { count: "exact", head: true });
  if ((count ?? 0) >= MAX_RULES_PER_USER) {
    return NextResponse.json(
      { error: `Limit of ${MAX_RULES_PER_USER} rules reached` },
      { status: 400 }
    );
  }

  const insert = {
    user_id: user.id,
    kind: body.kind,
    minutes_before: body.kind === "before_deadline" ? body.minutes_before : null,
    time_of_day: body.kind === "daily_digest" ? body.time_of_day : null,
    timezone: body.timezone || "UTC",
  };
  const { data, error } = await supabase
    .from("notification_rules")
    .insert(insert)
    .select("*")
    .single();

  if (error) {
    // Unique-index violation (from the init-load race guard) → return the
    // existing rule instead of surfacing an error to the client.
    if (error.code === "23505") {
      const { data: existing } = await supabase
        .from("notification_rules")
        .select("*")
        .eq("user_id", user.id)
        .eq("kind", body.kind)
        .eq("minutes_before", insert.minutes_before ?? null)
        .eq("time_of_day", insert.time_of_day ?? null)
        .maybeSingle();
      if (existing) {
        return NextResponse.json({ rule: existing as NotificationRule });
      }
    }
    logger.error("notifications/rules: insert failed", { userId: user.id, error: error.message });
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }
  return NextResponse.json({ rule: data as NotificationRule });
}

/**
 * Validates a CreateRuleInput. Returns an error message string or null
 * if the input is well-formed.
 */
function validateInput(body: CreateRuleInput): string | null {
  if (body.kind === "before_deadline") {
    if (typeof body.minutes_before !== "number" || body.minutes_before <= 0) {
      return "minutes_before must be a positive number";
    }
    if (body.minutes_before > 60 * 24 * 30) return "minutes_before too large";
    return null;
  }
  if (body.kind === "daily_digest") {
    if (!body.time_of_day || !/^[0-2]\d:[0-5]\d$/.test(body.time_of_day)) {
      return "time_of_day must be HH:MM";
    }
    return null;
  }
  return "Invalid kind";
}
