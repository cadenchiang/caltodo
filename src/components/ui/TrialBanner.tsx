"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import UpgradeModal from "@/components/ui/UpgradeModal";
import { useEntitlement } from "@/hooks/useEntitlement";

/**
 * Top-of-app banner that nudges trial users to convert. Visible only when:
 *   - the user is on a trial (not free, not pro, not founder), AND
 *   - the trial has 7 or fewer days remaining, AND
 *   - the user hasn't dismissed it this session.
 *
 * Visually keeps a calm cream surface with a small Pro pill instead of a
 * loud full-blue strip, matching the landing-page card aesthetic.
 */
export default function TrialBanner() {
  const { isTrial, trialDaysLeft } = useEntitlement();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem("caltodo_trial_banner_dismissed") === "1";
    } catch {
      return false;
    }
  });

  if (!isTrial || trialDaysLeft === null || trialDaysLeft > 7 || dismissed) return null;

  /** Hide the banner for the rest of this browser session. */
  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem("caltodo_trial_banner_dismissed", "1");
    } catch {
      /* ignore */
    }
  }

  const label =
    trialDaysLeft === 0
      ? "Your Pro trial ends today."
      : trialDaysLeft === 1
        ? "Your Pro trial ends tomorrow."
        : `Your Pro trial ends in ${trialDaysLeft} days.`;

  return (
    <>
      <div className="w-full bg-[#f6f5f4] border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#0071E3] text-white text-[10px] font-semibold tracking-wide shrink-0">
              <Sparkles size={10} strokeWidth={3} />
              PRO
            </span>
            <span className="truncate text-foreground/80">
              {label}{" "}
              <span className="hidden sm:inline text-foreground/55">
                Keep Pro to save your board, themes, and Calendar sync.
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowUpgrade(true)}
              className="px-3 py-1 rounded-lg bg-[#0071E3] text-white text-xs font-semibold hover:bg-[#3D8FE8] transition-colors"
            >
              Keep Pro
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="p-1 rounded text-foreground/50 hover:text-foreground hover:bg-black/5 transition-colors"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} feature="generic" />
    </>
  );
}
