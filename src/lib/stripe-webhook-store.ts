/**
 * Database side of the Stripe webhook's idempotency and subscription keying.
 *
 * Audit M17. The route verifies the signature and dispatches; this module
 * owns the two questions that need the database: "have we seen this event
 * id?" and "is this event about the subscription we have stored?".
 *
 * @module stripe-webhook-store
 */

import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { isEventForStoredSubscription, isUniqueViolation } from "@/lib/stripe-guards";

/**
 * Claims an event id for processing.
 *
 * @param event - The verified Stripe event
 * @returns "claimed" on first sight, "duplicate" when already recorded,
 *          "error" when the insert failed for any other reason
 */
export async function claimEvent(event: Stripe.Event): Promise<"claimed" | "duplicate" | "error"> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("stripe_webhook_events")
    .insert({ event_id: event.id, event_type: event.type });
  if (!error) return "claimed";
  if (isUniqueViolation(error)) return "duplicate";
  logger.error("stripe_webhook_claim_failed", {
    eventId: event.id,
    eventType: event.type,
    message: error.message,
    impact: "event not applied; returning 500 so Stripe retries",
  });
  return "error";
}

/**
 * Releases a claim after the handler failed, so the retry is not treated
 * as a duplicate.
 *
 * @param eventId - The event whose claim to drop
 */
export async function releaseEvent(eventId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("stripe_webhook_events").delete().eq("event_id", eventId);
  if (error) {
    logger.error("stripe_webhook_release_failed", {
      eventId,
      message: error.message,
      impact: "Stripe's retry will be ignored as a duplicate; the event must be replayed by hand",
    });
  }
}

/**
 * Whether a subscription event is about the subscription stored for its
 * customer's user. Keys on the subscription id, not the customer id.
 *
 * @param sub - The event's subscription
 * @param eventType - For the log line
 * @returns True to apply the event; false (logged) to ignore it as stale
 */
export async function concernsStoredSubscription(sub: Stripe.Subscription, eventType: string): Promise<boolean> {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  if (error) {
    // Cannot tell; throwing lets the outer handler return 500 and retry.
    throw new Error(`subscriptions lookup failed: ${error.message}`);
  }
  const stored = data?.stripe_subscription_id ?? null;
  if (isEventForStoredSubscription(stored, sub.id)) return true;
  logger.warn("stripe_webhook_stale_subscription_ignored", {
    eventType,
    customerId,
    eventSubscriptionId: sub.id,
    storedSubscriptionId: stored,
    impact: "row left as is; it belongs to a newer subscription",
  });
  return false;
}
