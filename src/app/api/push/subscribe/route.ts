/**
 * POST   /api/push/subscribe — store a Web Push subscription for the user.
 * DELETE /api/push/subscribe — remove a subscription by endpoint.
 *
 * Auth: standard cookie-based or Bearer token via createClient().
 * Storage: public.push_subscriptions (UNIQUE on endpoint, RLS by user_id).
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { isAllowedCanvasUrl } from "@/lib/canvas-url-validation";

interface SubscribeBody {
  subscription?: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  userAgent?: string;
}

/**
 * Stores the user's push subscription. Idempotent: re-subscribing from the
 * same browser updates last_used_at instead of inserting a duplicate.
 *
 * @returns 200 { ok: true } on success, 400/401/500 on errors.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SubscribeBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sub = body.subscription;
  const endpoint = sub?.endpoint;
  const p256dh = sub?.keys?.p256dh;
  const auth = sub?.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json(
      { error: "Missing subscription fields" },
      { status: 400 }
    );
  }

  // SSRF guard: the reminder cron POSTs to this endpoint server-side. Reuse the
  // canonical validator (HTTPS-only + rejects every IP-literal encoding —
  // dotted, decimal, hex, octal, IPv6 — plus private/metadata ranges) rather
  // than a hand-rolled check that a bare-decimal host like 2130706433 slips
  // past. Real push endpoints are public HTTPS DNS names (FCM/Mozilla/etc).
  if (!isAllowedCanvasUrl(endpoint)) {
    return NextResponse.json({ error: "Invalid push endpoint" }, { status: 400 });
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: user.id,
        endpoint,
        p256dh,
        auth,
        user_agent: body.userAgent ?? null,
        last_used_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" }
    );

  if (error) {
    logger.error("push/subscribe: upsert failed", {
      userId: user.id,
      error: error.message,
    });
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  logger.info("push/subscribe: subscribed", { userId: user.id });
  return NextResponse.json({ ok: true });
}

/**
 * Removes a subscription by endpoint for the authenticated user.
 *
 * @returns 200 { ok: true } even if no row matched (idempotent).
 */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { endpoint?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.endpoint) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", body.endpoint);

  if (error) {
    logger.error("push/subscribe: delete failed", {
      userId: user.id,
      error: error.message,
    });
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
