"use client";

import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "framer-motion";
import { Home, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Plan = "monthly" | "annually";

interface PlanConfig {
  id: string;
  title: string;
  desc: string;
  monthlyPrice: number;
  annuallyPrice: number;
  badge?: string;
  buttonText: string;
  features: string[];
  link: string;
  cta: "free" | "pro";
}

/**
 * Caltodo pricing plans. Premium gates the board, Google Calendar two-way
 * sync, and syllabus PDF extraction. Everything else stays free forever.
 */
export const PLANS: PlanConfig[] = [
  {
    id: "free",
    title: "Free",
    desc: "Everything you need to never miss a deadline again.",
    monthlyPrice: 0,
    annuallyPrice: 0,
    buttonText: "Sign up",
    features: [
      "Automatic assignment syncing",
      "1 syllabus upload",
      "All your deadlines on one calendar",
      "Mobile + desktop access",
    ],
    link: "/login?signup=true",
    cta: "free",
  },
  {
    id: "pro",
    title: "Premium",
    desc: "Power features for students who want full control of their workflow.",
    monthlyPrice: 9.99,
    annuallyPrice: 19.99,
    badge: "Popular",
    buttonText: "Get started",
    features: [
      "Everything in Free",
      "Personalized board with drag-and-drop widgets",
      "Custom themes",
      "Google Calendar two-way sync",
      "Unlimited syllabus uploads",
      "Smart notifications for upcoming deadlines",
      "Early access to new features",
    ],
    link: "/login?signup=true&plan=pro",
    cta: "pro",
  },
];

/**
 * Two-tier pricing comparison block (Free / Pro) with a monthly / annually toggle.
 * Adapted from Ruixen's Pricing_04 template and re-skinned for caltodo's
 * light-theme landing page. Animated number transitions when the toggle flips.
 */
export default function Pricing_04() {
  const [billPlan, setBillPlan] = useState<Plan>("annually");

  /** Flips the displayed price between monthly and annual. */
  const handleSwitch = () => {
    setBillPlan((prev) => (prev === "monthly" ? "annually" : "monthly"));
  };

  return (
    <section className="relative flex flex-col items-center justify-center max-w-5xl py-12 sm:py-24 mx-auto px-5 sm:px-6">
      <div className="flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <h2
            id="pricing"
            className="scroll-mt-24 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-black"
          >
            Pricing
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-center text-black/70 mt-3 sm:mt-6 px-2">
            Start free. Upgrade if you want the power-user features.
          </p>
        </div>
        <div className="flex items-center justify-center space-x-3 sm:space-x-4 mt-6 sm:mt-8">
          <span
            className={cn(
              "text-sm sm:text-base font-medium transition-colors",
              billPlan === "monthly" ? "text-black" : "text-black/40",
            )}
          >
            Monthly
          </span>
          <button
            onClick={handleSwitch}
            type="button"
            role="switch"
            aria-checked={billPlan === "annually"}
            aria-label="Toggle monthly / annual billing"
            className={cn(
              "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f6a623]/40",
              billPlan === "annually" ? "bg-[#f6a623]" : "bg-black/15",
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-out",
                billPlan === "annually" ? "translate-x-5" : "translate-x-0.5",
              )}
              style={{ alignSelf: "center" }}
            />
          </button>
          <span
            className={cn(
              "text-sm sm:text-base font-medium transition-colors flex items-center gap-2",
              billPlan === "annually" ? "text-black" : "text-black/40",
            )}
          >
            Annually
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-[#f6a623]/15 text-[#b97a17] dark:text-[#f6a623] text-[11px] font-semibold tracking-wide">
              Save $100/yr
            </span>
          </span>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 lg:grid-cols-2 pt-8 sm:pt-10 lg:pt-12 gap-4 lg:gap-6 max-w-5xl mx-auto">
        {PLANS.map((plan) => (
          <Plan key={plan.id} plan={plan} billPlan={billPlan} />
        ))}
      </div>
    </section>
  );
}

/**
 * Single pricing card. Pro tier gets a highlighted border and a "Most popular" badge.
 *
 * @param plan - The plan config to render.
 * @param billPlan - Whether to show monthly or annual price.
 */
/**
 * Renders the correct CTA for a plan card depending on auth + tier.
 * Free plan: always a normal link to signup.
 * Pro plan: if the user is signed in, POST /api/stripe/checkout and redirect
 *   to Stripe Checkout. Otherwise route through /login first, preserving
 *   the chosen interval so onboarding can resume checkout afterward.
 */
function PlanCta({
  plan,
  isPro,
  billPlan,
}: {
  plan: PlanConfig;
  isPro: boolean;
  billPlan: Plan;
}) {
  const [submitting, setSubmitting] = useState(false);

  const className = cn(
    "w-full inline-flex items-center justify-center px-4 sm:px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200",
    isPro
      ? "bg-black text-white hover:bg-black/85"
      : "bg-white text-black border border-black/10 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-black/[0.02]",
  );

  // Free tier (cta === 'free') goes straight to the signup link.
  if (plan.cta !== "pro") {
    return (
      <Link href={plan.link} className={className}>
        {plan.buttonText}
      </Link>
    );
  }

  /**
   * Handle the Pro upgrade click. If the user is signed in, hit checkout;
   * otherwise stash the upgrade intent in sessionStorage and send them
   * to /login so the post-auth effect can resume checkout automatically.
   *
   * The 503 / devGrantAvailable branch lets localhost developers test the
   * full upgrade flow without configuring Stripe keys.
   */
  async function handleUpgrade() {
    setSubmitting(true);
    const interval = billPlan === "monthly" ? "month" : "year";
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        try {
          sessionStorage.setItem(
            "caltodo_pending_upgrade",
            JSON.stringify({ interval, ts: Date.now() }),
          );
        } catch {
          /* sessionStorage may throw in private browsing */
        }
        window.location.href = `/login?signup=true&plan=pro&interval=${interval}`;
        return;
      }
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        alreadyPro?: boolean;
        error?: string;
        message?: string;
        devGrantAvailable?: boolean;
      };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.alreadyPro) {
        window.location.href = "/app/settings";
        return;
      }
      if (res.status === 503 && data.devGrantAvailable) {
        const grantRes = await fetch("/api/dev/grant-pro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interval }),
        });
        const grantData = (await grantRes.json().catch(() => ({}))) as {
          ok?: boolean;
          message?: string;
        };
        if (grantData.ok) {
          window.location.href = "/app/settings";
          return;
        }
        throw new Error(grantData.message ?? "Dev grant failed.");
      }
      throw new Error(data.message ?? data.error ?? "checkout_failed");
    } catch (err) {
      setSubmitting(false);
      const message = err instanceof Error ? err.message : "Please try again.";
      alert(`Couldn't start checkout: ${message}`);
    }
  }

  return (
    <button
      type="button"
      onClick={handleUpgrade}
      disabled={submitting}
      className={cn(className, "disabled:opacity-60 disabled:cursor-not-allowed")}
    >
      {submitting ? "Starting checkout..." : plan.buttonText}
    </button>
  );
}

function Plan({ plan, billPlan }: { plan: PlanConfig; billPlan: Plan }) {
  const isPro = plan.cta === "pro";
  const currentPrice = billPlan === "monthly" ? plan.monthlyPrice : plan.annuallyPrice;
  const fractionDigits = currentPrice === 0 ? 0 : 2;
  const Icon = isPro ? Sparkles : Home;
  /**
   * The Premium plan's first bullet is "Everything in Free" — render that
   * as a section header (matching the Notion layout) instead of a bullet.
   */
  const featuresList = isPro ? plan.features.slice(1) : plan.features;

  return (
    <div className="flex flex-col relative rounded-3xl bg-[#f6f5f4] items-start w-full h-full p-6 sm:p-8 overflow-hidden">
      {/* Top icon */}
      <Icon size={28} className="text-black mb-6" strokeWidth={1.75} aria-hidden />

      {/* Plan name + Popular badge */}
      <div className="flex items-center gap-2.5 mb-3">
        <h3
          className="text-lg sm:text-xl font-extrabold text-black leading-none"
          style={{
            fontFamily:
              '-apple-system, "SF Pro Display", BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          }}
        >
          {plan.title}
        </h3>
        {plan.badge && (
          <span className="px-2.5 py-1 rounded-full bg-[#0e89d6] text-white text-xs font-bold leading-none">
            {plan.badge}
          </span>
        )}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2 mb-6">
        <h4 className="text-4xl sm:text-5xl font-bold text-black leading-none tracking-tight">
          <NumberFlow
            value={currentPrice}
            format={{
              currency: "USD",
              style: "currency",
              currencySign: "standard",
              minimumFractionDigits: fractionDigits,
              maximumFractionDigits: fractionDigits,
              currencyDisplay: "narrowSymbol",
            }}
          />
        </h4>
        {currentPrice > 0 && (
          <span className="text-base text-black/60">
            per {billPlan === "monthly" ? "month" : "year"}
          </span>
        )}
      </div>

      {/* CTA */}
      <div className="w-full mb-6">
        <PlanCta plan={plan} isPro={isPro} billPlan={billPlan} />
      </div>

      {/* Features list */}
      {isPro && (
        <p className="text-base font-semibold text-black mb-3">Everything in Free +</p>
      )}
      <ul className="flex flex-col items-start w-full gap-2.5 sm:gap-3">
        {featuresList.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-black/70 shrink-0 mt-[9px]" aria-hidden />
            <span className="text-base text-black/80 leading-snug">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Billing caption pinned to the bottom */}
      <div className="mt-auto pt-6 w-full">
        <div className="h-5 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={billPlan}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="text-sm text-black/50 block"
            >
              {plan.monthlyPrice === 0
                ? "Free forever, no card required"
                : billPlan === "monthly"
                  ? "Billed monthly"
                  : "Billed once a year"}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
