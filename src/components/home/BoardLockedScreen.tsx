"use client";

import { useState } from "react";
import { LayoutGrid, Sparkles, Lock } from "lucide-react";
import UpgradeModal from "@/components/ui/UpgradeModal";

/**
 * Full-page lock state shown when a free user opens /app/home.
 *
 * Visual language mirrors the marketing landing page:
 *   - large bold SF-Pro heading + cream surface for the lock card
 *   - subtly blurred mock board behind a backdrop-blur translucent panel
 *     so the user can still _kind of_ see what's behind the gate
 *   - primary CTA uses the Caltodo blue
 *
 * Clicking Upgrade opens the UpgradeModal which routes to Stripe Checkout.
 */
export default function BoardLockedScreen() {
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <div className="relative w-full h-full overflow-hidden -mx-4 md:-mx-10 -mt-4 md:-mt-10 -mb-4 md:-mb-10">
      {/* Mock board preview — visible underneath the translucent lock card */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none select-none blur-[18px] scale-105 opacity-90"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#eef4ff] via-white to-[#fff4ec] dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950" />
        {/* fake cover banner */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-r from-[#0071E3]/40 via-[#7c3aed]/30 to-[#fb923c]/40" />
        {/* fake widgets */}
        <div className="absolute top-56 left-10 right-10 grid grid-cols-3 gap-5">
          <div className="h-44 rounded-2xl bg-white dark:bg-zinc-800 shadow-md" />
          <div className="h-44 rounded-2xl bg-white dark:bg-zinc-800 shadow-md" />
          <div className="h-44 rounded-2xl bg-white dark:bg-zinc-800 shadow-md" />
        </div>
        <div className="absolute top-[420px] left-10 right-10 grid grid-cols-2 gap-5">
          <div className="h-56 rounded-2xl bg-white dark:bg-zinc-800 shadow-md" />
          <div className="h-56 rounded-2xl bg-white dark:bg-zinc-800 shadow-md" />
        </div>
      </div>

      {/* Soft white wash so the lock card stays readable on any preview */}
      <div
        aria-hidden
        className="absolute inset-0 bg-white/45 dark:bg-black/40 pointer-events-none"
      />

      {/* Centered lock card */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div
          className="relative w-full max-w-md rounded-3xl border border-white/70 dark:border-white/10 p-8 sm:p-10 text-center"
          style={{
            background: "rgba(255, 255, 255, 0.55)",
            backdropFilter: "blur(28px) saturate(180%)",
            WebkitBackdropFilter: "blur(28px) saturate(180%)",
            boxShadow:
              "0 24px 60px -12px rgba(0, 0, 0, 0.18), 0 8px 20px -4px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
          }}
        >
          {/* Feature icon chip with a small lock indicator */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] mb-5 relative">
            <LayoutGrid size={26} strokeWidth={2} />
            <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center shadow-md">
              <Lock size={12} strokeWidth={3} />
            </div>
          </div>

          <h1
            className="text-2xl sm:text-[28px] font-bold text-foreground leading-tight tracking-tight"
            style={{
              fontFamily:
                '-apple-system, "SF Pro Display", BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            }}
          >
            Your personalized board
          </h1>
          <p className="text-sm sm:text-base text-foreground/70 mt-3 leading-snug">
            Build your perfect dashboard with drag-and-drop widgets, themes,
            and live data from every platform. Available on Pro.
          </p>

          <div className="mt-7 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setShowUpgrade(true)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-[#0071E3] text-white text-sm sm:text-base font-medium hover:bg-[#3D8FE8] transition-colors duration-200"
            >
              <Sparkles size={14} strokeWidth={2.5} />
              Upgrade to Pro
            </button>
            <a
              href="/#pricing"
              className="w-full inline-flex items-center justify-center px-4 sm:px-5 py-2 rounded-xl text-sm sm:text-base text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"
            >
              View pricing
            </a>
          </div>
        </div>
      </div>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} feature="board" />
    </div>
  );
}
