import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  stripe,
  STRIPE_PRICES,
  isStripeConfigured,
  StripeNotConfiguredError,
} from "@/lib/stripe";
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
    // Validate explicitly instead of silently defaulting garbage to the pricier
    // annual plan.
    if (body.interval !== "month" && body.interval !== "year") {
      return NextResponse.json({ error: "interval must be 'month' or 'year'" }, { status: 400 });
    }
    const interval = body.interval;

    // Surface "Stripe not configured" before doing any work so the client can
    // route to the dev-grant flow on localhost (or show a clear setup hint
    // in production rather than the generic "something went wrong" alert).
    if (!isStripeConfigured()) {
      const devGrantAvailable = process.env.NODE_ENV === "development";
      logger.warn("stripe_checkout_not_configured", {
        userId: user.id,
        devGrantAvailable,
      });
      return NextResponse.json(
        {
          error: "stripe_not_configured",
          message: devGrantAvailable
            ? "Stripe keys are missing. Use the dev grant on localhost or set STRIPE_* env vars."
            : "Subscriptions are not configured. Please contact support.",
          devGrantAvailable,
        },
        { status: 503 },
      );
    }

    const priceId = interval === "month" ? STRIPE_PRICES.proMonthly() : STRIPE_PRICES.proAnnual();

    const entitlement = await getEntitlement(user.id);

    // Already Pro without a Stripe subscription = a founder / comped account —
    // never send them through checkout (would charge for lifetime-free access).
    if (entitlement.effectivePlan === "pro" && !entitlement.stripeSubscriptionId) {
      return NextResponse.json({ alreadyPro: true });
    }
    // Has an active Stripe subscription (even one set to cancel at period end)?
    // Route to the billing portal to manage/reactivate — a new checkout session
    // would create a SECOND concurrent subscription and double-charge.
    if (entitlement.effectivePlan === "pro" && entitlement.stripeSubscriptionId) {
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
    // A missing env var caught downstream (e.g. STRIPE_PRO_MONTHLY_PRICE_ID
    // was unset even though SECRET_KEY existed) — surface a configuration
    // error to the client so it can route to the dev grant on localhost.
    if (err instanceof StripeNotConfiguredError) {
      const devGrantAvailable = process.env.NODE_ENV === "development";
      logger.warn("stripe_checkout_missing_env", { envVar: err.envVar });
      return NextResponse.json(
        {
          error: "stripe_not_configured",
          message: `${err.envVar} is not set.`,
          devGrantAvailable,
        },
        { status: 503 },
      );
    }
    logger.error("stripe_checkout_failed", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      {
        error: "checkout_failed",
        message: err instanceof Error ? err.message : "Unexpected error.",
      },
      { status: 500 },
    );
  }
}
