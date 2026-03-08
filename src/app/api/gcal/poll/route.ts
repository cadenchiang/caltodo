/**
 * GET /api/gcal/poll
 *
 * Lightweight endpoint for client-side polling.
 * Returns the gcal_events_updated_at timestamp so the SWR hook
 * can detect when events have changed (via webhook) and trigger a refetch.
 *
 * @returns { updatedAt: string | null }
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ updatedAt: null });
  }

  const { data } = await supabase
    .from("integration_credentials")
    .select("gcal_events_updated_at")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({
    updatedAt: data?.gcal_events_updated_at ?? null,
  });
}
