import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** One numbered section of a legal page. */
export interface LegalSection {
  title: string;
  body: ReactNode;
}

/** Longest entrance delay on the page, so late sections never sit invisible. */
export const MAX_ENTRANCE_DELAY_MS = 400;

/**
 * Entrance delay for the nth section, capped at MAX_ENTRANCE_DELAY_MS.
 *
 * @param index - Section position, 0-based
 * @returns Delay in ms
 */
export function sectionDelayMs(index: number): number {
  return Math.min(MAX_ENTRANCE_DELAY_MS, 160 + index * 80);
}

/** Inline link recipe for legal copy (accent, underlined). */
export const LEGAL_LINK = "text-blue-500 underline underline-offset-2 hover:text-blue-600 rounded";

export interface LegalPageProps {
  /** Page heading, sentence case ("Privacy policy"). */
  title: string;
  /** Human-readable date shown under the heading. */
  lastUpdated: string;
  /** Sections in order. */
  sections: ReadonlyArray<LegalSection>;
}

/**
 * Shared shell for /privacy and /terms: back link, heading, last-updated
 * line, and the numbered sections with a short staggered entrance.
 *
 * @param title - Heading text
 * @param lastUpdated - Date line, e.g. "September 23, 2026"
 * @param sections - Section list
 * @remarks The back link pads to a 44px tap target; the landing layout is
 *          force-light so tokens resolve to their light values here.
 */
export default function LegalPage({ title, lastUpdated, sections }: LegalPageProps) {
  return (
    <main className="flex-1 px-6 lg:px-10">
      <div className="max-w-2xl mx-auto pt-12 sm:pt-16 pb-24">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 min-h-11 -my-2 py-2 pr-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors animate-fade-up rounded"
        >
          <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
          Back
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 tracking-tight animate-fade-up">{title}</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mb-10 animate-fade-up" style={{ animationDelay: "80ms" }}>
          Last updated {lastUpdated}
        </p>

        <div className="space-y-7 text-sm sm:text-base text-foreground leading-relaxed">
          {sections.map((section, i) => (
            <section key={section.title} className="animate-fade-up" style={{ animationDelay: `${sectionDelayMs(i)}ms` }}>
              <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 tracking-tight">{section.title}</h2>
              <div>{section.body}</div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
