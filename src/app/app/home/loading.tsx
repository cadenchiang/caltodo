import Image from "next/image";
import { Crown, ChevronRight, X } from "lucide-react";

/**
 * Instant route-segment placeholder for /app/home.
 *
 * Next renders this the moment the user clicks the sidebar's Home link,
 * before page.tsx's server-side entitlement check has resolved. We render
 * the locked-card preview verbatim because:
 *
 *   - Free users (the majority of the time the gate fires) see the exact
 *     final UI immediately — no skeleton flash, no "loading…" state.
 *   - Pro users see a brief locked-card flash before HomeBoard hydrates.
 *     Acceptable tradeoff: the entitlement cache makes that flash ~50ms,
 *     and the instant feel for free users matters more.
 *
 * Keep this file in sync with the Mode A card in BoardLockedScreen.tsx
 * (preview screenshot + Premium badge + title + subtitle + CTA).
 */
export default function HomeLoading() {
  return (
    <div className="relative h-full overflow-hidden -mx-4 md:-mx-10 -mt-4 md:-mt-10 -mb-4 md:-mb-10">
      {/* Background preview, static image + CSS blur. Paints on first render
          so the lock state never shows an empty white backdrop. */}
      <div aria-hidden className="absolute inset-0 pointer-events-none select-none blur-md scale-[1.02]">
        <Image
          src="/app-screenshot-board-preview.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-top"
          priority
        />
      </div>

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

          <div
            aria-hidden
            className="absolute top-3 right-3 z-10 inline-flex items-center justify-center w-7 h-7 rounded-full bg-black/30 text-white/90"
          >
            <X size={15} strokeWidth={2.25} />
          </div>

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

            <div className="mt-5 w-full inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#f6a623] text-white text-[14px] font-semibold tracking-tight shadow-[0_8px_18px_-8px_rgba(246,166,35,0.5)]">
              Upgrade Now
              <ChevronRight size={15} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
