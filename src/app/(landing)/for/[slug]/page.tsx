import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SCHOOLS, getSchool } from "@/lib/seo/schools";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Pre-renders a page for every school in the registry.
 *
 * @returns One route param object per school.
 */
export function generateStaticParams(): { slug: string }[] {
  return SCHOOLS.map((s) => ({ slug: s.slug }));
}

/**
 * Builds per-school metadata targeting that school's own Canvas queries.
 *
 * @param props - Route props carrying the slug param
 * @returns Metadata for the school, or empty metadata when the slug is unknown
 *          (the page itself renders notFound()).
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const school = getSchool(slug);
  if (!school) return {};

  const title = `caltodo for ${school.name}`;
  const description = `Sync ${school.name} Canvas assignments, Gradescope deadlines, and your syllabus into one calendar and to-do list. Free for students.`;
  const url = `/for/${school.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
  };
}

/**
 * Renders a school-specific landing page.
 *
 * The school's real Canvas hostname drives the setup instructions, which is
 * what distinguishes these pages from one another. Unknown slugs 404.
 */
export default async function SchoolPage({ params }: PageProps) {
  const { slug } = await params;
  const school = getSchool(slug);
  if (!school) notFound();

  return (
    <main className="flex-1 px-6 lg:px-10">
      <div className="max-w-2xl mx-auto pt-12 sm:pt-16 pb-24">
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4 tracking-tight">
          caltodo for {school.name}
        </h1>
        <p className="text-sm sm:text-xl font-sans font-medium leading-snug text-black mb-10">
          Every {school.name} assignment from Canvas, Gradescope, and your
          syllabus, in one list that stays up to date on its own.
        </p>

        <section className="mb-9">
          <h2 className="text-lg sm:text-2xl font-bold text-black mb-3 tracking-tight">
            Connecting {school.name} Canvas
          </h2>
          <p className="text-sm sm:text-base font-sans font-medium leading-relaxed text-black/70 mb-3">
            {school.name} runs Canvas at{" "}
            <span className="font-semibold text-black">{school.canvasHost}</span>.
            caltodo reads your personal calendar feed from there, so it sees
            every course you are enrolled in without needing your password.
          </p>
          <ol className="list-decimal pl-5 mt-3 flex flex-col gap-2">
            <li className="text-sm sm:text-base font-sans font-medium leading-relaxed text-black/70">
              Sign in at {school.canvasHost} and open Calendar.
            </li>
            <li className="text-sm sm:text-base font-sans font-medium leading-relaxed text-black/70">
              Click &quot;Calendar Feed&quot; at the bottom right and copy the URL.
            </li>
            <li className="text-sm sm:text-base font-sans font-medium leading-relaxed text-black/70">
              Paste it into caltodo during setup. Your assignments import
              immediately.
            </li>
          </ol>
        </section>

        <section className="mb-9">
          <h2 className="text-lg sm:text-2xl font-bold text-black mb-3 tracking-tight">
            The deadlines Canvas leaves out
          </h2>
          <p className="text-sm sm:text-base font-sans font-medium leading-relaxed text-black/70 mb-3">
            A Canvas feed carries titles and due dates. It does not carry
            Gradescope, which many {school.name} courses use for problem sets
            and exams, and it does not carry anything that exists only in a
            syllabus schedule.
          </p>
          <p className="text-sm sm:text-base font-sans font-medium leading-relaxed text-black/70">
            caltodo reads all three and merges them, with submission status
            attached, so what you see is the actual workload rather than the
            part of it Canvas happens to know about.
          </p>
        </section>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold"
        >
          Get started free <ArrowRight className="w-4 h-4" />
        </Link>

        <p className="text-xs text-black/40 mt-8">
          caltodo is not affiliated with or endorsed by {school.name}. Canvas
          and Gradescope are trademarks of their respective owners.
        </p>
      </div>
    </main>
  );
}
