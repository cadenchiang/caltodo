import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "About - caltodo",
  description:
    "caltodo pulls every assignment from every platform into one place so you stop missing deadlines that were hiding in plain sight.",
  alternates: { canonical: "/about" },
};

/**
 * Static About page — heading, story paragraphs, a "Made by" byline (X handle
 * plus headshot linking to LinkedIn), location pin, and a single Get started CTA.
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
          I built <span className="font-bold">caltodo</span> because I kept missing deadlines that were hiding in plain sight.
        </p>
        <p
          className="text-sm sm:text-xl font-sans font-medium leading-snug text-black mb-3 animate-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          Assignments scattered across Canvas, Gradescope, and a syllabus PDF I opened once in week one. Then the 11:58pm realization that something was due two minutes ago.
        </p>
        <p
          className="text-sm sm:text-xl font-sans font-medium leading-snug text-black mb-6 animate-fade-up"
          style={{ animationDelay: "280ms" }}
        >
          caltodo pulls every assignment from every platform into one place, so nothing falls through the cracks.
        </p>

        {/* Byline — one quiet line: the handle carries the X link, the face
            carries the LinkedIn one, so neither needs a loose icon beside it. */}
        <div
          className="flex items-center gap-2 mb-8 animate-fade-up"
          style={{ animationDelay: "360ms" }}
        >
          <span className="text-sm sm:text-base font-medium text-black/45">
            Made by
          </span>
          <a
            href="https://x.com/cadenchiangg"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Caden Chiang on X"
            className="text-sm sm:text-base font-bold text-black hover:text-[#0e89d6] transition-colors duration-200"
          >
            @cadenchiangg
          </a>
          <a
            href="https://www.linkedin.com/in/cadenchiang"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Caden Chiang on LinkedIn"
            className="shrink-0 w-7 h-7 rounded-full overflow-hidden bg-neutral-100 ring-1 ring-black/[0.06] hover:ring-[#0e89d6]/40 transition-shadow duration-200 flex items-center justify-center"
          >
            {/* The source is a tight 224x224 crop, so there is no more photo
                to reveal; rendering it a little smaller inside the circle is
                what stops the face from filling the whole dot. */}
            <Image
              src="/caden-chiang.jpg"
              alt="Caden Chiang"
              width={28}
              height={28}
              className="rounded-full object-cover object-[center_32%] scale-[0.82]"
            />
          </a>
        </div>

        <div
          className="flex items-center gap-2 text-sm font-bold text-black mb-10 animate-fade-up"
          style={{ animationDelay: "440ms" }}
        >
          <MapPin size={16} strokeWidth={2.5} />
          <span>Berkeley, California</span>
        </div>

        <Link
          href="/login?signup=true"
          className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-[#0e89d6] text-white text-sm sm:text-base font-medium hover:bg-[#3D8FE8] transition-colors duration-200 animate-fade-up"
          style={{ animationDelay: "520ms" }}
        >
          Get started
          <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      </div>
    </main>
  );
}
