import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

/**
 * Dev-only Pro grant. Hard-gated to NODE_ENV=development so it can never
 * promote a user in production — even if someone accidentally hits the URL.
 *
 * Body: { revoke?: boolean } — when true, drops the user back to free.
 *
 * Flow:
 *   1. Refuse outside development.
 *   2. Require a logged-in user.
 *   3. Upsert the subscriptions row with plan='pro', status='active',
 *      a 30-day period end, and a synthetic stripe customer id so the
 *      portal route doesn't try to call the real Stripe API.
 *
 * The "dev:" prefix on stripe_customer_id is what blocks the portal route
 * from being reached: portal/route.ts calls Stripe with that id, which
 * would fail. Settings UI hides the portal button when the prefix is set.
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "not_available" }, { status: 404 });
  }

  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as {
      revoke?: boolean;
      interval?: string;
    };

    const admin = createAdminClient();

    if (body.revoke) {
      await admin
        .from("subscriptions")
        .upsert(
          {
            user_id: user.id,
            plan: "free",
            status: "active",
            current_period_end: null,
            cancel_at_period_end: false,
            stripe_customer_id: null,
            stripe_subscription_id: null,
            billing_interval: null,
          },
          { onConflict: "user_id" },
        );

      logger.info("dev_grant_pro_revoked", { userId: user.id });
      return NextResponse.json({ ok: true, plan: "free" });
    }

    const interval = body.interval === "month" ? "month" : "year";
    const days = interval === "month" ? 30 : 365;
    const periodEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    await admin
      .from("subscriptions")
      .upsert(
        {
          user_id: user.id,
          plan: "pro",
          status: "active",
          current_period_end: periodEnd,
          cancel_at_period_end: false,
          stripe_customer_id: `dev:${user.id}`,
          stripe_subscription_id: `dev:sub:${user.id}`,
          billing_interval: interval,
        },
        { onConflict: "user_id" },
      );

    logger.info("dev_grant_pro_granted", { userId: user.id, interval });
    return NextResponse.json({ ok: true, plan: "pro", interval, currentPeriodEnd: periodEnd });
  } catch (err) {
    logger.error("dev_grant_pro_failed", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      {
        error: "grant_failed",
        message: err instanceof Error ? err.message : "Unexpected error.",
      },
      { status: 500 },
    );
  }
}
