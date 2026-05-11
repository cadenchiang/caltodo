import { NextRequest, NextResponse } from "next/server";
import { stripe, webhookSecret } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import type Stripe from "stripe";

/**
 * Stripe webhook handler. This is the single source of truth that flips a
 * user's subscription state in Postgres. We never trust client redirects to
 * activate Pro — only this endpoint, gated by signature verification.
 *
 * Required env: STRIPE_WEBHOOK_SECRET
 *
 * Handled events:
 *   - checkout.session.completed       -> first activation
 *   - customer.subscription.created    -> activation (idempotent with above)
 *   - customer.subscription.updated    -> period changes, cancel scheduled
 *   - customer.subscription.deleted    -> revert to free
 *   - invoice.payment_failed           -> mark past_due
 *
 * Returns 200 even on unhandled events so Stripe doesn't retry forever.
 */
export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing_signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    const raw = await req.text();
    event = stripe().webhooks.constructEvent(raw, sig, webhookSecret());
  } catch (err) {
    logger.warn("stripe_webhook_signature_failed", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await syncFromSubscription(event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;
      default:
        // Ignored intentionally; Stripe will not retry on 200.
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    logger.error("stripe_webhook_handler_failed", {
      eventType: event.type,
      message: err instanceof Error ? err.message : String(err),
    });
    // 500 makes Stripe retry, which is correct for transient failures.
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }
}

/**
 * Resolves the Supabase user id for a Stripe customer. The checkout flow
 * stores it on the customer's metadata, and we also persist the stripe
 * customer id back to the subscriptions row, so we have two lookup paths.
 *
 * @param customerId - Stripe customer id (string or null).
 * @returns The Supabase user id or null when we can't resolve it.
 */
async function resolveUserId(customerId: string | null | undefined): Promise<string | null> {
  if (!customerId) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  if (data?.user_id) return data.user_id;

  // Fallback: read it off Stripe customer metadata.
  try {
    const customer = await stripe().customers.retrieve(customerId);
    if (!("deleted" in customer) || !customer.deleted) {
      const id = (customer as Stripe.Customer).metadata?.supabase_user_id;
      return id ?? null;
    }
  } catch {
    /* swallow — fall through */
  }
  return null;
}

/**
 * First activation path: checkout completed.
 * We pull the subscription off the session, sync it to our table.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!session.subscription) return;
  const subId =
    typeof session.subscription === "string" ? session.subscription : session.subscription.id;
  const sub = await stripe().subscriptions.retrieve(subId);
  await syncFromSubscription(sub);
}

/**
 * Updates the subscriptions row to match the current Stripe subscription
 * state. Idempotent — safe to call from multiple event types.
 */
async function syncFromSubscription(sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const userId = await resolveUserId(customerId);
  if (!userId) {
    logger.warn("stripe_webhook_unresolved_user", { customerId });
    return;
  }

  const item = sub.items.data[0];
  const interval = item?.price?.recurring?.interval ?? null;
  // In the 2026-04 Stripe API, current_period_end moved off the Subscription
  // and onto each subscription item.
  const itemPeriodEnd = item?.current_period_end;
  const periodEnd = itemPeriodEnd ? new Date(itemPeriodEnd * 1000).toISOString() : null;

  // Treat trialing OR active as 'pro' access. We don't expect Stripe trials
  // since the 30-day trial is app-managed, but handle it anyway.
  const planActive = sub.status === "active" || sub.status === "trialing";
  const plan = planActive ? "pro" : "free";

  const status = mapStripeStatus(sub.status);

  const admin = createAdminClient();
  await admin
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        plan,
        status,
        current_period_end: periodEnd,
        cancel_at_period_end: !!sub.cancel_at_period_end,
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
        billing_interval: interval === "month" || interval === "year" ? interval : null,
      },
      { onConflict: "user_id" },
    );

  logger.info("stripe_subscription_synced", {
    userId,
    plan,
    status,
    periodEnd,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  });
}

/**
 * Subscription fully deleted (after the cancel period, or admin removal).
 * Drop the user back to free.
 */
async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const userId = await resolveUserId(customerId);
  if (!userId) return;

  const admin = createAdminClient();
  await admin
    .from("subscriptions")
    .update({
      plan: "free",
      status: "canceled",
      current_period_end: null,
      cancel_at_period_end: false,
      stripe_subscription_id: null,
      billing_interval: null,
    })
    .eq("user_id", userId);

  logger.info("stripe_subscription_deleted", { userId });
}

/**
 * Mark the row as past_due so the UI can show a payment-fix banner.
 * We don't immediately revoke Pro — Stripe will retry payment a few times.
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  const userId = await resolveUserId(customerId);
  if (!userId) return;

  const admin = createAdminClient();
  await admin
    .from("subscriptions")
    .update({ status: "past_due" })
    .eq("user_id", userId);

  logger.warn("stripe_payment_failed", { userId });
}

/**
 * Maps Stripe's subscription status to our internal enum. Anything we
 * don't recognize falls back to 'incomplete' so it's visible in the DB.
 */
function mapStripeStatus(
  s: Stripe.Subscription.Status,
): "active" | "canceled" | "past_due" | "expired" | "incomplete" {
  switch (s) {
    case "active":
    case "trialing":
      return "active";
    case "canceled":
      return "canceled";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "incomplete":
    case "incomplete_expired":
      return "incomplete";
    default:
      return "incomplete";
  }
}

// Stripe needs the raw request body to verify the signature. Disable Next's
// default JSON body parsing for this route.
export const runtime = "nodejs";
