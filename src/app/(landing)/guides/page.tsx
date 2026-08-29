import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GUIDES } from "@/lib/seo/guides";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Practical guides to syncing Canvas, Gradescope, and syllabus deadlines into one calendar and to-do list.",
  alternates: { canonical: "/guides" },
};

/**
 * Index of every published guide.
 *
 * Reads the GUIDES registry so a new guide appears here, in the sitemap, and
 * at its own route from a single declaration. Nav comes from the (landing)
 * layout, so this renders content only.
 */
export default function GuidesIndexPage() {
  return (
    <main className="flex-1 px-6 lg:px-10">
      <div className="max-w-2xl mx-auto pt-12 sm:pt-16 pb-24">
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-3 tracking-tight">
          Guides
        </h1>
        <p className="text-sm sm:text-xl font-sans font-medium leading-snug text-black/70 mb-10">
          How to get every deadline out of Canvas, Gradescope, and your syllabus
          and into one place.
        </p>

        <ul className="flex flex-col gap-6">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}`} className="group block">
                <h2 className="text-lg sm:text-xl font-bold text-black tracking-tight group-hover:underline">
                  {g.title}
                </h2>
                <p className="text-sm sm:text-base font-sans font-medium leading-snug text-black/60 mt-1">
                  {g.description}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-black mt-2">
                  Read <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
