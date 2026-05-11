import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { getEntitlement } from "@/lib/entitlements";
import { logger } from "@/lib/logger";

/**
 * Creates a Stripe Customer Portal session and returns its URL.
 * Used by the Settings → Subscription panel for "Manage subscription" /
 * cancel / update payment method.
 *
 * Requires the user to already have a Stripe customer id (i.e. they paid
 * at least once). Returns 400 otherwise.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const entitlement = await getEntitlement(user.id);
    if (!entitlement.stripeCustomerId) {
      return NextResponse.json({ error: "no_customer" }, { status: 400 });
    }

    const origin = req.headers.get("origin") ?? "https://caltodo.me";
    const session = await stripe().billingPortal.sessions.create({
      customer: entitlement.stripeCustomerId,
      return_url: `${origin}/app/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    logger.error("stripe_portal_failed", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "portal_failed" }, { status: 500 });
  }
}
