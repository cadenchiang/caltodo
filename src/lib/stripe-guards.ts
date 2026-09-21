/**
 * Pure decisions for the Stripe webhook and checkout routes.
 *
 * Audit M17: the webhook keyed every subscription event on the customer
 * id alone, so a stale event for an old subscription could overwrite the
 * row for a newer one, and nothing stopped a second checkout while a
 * non-canceled subscription still existed. Kept free of I/O so the rules
 * can be unit-tested.
 *
 * @module stripe-guards
 */

/** Stripe statuses that mean the subscription is over and can be replaced. */
const ENDED_STATUSES = new Set(["canceled", "incomplete_expired"]);

/**
 * Whether a subscription.updated/deleted event should touch the stored row.
 *
 * @param storedSubscriptionId - `subscriptions.stripe_subscription_id` for the user
 * @param eventSubscriptionId - The subscription the event is about
 * @returns True when the row has no subscription yet or the ids match
 * @remarks A row with a different, non-null id belongs to a newer
 *          subscription; an event about an older one is stale and ignored.
 */
export function isEventForStoredSubscription(
  storedSubscriptionId: string | null | undefined,
  eventSubscriptionId: string,
): boolean {
  if (!storedSubscriptionId) return true;
  return storedSubscriptionId === eventSubscriptionId;
}

/**
 * Whether the customer already has a subscription that has not ended.
 *
 * @param subscriptions - The customer's subscriptions, any status
 * @returns True when any is neither canceled nor incomplete_expired
 * @remarks past_due, unpaid, incomplete, trialing, paused and active all
 *          count: creating another checkout beside any of them risks a
 *          double charge or a row that flips between two subscriptions.
 */
export function hasNonCanceledSubscription(subscriptions: ReadonlyArray<{ status: string }>): boolean {
  return subscriptions.some((sub) => !ENDED_STATUSES.has(sub.status));
}

/**
 * Whether a Postgres error is a unique-key violation (already recorded).
 *
 * @param error - The error object from the Supabase client, or null
 * @returns True for SQLSTATE 23505
 */
export function isUniqueViolation(error: { code?: string } | null | undefined): boolean {
  return error?.code === "23505";
}

/**
 * Whether a Postgres error is a foreign-key violation (the referenced user
 * no longer exists).
 *
 * @param error - The error object from the Supabase client, or null
 * @returns True for SQLSTATE 23503
 */
export function isForeignKeyViolation(error: { code?: string } | null | undefined): boolean {
  return error?.code === "23503";
}
