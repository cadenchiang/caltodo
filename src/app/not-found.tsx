import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import LandingShell from "@/components/landing/LandingShell";
import { buttonClasses } from "@/components/ui/button-recipe";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/**
 * Branded 404 for every unknown route, including unknown /guides/* and
 * /for/* slugs (those routes set dynamicParams = false so an unknown slug
 * lands here without running the page). Rendered inside the landing shell
 * so it has the same nav and footer as every other public page.
 */
export default function NotFound() {
  return (
    <LandingShell>
      <main className="flex-1 px-6 lg:px-10">
        <div className="max-w-2xl mx-auto pt-16 sm:pt-24 pb-24">
          <p className="text-sm font-medium text-muted-foreground mb-2">404</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">Page not found</h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
            That link does not go anywhere. It may have moved, or the address may have a typo.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className={buttonClasses("inverted", "lg")}>
              Back to home
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/guides" className={buttonClasses("secondary", "lg")}>
              Read the guides
            </Link>
          </div>
        </div>
      </main>
    </LandingShell>
  );
}
