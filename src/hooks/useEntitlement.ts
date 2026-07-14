"use client";

import type { Entitlement } from "@/lib/entitlements";

interface UseEntitlementResult {
  entitlement: Entitlement | null;
  /** True until the first fetch resolves. Always false — access is static. */
  loading: boolean;
  /** True when the user can access every feature. Always true — free forever. */
  isPro: boolean;
  /** True when in a trial. Always false — there is no paid tier. */
  isTrial: boolean;
  /** Days remaining in the trial. Always null — there is no trial. */
  trialDaysLeft: number | null;
  /** No-op; kept for call-site compatibility. */
  refresh: () => void;
}

/**
 * Every feature is free forever, so this hook no longer fetches an
 * entitlement — it reports full, unlocked access to all callers. The Stripe
 * plumbing and /api/me/entitlement route are left in place but unused.
 */
const FREE_FOREVER: Entitlement = {
  effectivePlan: "pro",
  currentPeriodEnd: null,
  founder: true,
  cancelAtPeriodEnd: false,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  billingInterval: null,
};

export function useEntitlement(): UseEntitlementResult {
  return {
    entitlement: FREE_FOREVER,
    loading: false,
    isPro: true,
    isTrial: false,
    trialDaysLeft: null,
    refresh: () => {},
  };
}
