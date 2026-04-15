/**
 * PATCH  /api/notifications/rules/[id] — toggle enabled.
 * DELETE /api/notifications/rules/[id] — remove a rule.
 *
 * Auth via createClient(); RLS scopes to caller. Body for PATCH:
 *   { enabled: boolean }
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Toggles the `enabled` flag on a single rule. */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { enabled?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "enabled must be boolean" }, { status: 400 });
  }

  const { error } = await supabase
    .from("notification_rules")
    .update({ enabled: body.enabled })
    .eq("id", id);

  if (error) {
    logger.error("notifications/rules: patch failed", { userId: user.id, id, error: error.message });
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

/** Permanently removes a rule. RLS prevents cross-user deletes. */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("notification_rules")
    .delete()
    .eq("id", id);

  if (error) {
    logger.error("notifications/rules: delete failed", { userId: user.id, id, error: error.message });
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
