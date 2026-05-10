import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "About - caltodo",
  description:
    "caltodo pulls every assignment from every platform into one place so you stop missing deadlines that were hiding in plain sight.",
  alternates: { canonical: "/about" },
};

/**
 * Static About page — heading, two paragraphs, location pin, single Get started CTA.
 * Nav is provided by the (landing) layout so this page only renders content.
 */
export default function AboutPage() {
  return (
    <main className="flex-1 px-6 lg:px-10">
      <div className="max-w-2xl mx-auto pt-12 sm:pt-16 pb-24">
        <h1
          className="text-3xl sm:text-4xl font-bold text-black mb-6 tracking-tight animate-fade-up"
          style={{ animationDelay: "0ms" }}
        >
          About
        </h1>

        <p
          className="text-sm sm:text-xl font-sans font-medium leading-snug text-black mb-3 animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          We built <span className="font-bold">caltodo</span> because we kept missing deadlines that were hiding in plain sight.
        </p>
        <p
          className="text-sm sm:text-xl font-sans font-medium leading-snug text-black mb-3 animate-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          Assignments scattered across Canvas, Gradescope, and a syllabus PDF you opened once in week one.
        </p>
        <p
          className="text-sm sm:text-xl font-sans font-medium leading-snug text-black mb-3 animate-fade-up"
          style={{ animationDelay: "280ms" }}
        >
          Tabs you forgot to refresh.
        </p>
        <p
          className="text-sm sm:text-xl font-sans font-medium leading-snug text-black mb-6 animate-fade-up"
          style={{ animationDelay: "360ms" }}
        >
          The 11:58pm realization that something was due two minutes ago.
        </p>
        <p
          className="text-sm sm:text-xl font-sans font-medium leading-snug text-black mb-3 animate-fade-up"
          style={{ animationDelay: "440ms" }}
        >
          caltodo pulls every assignment from every platform into one place so nothing falls through the cracks.
        </p>
        <p
          className="text-sm sm:text-xl font-sans font-medium leading-snug text-black mb-6 animate-fade-up"
          style={{ animationDelay: "520ms" }}
        >
          Built by students, for students, designed by people who&rsquo;ve been on the wrong side of every late-night scramble and missed quiz.
        </p>

        <div
          className="flex items-center gap-2 text-sm font-bold text-black mb-10 animate-fade-up"
          style={{ animationDelay: "600ms" }}
        >
          <MapPin size={16} strokeWidth={2.5} />
          <span>Berkeley, California</span>
        </div>

        <Link
          href="/login?signup=true"
          className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-[#0071E3] text-white text-sm sm:text-base font-medium hover:bg-[#3D8FE8] transition-colors duration-200 animate-fade-up"
          style={{ animationDelay: "680ms" }}
        >
          Get started
          <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      </div>
    </main>
  );
}
