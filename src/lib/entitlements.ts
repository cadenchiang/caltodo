import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

/** Plan a user effectively has access to right now. */
export type EffectivePlan = "free" | "trial" | "pro";

export interface Entitlement {
  effectivePlan: EffectivePlan;
  /** When the trial / paid period ends. Null for founder or free. */
  currentPeriodEnd: string | null;
  /** True for the founding cohort — Pro access for life, no Stripe customer. */
  founder: boolean;
  /** True when a paid subscription is scheduled to cancel at period end. */
  cancelAtPeriodEnd: boolean;
  /** Stripe customer id, when the user has paid at least once. */
  stripeCustomerId: string | null;
  /** Stripe subscription id, when the user has an active paid sub. */
  stripeSubscriptionId: string | null;
  /** 'month' | 'year' when paid; null otherwise. */
  billingInterval: "month" | "year" | null;
}

/** Default entitlement returned when no row exists (defense-in-depth: free). */
const DEFAULT_FREE: Entitlement = {
  effectivePlan: "free",
  currentPeriodEnd: null,
  founder: false,
  cancelAtPeriodEnd: false,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  billingInterval: null,
};

/**
 * Performs the actual Supabase roundtrip. Kept separate so it can be wrapped
 * in a per-user cache below. Uses the admin (service-role) client because
 * the cache function lives outside the request-cookie scope — calling
 * createServerClient() here would trigger Next's "cookies() inside
 * unstable_cache" error. We pass userId in explicitly and bypass RLS;
 * the cache key already namespaces by user.
 *
 * Returns DEFAULT_FREE on miss or error (defense in depth: a failed lookup
 * must not accidentally grant Pro).
 */
async function fetchEntitlementUncached(userId: string): Promise<Entitlement> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("user_entitlement")
    .select(
      "effective_plan, current_period_end, founder, cancel_at_period_end, stripe_customer_id, stripe_subscription_id, billing_interval",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return DEFAULT_FREE;

  return {
    effectivePlan: (data.effective_plan ?? "free") as EffectivePlan,
    currentPeriodEnd: data.current_period_end,
    founder: !!data.founder,
    cancelAtPeriodEnd: !!data.cancel_at_period_end,
    stripeCustomerId: data.stripe_customer_id,
    stripeSubscriptionId: data.stripe_subscription_id,
    billingInterval: data.billing_interval as "month" | "year" | null,
  };
}

/**
 * Reads the effective entitlement for a user from Supabase.
 * Cached per-user with a 60s TTL via `unstable_cache`: navigations to gated
 * routes (most notably /app/home) used to incur a fresh Supabase roundtrip
 * on every visit (~100-300ms), which manifested as a visible skeleton flash
 * before the paywall painted. The cache eliminates that latency for the
 * common case (rapid back-and-forth between routes).
 *
 * On a real plan change (Stripe webhook), the entry is invalidated via
 * `revalidateTag("entitlement")` so the user sees the new plan within the
 * same request cycle. The 60s TTL is the safety net for any path that
 * doesn't explicitly invalidate.
 *
 * @param userId - The auth.users id to look up.
 * @returns The user's current entitlement; falls back to free when missing.
 */
export async function getEntitlement(userId: string): Promise<Entitlement> {
  const cached = unstable_cache(
    () => fetchEntitlementUncached(userId),
    ["entitlement", userId],
    { revalidate: 60, tags: ["entitlement", `entitlement:${userId}`] },
  );
  return cached();
}

/**
 * True when the user currently has access to Pro features (paid, trialing,
 * or founder). Use this from server-side gated endpoints.
 *
 * @param userId - The auth.users id to check.
 * @returns True if the user can use Pro features right now.
 */
export async function isPro(userId: string): Promise<boolean> {
  const e = await getEntitlement(userId);
  return e.effectivePlan === "pro" || e.effectivePlan === "trial";
}

/**
 * Convenience: throws/returns a structured error to the caller when the user
 * does not have Pro access. Designed for use inside Next.js route handlers.
 *
 * @param userId - The user to check.
 * @returns { ok: true } when allowed; { ok: false, reason } when not.
 */
export async function requirePro(
  userId: string,
): Promise<{ ok: true } | { ok: false; reason: "free" }> {
  return (await isPro(userId)) ? { ok: true } : { ok: false, reason: "free" };
}
