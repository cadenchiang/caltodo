/**
 * POST /api/push/test
 *
 * Sends a test push notification to every subscription the caller owns.
 * Useful for verifying end-to-end delivery from the Notifications settings
 * page. Removes any subscription the push service reports as gone (404/410).
 *
 * @returns 200 { delivered, dropped } | 401 | 404 if no subs.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPush } from "@/lib/push/web-push";
import { logger } from "@/lib/logger";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", user.id);

  if (!subs || subs.length === 0) {
    return NextResponse.json(
      { error: "No subscribed devices" },
      { status: 404 }
    );
  }

  let delivered = 0;
  let dropped = 0;
  for (const s of subs) {
    const r = await sendPush(
      { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
      {
        title: "caltodo",
        body: "Test notification.",
        url: "/app/today",
        tag: "test",
      }
    );
    if (r.ok) delivered++;
    else if (r.gone) {
      // RLS scopes to the caller — use the same user client; no admin needed.
      await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
      dropped++;
    }
  }

  logger.info("push/test: sent", { userId: user.id, delivered, dropped });
  return NextResponse.json({ delivered, dropped });
}
