"use client";

import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
 * Caltodo pricing plans. Pro gates the board, Google Calendar two-way sync,
 * and syllabus PDF extraction. Everything else stays free forever.
 */
export const PLANS: PlanConfig[] = [
  {
    id: "free",
    title: "Free",
    desc: "Everything you need to never miss a deadline again.",
    monthlyPrice: 0,
    annuallyPrice: 0,
    buttonText: "Get started free",
    features: [
      "Sync assignments from Canvas, Gradescope, and Pensive",
      "1 syllabus upload",
      "All your deadlines on one calendar",
      "Daily, weekly, and inbox views",
      "Mobile + desktop access",
      "Unlimited assignments",
    ],
    link: "/login?signup=true",
    cta: "free",
  },
  {
    id: "pro",
    title: "Pro",
    desc: "Power features for students who want full control of their workflow.",
    monthlyPrice: 9.99,
    annuallyPrice: 19.99,
    badge: "Most popular",
    buttonText: "Start Pro",
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
    <section className="relative flex flex-col items-center justify-center max-w-5xl py-16 sm:py-24 mx-auto px-6">
      <div className="flex flex-col items-center justify-center max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <h2
            id="pricing"
            className="scroll-mt-24 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-black"
          >
            Pricing
          </h2>
          <p className="text-base md:text-lg text-center text-black/70 mt-4 sm:mt-6">
            Start free. Upgrade if you want the power-user features.
          </p>
        </div>
        <div className="flex items-center justify-center space-x-4 mt-6 sm:mt-8">
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
              "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]/40",
              billPlan === "annually" ? "bg-[#0071E3]" : "bg-black/15",
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
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-[#0071E3]/10 text-[#0071E3] text-[11px] font-semibold tracking-wide">
              Save $100/yr
            </span>
          </span>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 lg:grid-cols-2 pt-10 lg:pt-12 gap-4 lg:gap-6 max-w-5xl mx-auto">
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
function Plan({ plan, billPlan }: { plan: PlanConfig; billPlan: Plan }) {
  const isPro = plan.cta === "pro";
  const currentPrice = billPlan === "monthly" ? plan.monthlyPrice : plan.annuallyPrice;
  const fractionDigits = currentPrice === 0 ? 0 : 2;
  return (
    <div
      className={cn(
        "flex flex-col relative rounded-3xl transition-all bg-[#f6f5f4] items-start w-full h-full p-8 sm:p-10 overflow-hidden",
        isPro && "ring-2 ring-[#0071E3]/40",
      )}
    >
      {plan.badge && (
        <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-[#0071E3] text-white text-[11px] font-semibold tracking-wide">
          {plan.badge}
        </div>
      )}

      <h3
        className="text-2xl sm:text-[28px] font-bold text-black leading-tight tracking-tight"
        style={{
          fontFamily:
            '-apple-system, "SF Pro Display", BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        {plan.title}
      </h3>
      <h4 className="mt-3 text-3xl font-bold md:text-5xl text-black leading-tight tracking-tight">
        <NumberFlow
          value={currentPrice}
          suffix={billPlan === "monthly" ? "/mo" : "/yr"}
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
      <p className="text-base sm:text-lg text-black/70 mt-3 leading-snug">{plan.desc}</p>

      <div className="flex flex-col items-start w-full mt-6 gap-y-2.5">
        <span className="text-sm font-medium text-black/80 mb-1">Includes:</span>
        {plan.features.map((feature) => (
          <div key={feature} className="flex items-start justify-start gap-2.5">
            <CheckIcon
              className={cn("size-5 shrink-0 mt-0.5", isPro ? "text-[#0071E3]" : "text-black/70")}
              strokeWidth={2.5}
            />
            <span className="text-sm md:text-base text-black/80 leading-snug">{feature}</span>
          </div>
        ))}
      </div>

      {/* Button + billing caption — pinned to the bottom of the card */}
      <div className="mt-auto flex flex-col items-start w-full pt-8">
        <Link
          href={plan.link}
          className={cn(
            "w-full inline-flex items-center justify-center px-4 sm:px-5 py-2 rounded-xl text-sm sm:text-base font-medium transition-colors duration-200",
            isPro
              ? "bg-[#0071E3] text-white hover:bg-[#3D8FE8]"
              : "bg-black text-white hover:bg-black/85",
          )}
        >
          {plan.buttonText}
        </Link>
        <div className="h-10 overflow-hidden w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.span
              key={billPlan}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="text-xs sm:text-sm text-center text-black/50 mt-2.5 mx-auto block"
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
