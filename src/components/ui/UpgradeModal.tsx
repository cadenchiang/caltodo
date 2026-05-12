"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  /** Whether the modal is visible. */
  open: boolean;
  /** Called when the user closes the modal without upgrading. */
  onClose: () => void;
  /**
   * Drives the headline copy. Defaults to a generic "Upgrade to Premium".
   * The feature key only changes the title — the body (feature checklist
   * and pricing) is shared, since Caltodo Premium is a single bundle.
   */
  feature?: "board" | "gcal" | "syllabus" | "themes" | "generic";
}

const FEATURE_TITLE: Record<NonNullable<Props["feature"]>, string> = {
  board: "Unlock your board",
  gcal: "Unlock Calendar sync",
  syllabus: "Unlock unlimited syllabi",
  themes: "Unlock themes",
  generic: "Upgrade to Premium",
};

/**
 * Tight feature list — four bullets, the most-asked-about ones. Keeping it
 * short reduces visual density and makes the modal scannable in one glance.
 */
const PREMIUM_FEATURES = [
  "Personalized board with widgets",
  "Google Calendar two-way sync",
  "Unlimited syllabus uploads",
  "All themes & smart notifications",
];

const PRICING = {
  month: { label: "$9.99", suffix: "/mo" },
  year: { label: "$19.99", suffix: "/yr" },
} as const;

const CLOSE_ANIM_MS = 220;

/**
 * Premium upgrade modal. Light cream card (matches landing pricing language),
 * feature checklist, two-tab plan selector, amber Upgrade Now CTA, and a
 * terms checkbox that gates the submit. Adapts to dark mode.
 *
 * On submit, POSTs to /api/stripe/checkout. If Stripe is not configured but
 * the response advertises devGrantAvailable, falls back to /api/dev/grant-pro
 * so localhost testing works without real keys.
 */
export default function UpgradeModal({ open, onClose, feature = "generic" }: Props) {
  const [interval, setInterval] = useState<"month" | "year">("year");
  const [acceptedTerms, setAcceptedTerms] = useState(true);
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
   * Hits /api/stripe/checkout to get a hosted-checkout URL and redirects.
   * On a 503 with devGrantAvailable (localhost without Stripe keys), falls
   * back to /api/dev/grant-pro so the upgrade flow stays testable without
   * configuring real Stripe. Surfaces the API's message on failure.
   */
  async function handleUpgrade() {
    if (!acceptedTerms || submitting) return;
    setSubmitting(true);
    try {
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

  if (!open || typeof document === "undefined") return null;

  const title = FEATURE_TITLE[feature];
  const active = PRICING[interval];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center px-3 sm:px-4 py-3 sm:py-6">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm",
          closing ? "animate-announce-backdrop-out" : "animate-announce-backdrop-in",
        )}
        onClick={submitting ? undefined : requestClose}
      />

      {/* Card. Matches the landing pricing card: cream surface, black text,
          bold plan name with blue "Popular" pill, solid bullets, black CTA.
          A single SF Pro font-family is applied to the root so every label
          inside the modal reads with the same typeface. */}
      <div
        className={cn(
          "relative w-full max-w-sm max-h-[92dvh] overflow-y-auto rounded-3xl bg-[#f6f5f4] dark:bg-zinc-900 text-black dark:text-white p-6 sm:p-7 ring-1 ring-black/5 dark:ring-white/[0.06]",
          "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.22),0_8px_20px_-4px_rgba(0,0,0,0.10)]",
          closing ? "animate-announce-card-out" : "animate-announce-card-in",
        )}
        style={{
          fontFamily:
            '-apple-system, "SF Pro Display", BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <button
          type="button"
          onClick={requestClose}
          disabled={submitting}
          className="absolute top-3 right-3 p-1.5 text-black/45 dark:text-white/45 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors disabled:opacity-40"
          aria-label="Close"
        >
          <X size={18} strokeWidth={2} />
        </button>

        {/* Top icon */}
        <Sparkles size={28} className="text-black dark:text-white mb-5" strokeWidth={1.75} aria-hidden />

        {/* Title + Popular pill */}
        <div className="flex items-center gap-2.5 mb-3 pr-8">
          <h2 className="text-lg sm:text-xl font-extrabold text-black dark:text-white leading-none tracking-tight">
            {title}
          </h2>
          <span className="px-2.5 py-1 rounded-full bg-[#0e89d6] text-white text-xs font-bold leading-none">
            Popular
          </span>
        </div>

        {/* Feature list — solid dot bullets, matching the pricing card */}
        <ul className="mt-4 space-y-2.5">
          {PREMIUM_FEATURES.map((label) => (
            <li key={label} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-black/70 dark:bg-white/70 shrink-0 mt-[8px]" aria-hidden />
              <span className="text-base text-black/80 dark:text-white/80 leading-snug">{label}</span>
            </li>
          ))}
        </ul>

        {/* Plan selector — segmented, blue accent for the active option */}
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setInterval("year")}
            aria-pressed={interval === "year"}
            className={cn(
              "rounded-xl border px-3.5 py-3 text-left transition-colors",
              interval === "year"
                ? "border-[#0e89d6] bg-[#0e89d6]/[0.08]"
                : "border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] hover:border-black/25 dark:hover:border-white/25",
            )}
          >
            <div className="text-xs text-black/70 dark:text-white/70">Yearly</div>
            <div className="mt-0.5 text-sm font-bold text-black dark:text-white">
              {PRICING.year.label}
              <span className="font-normal text-black/60 dark:text-white/60">{PRICING.year.suffix}</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setInterval("month")}
            aria-pressed={interval === "month"}
            className={cn(
              "rounded-xl border px-3.5 py-3 text-left transition-colors",
              interval === "month"
                ? "border-[#0e89d6] bg-[#0e89d6]/[0.08]"
                : "border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] hover:border-black/25 dark:hover:border-white/25",
            )}
          >
            <div className="text-xs text-black/70 dark:text-white/70">Monthly</div>
            <div className="mt-0.5 text-sm font-bold text-black dark:text-white">
              {PRICING.month.label}
              <span className="font-normal text-black/60 dark:text-white/60">{PRICING.month.suffix}</span>
            </div>
          </button>
        </div>

        {/* CTA — blue pill matching the "Popular" accent. */}
        <button
          type="button"
          onClick={handleUpgrade}
          disabled={submitting || !acceptedTerms}
          className={cn(
            "mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-medium text-sm text-white transition-colors",
            "bg-[#0e89d6] hover:bg-[#0c79bf]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          {submitting ? "Starting checkout…" : `Upgrade for ${active.label}${active.suffix}`}
          {!submitting && <ChevronRight size={15} strokeWidth={2.5} />}
        </button>

        {/* Fine print. No checkbox: clicking Upgrade implies acceptance,
            consistent with the Stripe-hosted checkout that follows. */}
        <p className="mt-3 text-xs text-black/50 dark:text-white/50 leading-relaxed">
          By upgrading you accept the{" "}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-black dark:hover:text-white"
          >
            Pricing Terms
          </a>
          . Auto-renews; cancel anytime in Settings.
        </p>
      </div>
    </div>,
    document.body,
  );
}
