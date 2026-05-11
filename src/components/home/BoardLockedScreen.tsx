"use client";

import { useState } from "react";
import Image from "next/image";
import { Crown, ChevronRight, X } from "lucide-react";
import UpgradeModal from "@/components/ui/UpgradeModal";

/**
 * Lock state for /app/home when the user doesn't have Premium.
 *
 * The background uses the same compressed board screenshot as the card,
 * served via next/image with priority + CSS blur. This renders instantly
 * (no waiting on localStorage hydration of the real <HomeBoard />), which
 * matters for the perceived-instant nav the user wants. Two modes:
 *
 *   A) Default — blurred preview behind a compact card that explains the
 *      gate and offers Upgrade Now. X dismisses to mode B.
 *   B) Dismissed — preview renders sharp with a "Premium only" pill
 *      anchored to the bottom of the viewport via fixed positioning.
 */
export default function BoardLockedScreen() {
  const [dismissed, setDismissed] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    // No w-full here — a block element naturally fills the parent's content
    // box, and the negative -mx-* margins then widen it past the parent's
    // padding to reach the viewport edges. w-full would lock width to 100%
    // of the content box, so the margins would only shift the box (leaving
    // a gap on the right) instead of widening it.
    <div className="relative h-full overflow-hidden -mx-4 md:-mx-10 -mt-4 md:-mt-10 -mb-4 md:-mb-10">
      {/* Background preview. Static image + CSS blur so it paints on the
          very first render — no hydration wait. */}
      <div
        aria-hidden
        className={`absolute inset-0 pointer-events-none select-none transition-[filter,transform] duration-300 ${
          !dismissed ? "blur-md scale-[1.02]" : "blur-0 scale-100"
        }`}
      >
        <Image
          src="/app-screenshot-board-preview.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-top"
          priority
        />
      </div>

      {/* Mode A: compact upgrade card */}
      {!dismissed && (
        <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-background/45 dark:bg-black/45" />

          <div
            className="relative w-full max-w-[400px] rounded-2xl bg-card text-foreground overflow-hidden"
            style={{
              boxShadow:
                "0 20px 48px -12px rgba(0,0,0,0.22), 0 6px 18px -4px rgba(0,0,0,0.10)",
            }}
          >
            <Image
              src="/app-screenshot-board-preview.png"
              alt="Preview of a personalized caltodo board"
              width={1740}
              height={1147}
              sizes="400px"
              className="block w-full h-auto align-top"
              style={{ display: "block", verticalAlign: "top" }}
              priority
            />

            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="absolute top-3 right-3 z-10 inline-flex items-center justify-center w-7 h-7 rounded-full bg-black/30 text-white/90 hover:bg-black/45 hover:text-white transition-colors"
            >
              <X size={15} strokeWidth={2.25} />
            </button>

            <div className="px-6 pt-5 pb-6">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f6a623]/15 text-[#b97a17] dark:text-[#f6a623] text-[10px] font-semibold tracking-wide uppercase">
              <Crown size={10} strokeWidth={2.5} />
              Premium
            </div>

            <h1 className="mt-2.5 text-[22px] font-semibold tracking-tight leading-tight text-foreground">
              Personalized Board
            </h1>
            <p className="mt-1.5 text-[13px] text-foreground/60 leading-snug">
              Drag-and-drop widgets, custom themes, and live data from every
              platform you sync.
            </p>

            <button
              type="button"
              onClick={() => setShowUpgrade(true)}
              className="mt-5 w-full inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#f6a623] hover:bg-[#e0961f] text-white text-[14px] font-semibold tracking-tight shadow-[0_8px_18px_-8px_rgba(246,166,35,0.5)] transition-colors duration-200"
            >
              Upgrade Now
              <ChevronRight size={15} strokeWidth={2.5} />
            </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode B: floating pill — fixed-positioned to the actual viewport
          bottom so the parent's pb-10/pb-16 padding doesn't push it up.
          md:left-52 clears the desktop sidebar; bottom-20 on mobile
          clears the MobileTabBar. */}
      {dismissed && (
        <div className="fixed inset-x-0 bottom-20 md:bottom-3 md:left-52 flex items-center justify-center px-4 z-30 pointer-events-none">
          <button
            type="button"
            onClick={() => setShowUpgrade(true)}
            className="group pointer-events-auto flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 rounded-2xl bg-card text-foreground border border-border shadow-[0_18px_40px_-12px_rgba(0,0,0,0.18),0_8px_18px_-4px_rgba(0,0,0,0.10)] hover:bg-accent transition-colors duration-200"
          >
            <Crown size={18} strokeWidth={2.25} className="text-[#f6a623] shrink-0" />
            <span className="text-sm sm:text-[15px] font-medium tracking-tight whitespace-nowrap">
              Premium only, sample data for reference.
            </span>
            <span className="hidden sm:inline-flex items-center gap-0.5 pl-3 ml-1 border-l border-foreground/15 text-[#f6a623] hover:text-[#e0961f] text-sm font-semibold transition-colors">
              Upgrade Now
              <ChevronRight
                size={16}
                strokeWidth={2.5}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </span>
            <span className="inline-flex sm:hidden items-center gap-0.5 pl-2 ml-0.5 border-l border-foreground/15 text-[#f6a623] text-sm font-semibold">
              Upgrade
              <ChevronRight size={14} strokeWidth={2.5} />
            </span>
          </button>
        </div>
      )}

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} feature="board" />
    </div>
  );
}
