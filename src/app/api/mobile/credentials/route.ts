import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/mobile/credentials
 * Returns integration connection status for the authenticated mobile user.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("integration_credentials")
    .select("canvas_token, canvas_ical_url, gradescope_email, google_access_token_encrypted, pensieve_calendar_url")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Failed to load credentials" }, { status: 500 });
  }

  return NextResponse.json({
    canvas_connected: !!(data?.canvas_token || data?.canvas_ical_url),
    gradescope_connected: !!data?.gradescope_email,
    // Connection is the presence of an OAuth token, not google_calendar_id
    // (which is only the calendar SELECTION, set later — a connected user who
    // hasn't picked a calendar yet was wrongly shown as disconnected).
    google_calendar_connected: !!data?.google_access_token_encrypted,
    pensieve_connected: !!data?.pensieve_calendar_url,
  });
}
