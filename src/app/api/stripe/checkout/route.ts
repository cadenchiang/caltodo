import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe, STRIPE_PRICES } from "@/lib/stripe";
import { getEntitlement } from "@/lib/entitlements";
import { logger } from "@/lib/logger";

/**
 * Creates a Stripe Checkout session and redirects the user to it.
 *
 * Body: { interval: 'month' | 'year' }
 * Returns: { url } — the user-agent should redirect to this URL.
 *
 * Flow:
 *   1. Require a logged-in user.
 *   2. If they already have an active paid Pro sub, redirect to portal instead.
 *   3. Look up (or create) a Stripe customer id, persist it on the row.
 *   4. Create a Checkout session with the chosen price.
 *   5. Return the session URL.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as { interval?: string };
    const interval = body.interval === "month" ? "month" : "year";
    const priceId = interval === "month" ? STRIPE_PRICES.proMonthly() : STRIPE_PRICES.proAnnual();

    const entitlement = await getEntitlement(user.id);

    // Already paid Pro? Send them to the portal instead of double-charging.
    if (
      entitlement.effectivePlan === "pro" &&
      entitlement.stripeSubscriptionId &&
      !entitlement.cancelAtPeriodEnd
    ) {
      return NextResponse.json({ alreadyPro: true });
    }

    // Reuse the existing Stripe customer when we have one (e.g. previously
    // paid, then canceled and now coming back). Otherwise create a new one.
    const admin = createAdminClient();
    let customerId = entitlement.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe().customers.create({
        email: user.email ?? undefined,
        name: (user.user_metadata?.full_name as string | undefined) ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      // Upsert the row so the customer id is persisted before the webhook fires.
      await admin
        .from("subscriptions")
        .upsert(
          { user_id: user.id, stripe_customer_id: customerId },
          { onConflict: "user_id" },
        );
    }

    const origin = req.headers.get("origin") ?? "https://caltodo.me";

    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      // We grandfathered existing users and gave new signups a 30-day in-app
      // trial; Stripe does NOT add its own trial on top, so the charge happens
      // immediately on checkout completion. Use subscription_data.trial_period_days
      // here later if you want a Stripe-managed trial.
      success_url: `${origin}/app/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      allow_promotion_codes: true,
      client_reference_id: user.id,
      metadata: { supabase_user_id: user.id, interval },
      subscription_data: {
        metadata: { supabase_user_id: user.id, interval },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    logger.error("stripe_checkout_failed", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
