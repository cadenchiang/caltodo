import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { GUIDES, getGuide } from "@/lib/seo/guides";
import { buttonClasses } from "@/components/ui/button-recipe";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Unknown slugs are 404s at the routing layer, so neither generateMetadata
 * nor the page (and its JSON-LD script) runs on the not-found path.
 */
export const dynamicParams = false;

/**
 * Pre-renders every guide at build time.
 *
 * @returns One route param object per registered guide.
 */
export function generateStaticParams(): { slug: string }[] {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

/**
 * Builds per-guide metadata so each page has its own title, description, and
 * canonical URL rather than inheriting the site defaults.
 *
 * @param props - Route props carrying the slug param
 * @returns Metadata for the guide, or empty metadata when the slug is unknown
 *          (the page itself renders notFound()).
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};

  const url = `/guides/${guide.slug}`;
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: url },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
    },
  };
}

/**
 * Renders a single guide from the GUIDES registry.
 *
 * Emits Article JSON-LD alongside the prose so the page is eligible for rich
 * results. Unknown slugs render the 404 page.
 */
export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    dateModified: guide.updated,
    mainEntityOfPage: `https://caltodo.me/guides/${guide.slug}`,
    publisher: { "@id": "https://caltodo.me/#organization" },
  };

  return (
    <main className="flex-1 px-6 lg:px-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-2xl mx-auto pt-12 sm:pt-16 pb-24">
        <Link
          href="/guides"
          className="inline-flex items-center min-h-11 -my-2 py-2 pr-2 text-sm font-semibold text-muted-foreground hover:text-foreground rounded"
        >
          Guides
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4 tracking-tight">
          {guide.title}
        </h1>
        <p className="text-sm sm:text-xl font-sans font-medium leading-snug text-foreground mb-10">
          {guide.intro}
        </p>

        {guide.sections.map((section) => (
          <section key={section.heading} className="mb-9">
            <h2 className="text-lg sm:text-2xl font-bold text-foreground mb-3 tracking-tight">
              {section.heading}
            </h2>
            {section.body.map((p) => (
              <p
                key={p}
                className="text-sm sm:text-base font-sans font-medium leading-relaxed text-muted-foreground mb-3"
              >
                {p}
              </p>
            ))}
            {section.steps && (
              <ol className="list-decimal pl-5 mt-3 flex flex-col gap-2">
                {section.steps.map((step) => (
                  <li
                    key={step}
                    className="text-sm sm:text-base font-sans font-medium leading-relaxed text-muted-foreground"
                  >
                    {step}
                  </li>
                ))}
              </ol>
            )}
          </section>
        ))}

        <Link
          href="/login"
          className={buttonClasses("inverted", "lg")}
        >
          Get started free <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </article>
    </main>
  );
}
