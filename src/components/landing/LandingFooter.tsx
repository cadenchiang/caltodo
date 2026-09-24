import Link from "next/link";
import { BRAND } from "@/lib/copy";

/** Footer links, in order. Each renders with a 44px tall tap target. */
export const FOOTER_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: "Guides", href: "/guides" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

/** Shared link recipe: readable gray, padded to a 44px target without larger type. */
const FOOTER_LINK = "inline-flex items-center min-h-11 px-2 -mx-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded";

/**
 * Footer for every landing page, rendered once by the landing layout.
 * Copyright, the legal and guides links, and the LinkedIn mark.
 */
export default function LandingFooter() {
  return (
    <footer className="bg-white px-6 sm:px-10 py-5 border-t border-border">
      <div className="max-w-5xl mx-auto flex items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-base font-medium text-foreground">{BRAND} &copy; 2026</p>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-4">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={FOOTER_LINK}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <a
          href="https://www.linkedin.com/company/caltodo/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${BRAND} on LinkedIn`}
          className="inline-flex items-center justify-center w-11 h-11 -m-2 rounded-full text-foreground hover:text-muted-foreground transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </a>
      </div>
    </footer>
  );
}
