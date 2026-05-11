"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { LayoutGrid, CalendarDays, FileText, Palette, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  /** Whether the modal is visible. */
  open: boolean;
  /** Called when the user closes the modal without upgrading. */
  onClose: () => void;
  /** Drives the headline + featured icon. Defaults to a generic "Upgrade to Pro". */
  feature?: "board" | "gcal" | "syllabus" | "themes" | "generic";
}

const FEATURE_COPY: Record<
  NonNullable<Props["feature"]>,
  { title: string; icon: typeof LayoutGrid }
> = {
  board: { title: "Unlock your board", icon: LayoutGrid },
  gcal: { title: "Unlock Calendar sync", icon: CalendarDays },
  syllabus: { title: "Unlock unlimited syllabi", icon: FileText },
  themes: { title: "Unlock themes", icon: Palette },
  generic: { title: "Upgrade to Pro", icon: Sparkles },
};

const CLOSE_ANIM_MS = 220;

/**
 * Upgrade modal shown when a free user hits a gated feature. Borrows the
 * pricing-card visual language: cream surface, rounded-3xl corners, the
 * Caltodo blue for the primary CTA, SF Pro Display heading typography.
 *
 * Defaults to the annual interval (the best deal). On confirm, POSTs to
 * /api/stripe/checkout and redirects the user to Stripe's hosted checkout.
 */
export default function UpgradeModal({ open, onClose, feature = "generic" }: Props) {
  const [interval, setInterval] = useState<"month" | "year">("year");
  const [submitting, setSubmitting] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!open) {
      setClosing(false);
      setSubmitting(false);
    }
  }, [open]);

  const requestClose = useCallback(() => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(() => {
      setClosing(false);
      onClose();
    }, CLOSE_ANIM_MS);
  }, [closing, onClose]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !submitting) requestClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, submitting, requestClose]);

  /**
   * Hits /api/stripe/checkout to get a Stripe-hosted checkout URL, then
   * navigates the browser to it. On failure, surfaces a generic error.
   */
  async function handleUpgrade() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url as string;
        return;
      }
      if (data?.alreadyPro) {
        window.location.href = "/app/settings";
        return;
      }
      throw new Error(data?.error ?? "checkout_failed");
    } catch {
      setSubmitting(false);
      alert("Something went wrong starting checkout. Please try again.");
    }
  }

  if (!open || typeof document === "undefined") return null;

  const copy = FEATURE_COPY[feature];
  const Icon = copy.icon;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/45 backdrop-blur-sm",
          closing ? "animate-announce-backdrop-out" : "animate-announce-backdrop-in",
        )}
        onClick={submitting ? undefined : requestClose}
      />

      {/* Card */}
      <div
        className={cn(
          "relative w-full max-w-md rounded-3xl bg-[#f6f5f4] p-8 sm:p-10 ring-2 ring-[#0071E3]/40",
          "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.18),0_8px_20px_-4px_rgba(0,0,0,0.08)]",
          closing ? "animate-announce-card-out" : "animate-announce-card-in",
        )}
      >
        {/* Most popular pill (top-right) */}
        <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-[#0071E3] text-white text-[11px] font-semibold tracking-wide">
          Pro
        </div>

        <button
          type="button"
          onClick={requestClose}
          disabled={submitting}
          className="absolute top-4 left-4 p-1 text-black/40 hover:text-black/80 transition-colors rounded-lg hover:bg-black/5 disabled:opacity-40"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Feature icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] mb-5 mt-3">
          <Icon size={22} strokeWidth={2.25} />
        </div>

        <h2
          className="text-xl sm:text-2xl font-bold text-black leading-tight tracking-tight"
          style={{
            fontFamily:
              '-apple-system, "SF Pro Display", BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          }}
        >
          {copy.title}
        </h2>

        {/* Pricing toggle */}
        <div className="grid grid-cols-2 gap-2 mt-5">
          <button
            type="button"
            onClick={() => setInterval("year")}
            className={cn(
              "rounded-xl border px-3.5 py-3 text-left transition-colors",
              interval === "year"
                ? "border-[#0071E3] bg-white"
                : "border-black/10 bg-white hover:border-black/25",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-black/60">
                Annual
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#0071E3] text-white">
                Best
              </span>
            </div>
            <div className="mt-1 text-lg font-bold text-black">$19.99/yr</div>
          </button>
          <button
            type="button"
            onClick={() => setInterval("month")}
            className={cn(
              "rounded-xl border px-3.5 py-3 text-left transition-colors",
              interval === "month"
                ? "border-[#0071E3] bg-white"
                : "border-black/10 bg-white hover:border-black/25",
            )}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wide text-black/60">
              Monthly
            </span>
            <div className="mt-1 text-lg font-bold text-black">$9.99/mo</div>
          </button>
        </div>

        {/* CTA */}
        <div className="mt-5">
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-[#0071E3] text-white text-sm sm:text-base font-medium hover:bg-[#3D8FE8] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {submitting ? "Starting checkout..." : "Upgrade to Pro"}
          </button>
          <p className="text-center text-[11px] text-black/50 mt-2.5">
            Cancel anytime.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
