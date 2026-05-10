import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "About - caltodo",
  description: "caltodo is a free, non-profit planner built by students, for students.",
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
          className="text-sm sm:text-xl font-sans font-medium leading-snug text-black mb-4 animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          At <span className="font-bold">caltodo</span>, we&rsquo;re building a free, non-profit planner that pulls every assignment from your school&rsquo;s platforms into one place. We exist so students don&rsquo;t have to pay to keep track of their own homework.
        </p>
        <p
          className="text-sm sm:text-xl font-sans font-medium leading-snug text-black mb-6 animate-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          caltodo is, and always will be, free for students. Designed and built by students, for students.
        </p>

        <div
          className="flex items-center gap-2 text-sm font-bold text-black mb-10 animate-fade-up"
          style={{ animationDelay: "280ms" }}
        >
          <MapPin size={16} strokeWidth={2.5} />
          <span>UC Berkeley · Berkeley, California</span>
        </div>

        <Link
          href="/login?signup=true"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-lg bg-[#0071E3] text-white hover:bg-[#3D8FE8] transition-colors animate-fade-up"
          style={{ animationDelay: "360ms" }}
        >
          Get started
          <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      </div>
    </main>
  );
}
