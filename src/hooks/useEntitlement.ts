"use client";

import { useEffect, useState } from "react";
import type { Entitlement } from "@/lib/entitlements";

interface UseEntitlementResult {
  entitlement: Entitlement | null;
  /** True until the first fetch resolves. */
  loading: boolean;
  /** True when the user can access Pro features (paid, trialing, or founder). */
  isPro: boolean;
  /** True when in a trial (Pro features active, but expiring). */
  isTrial: boolean;
  /** Days remaining in the trial. Null when not on trial. */
  trialDaysLeft: number | null;
  /** Manually re-fetch (e.g. after a successful checkout). */
  refresh: () => void;
}

/**
 * Client hook that fetches the current user's entitlement from /api/me/entitlement.
 * Caches the result in module-level state so multiple components don't refetch.
 *
 * @returns The entitlement plus derived booleans (isPro / isTrial / trialDaysLeft).
 */
export function useEntitlement(): UseEntitlementResult {
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/me/entitlement", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as Entitlement;
      })
      .then((data) => {
        if (cancelled) return;
        setEntitlement(data);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const isPro =
    !!entitlement &&
    (entitlement.effectivePlan === "pro" || entitlement.effectivePlan === "trial");
  const isTrial = !!entitlement && entitlement.effectivePlan === "trial";
  const trialDaysLeft = (() => {
    if (!entitlement?.currentPeriodEnd || entitlement.effectivePlan !== "trial") return null;
    const ms = new Date(entitlement.currentPeriodEnd).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / 86_400_000));
  })();

  return {
    entitlement,
    loading,
    isPro,
    isTrial,
    trialDaysLeft,
    refresh: () => setTick((t) => t + 1),
  };
}
