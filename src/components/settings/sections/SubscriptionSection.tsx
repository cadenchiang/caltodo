"use client";

import { useState } from "react";
import { Sparkles, ExternalLink } from "lucide-react";
import { useEntitlement } from "@/hooks/useEntitlement";
import UpgradeModal from "@/components/ui/UpgradeModal";

/**
 * Subscription settings section.
 *
 * Visual language matches the landing-page pricing cards:
 *   - cream bg-[#f6f5f4] surface, rounded-3xl
 *   - SF Pro Display title
 *   - blue-tinted Pro pill in the top-right
 *   - rounded-xl primary CTA in Caltodo blue
 *
 * Shows the user's current plan, renewal/trial-end date, and the right CTA:
 *   - Free          → "Upgrade to Pro" opens UpgradeModal
 *   - Trial         → days left + "Keep Pro" opens UpgradeModal
 *   - Pro (paid)    → renewal date + "Manage subscription" opens Stripe Portal
 *   - Pro (founder) → "Founder access" pill, no CTA
 *
 * Cancellation, payment method updates and invoices happen in the Stripe
 * Customer Portal so we don't have to host that UI ourselves.
 */
export default function SubscriptionSection() {
  const { entitlement, loading, isPro, isTrial, trialDaysLeft, refresh } = useEntitlement();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  /**
   * Opens the Stripe Customer Portal so the user can update their payment
   * method, cancel, or view invoices. The URL returned is one-time-use.
   */
  async function openPortal() {
    setOpeningPortal(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url as string;
        return;
      }
      alert(
        data?.error === "no_customer"
          ? "You don't have a Stripe subscription yet."
          : "Couldn't open the billing portal. Try again.",
      );
      setOpeningPortal(false);
    } catch {
      setOpeningPortal(false);
      alert("Couldn't open the billing portal. Try again.");
    }
  }

  if (loading || !entitlement) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Subscription</h2>
        <div className="h-40 rounded-3xl bg-[#f6f5f4] animate-pulse" />
      </section>
    );
  }

  const isFounder = entitlement.founder;
  const isFree = !isPro;
  const isCanceling = entitlement.cancelAtPeriodEnd;
  const periodEnd = entitlement.currentPeriodEnd
    ? new Date(entitlement.currentPeriodEnd).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  let title = "Free plan";
  let subtitle = "You're on the free tier.";
  let pillLabel = "Free";
  let pillClass = "bg-black/10 text-black/70";
  let cardRing = "";

  if (isFounder) {
    title = "Founder access";
    subtitle =
      "Thanks for being one of the first. Pro features are unlocked for life on this account.";
    pillLabel = "Founder";
    pillClass = "bg-amber-500 text-white";
    cardRing = "ring-2 ring-amber-500/40";
  } else if (isTrial) {
    title = "Pro trial";
    subtitle =
      trialDaysLeft === 0
        ? "Your trial ends today. Keep Pro to continue using premium features."
        : `${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left in your free 30-day trial.`;
    pillLabel = "Pro trial";
    pillClass = "bg-[#0071E3] text-white";
    cardRing = "ring-2 ring-[#0071E3]/40";
  } else if (entitlement.effectivePlan === "pro") {
    title = entitlement.billingInterval === "year" ? "Pro · Annual" : "Pro · Monthly";
    subtitle = isCanceling
      ? `Your Pro access ends on ${periodEnd ?? "the end of the period"}. You can re-subscribe anytime.`
      : periodEnd
        ? `Renews on ${periodEnd}.`
        : "Active.";
    pillLabel = "Pro";
    pillClass = "bg-[#0071E3] text-white";
    cardRing = "ring-2 ring-[#0071E3]/40";
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Subscription</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your plan, billing, and payment details.
        </p>
      </div>

      <div className={`relative rounded-3xl bg-[#f6f5f4] p-6 sm:p-8 ${cardRing}`}>
        <span
          className={`absolute top-4 right-4 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${pillClass}`}
        >
          {pillLabel}
        </span>

        <h3
          className="text-xl sm:text-2xl font-bold text-foreground leading-tight tracking-tight pr-24"
          style={{
            fontFamily:
              '-apple-system, "SF Pro Display", BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          }}
        >
          {title}
        </h3>
        <p className="text-sm sm:text-base text-foreground/70 mt-2 leading-snug">{subtitle}</p>

        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          {isFounder ? null : isFree || isTrial ? (
            <button
              type="button"
              onClick={() => setShowUpgrade(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-[#0071E3] text-white text-sm sm:text-base font-medium hover:bg-[#3D8FE8] transition-colors duration-200"
            >
              <Sparkles size={14} strokeWidth={2.5} />
              {isTrial ? "Keep Pro" : "Upgrade to Pro"}
            </button>
          ) : (
            <button
              type="button"
              onClick={openPortal}
              disabled={openingPortal}
              className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-foreground text-background hover:bg-foreground/85 text-sm sm:text-base font-medium transition-colors disabled:opacity-60"
            >
              {openingPortal ? "Opening..." : "Manage subscription"}
              <ExternalLink size={14} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => {
          setShowUpgrade(false);
          refresh();
        }}
        feature="generic"
      />
    </section>
  );
}
