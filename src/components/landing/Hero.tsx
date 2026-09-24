"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { RefreshCw, CalendarDays, LayoutGrid, ArrowRight } from "lucide-react";
import SyncedCount from "@/components/landing/SyncedCount";
import { COUNT_SETTLED_MS, EYEBROW_DELAY_MS } from "./synced-count-timing";
import { BRAND } from "@/lib/copy";

/**
 * Entrance delays, in ms. Every first-paint element arrives within 400 ms so
 * the CTA is never invisible for a second and a half; the global
 * prefers-reduced-motion rule in globals.css collapses them to nothing.
 */
export const HERO_DELAYS = {
  cluster: 200,
  eyebrow: EYEBROW_DELAY_MS,
  heading: 300,
  subtitle: 350,
  cta: 400,
  mockup: 400,
} as const;
import GoogleOneTap from "@/components/auth/GoogleOneTap";
import FadeIn from "@/components/landing/FadeIn";
import SupportedPlatforms from "@/components/landing/SupportedPlatforms";
import { useIsLoggedIn } from "@/hooks/useIsLoggedIn";


interface HeroProps {
  /**
   * Optional override. Normally left undefined; the hero checks the session
   * client-side so the landing page can stay statically generated.
   */
  loggedIn?: boolean;
  /** Server-fetched user count for immediate render. */
  initialUserCount?: number;
  /** Total assignments synced across all users, for the eyebrow line. */
  initialAssignmentCount?: number;
}

/**
 * Hero landing page.
 * Shows login/signup buttons for unauthenticated users,
 * or profile picture + dashboard link for logged-in users.
 */
export default function Hero({ loggedIn: loggedInProp, initialUserCount, initialAssignmentCount }: HeroProps) {
  // The landing page renders Hero without this prop, so the CTA read "Get
  // started" even for a signed-in visitor arriving via the sidebar logo. Same
  // client-side check the nav above it already does.
  const loggedIn = useIsLoggedIn(loggedInProp);
  const [pastHero, setPastHero] = useState(false);
  const userCount = initialUserCount ?? null;
  const assignmentCount = initialAssignmentCount ?? 0;

  const heroEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = heroEndRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // When the home page mounts, scroll to a pending section if one was stashed
  // by LandingNav (off-route → home navigation) or if the URL has a hash.
  // Next.js's App Router does not honor hash anchors on client-side
  // navigations; sessionStorage is the reliable signal between routes.
  useEffect(() => {
    if (typeof window === "undefined") return;

    let pendingId: string | null = null;
    try {
      pendingId = sessionStorage.getItem("caltodo_pending_scroll");
      if (pendingId) sessionStorage.removeItem("caltodo_pending_scroll");
    } catch {
      /* sessionStorage may throw in private-browsing */
    }
    if (!pendingId) {
      const hash = window.location.hash;
      if (hash && hash.length > 1) pendingId = hash.slice(1);
    }
    if (!pendingId) return;

    // Wait one frame so the target element is mounted, then a second beat so
    // the FadeIn wrappers + image loads don't shift the layout under us.
    const targetId = pendingId;
    const handle = window.setTimeout(() => {
      const target = document.getElementById(targetId);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(handle);
  }, []);

  const mockupRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* Google One Tap sign-in prompt (desktop only) */}
      <GoogleOneTap />

      {/* Hero content */}
      <main className="flex-1 flex flex-col items-center px-6 lg:px-10 relative pb-8 sm:pb-10">
        {/* Above-the-fold section: fills viewport on mobile, normal flow on desktop.
            Uses svh (small viewport height) not dvh: on iOS Safari the dynamic
            viewport height changes as the address bar collapses on scroll, which
            would resize this section mid-scroll and read as jank. svh is stable. */}
        <div className="min-h-[calc(100svh-4.5rem)] sm:min-h-0 flex flex-col items-center justify-center sm:justify-start w-full relative">
          {/* Logo with integration icons behind */}
          <div className="flex flex-col items-center mt-6 sm:mt-14 mb-3 sm:mb-4">
            <div className="relative flex items-end justify-center" style={{ gap: 0 }}>
              {/* Canvas: outer left, highest */}
              <div
                className="group relative cursor-pointer flex flex-col items-center -mr-1 sm:-mr-3 cluster-emerge"
                style={{
                  marginBottom: "20px",
                  animationDelay: `${HERO_DELAYS.cluster}ms`,
                  ["--cluster-x" as string]: "60px",
                  ["--cluster-y" as string]: "8px",
                }}
              >
                <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-[10px] sm:rounded-[14px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)] flex items-center justify-center relative z-10">
                  <img src="/canvas-logo.png" alt="Canvas" className="w-[70%] h-[70%] object-contain" />
                </div>
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-3 rounded-md bg-black text-white text-xs font-medium px-2 py-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 z-50 whitespace-nowrap">
                  Canvas
                </div>
              </div>
              {/* Gradescope: inner left, mid */}
              <div
                className="group relative cursor-pointer flex flex-col items-center -mr-1 sm:-mr-3 cluster-emerge"
                style={{
                  marginBottom: "10px",
                  animationDelay: `${HERO_DELAYS.cluster}ms`,
                  ["--cluster-x" as string]: "30px",
                }}
              >
                <svg width="64" height="64" viewBox="0 0 14 14" fill="none" className="w-11 h-11 sm:w-16 sm:h-16 relative z-10">
                  <rect width="14" height="14" rx="3" fill="#3AADA8" />
                  <rect x="1.5" y="8.5" width="2" height="3.5" rx="0.5" fill="white" />
                  <rect x="4.5" y="6.5" width="2" height="5.5" rx="0.5" fill="white" />
                  <rect x="7.5" y="4.5" width="2" height="7.5" rx="0.5" fill="white" />
                  <rect x="10.5" y="2.5" width="2" height="9.5" rx="0.5" fill="white" />
                </svg>
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-3 rounded-md bg-black text-white text-xs font-medium px-2 py-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 z-50 whitespace-nowrap">
                  Gradescope
                </div>
              </div>
              {/* caltodo: center, lowest (bottom of V). No wrapping div so
                  the calendar shape sits directly on the page background
                  (no inherited bg or z-context). The cluster animation is
                  applied to the Image element itself instead. */}
              <Image
                src="/logo.png"
                alt="caltodo"
                width={512}
                height={536}
                priority
                sizes="(min-width: 640px) 96px, 48px"
                className="h-14 sm:h-24 w-auto relative z-20 cluster-center-in"
                style={{ animationDelay: "0ms" }}
              />
              {/* Pensive: inner right, mid */}
              <div
                className="group relative cursor-pointer flex flex-col items-center -ml-1 sm:-ml-3 z-10 cluster-emerge"
                style={{
                  marginBottom: "10px",
                  animationDelay: `${HERO_DELAYS.cluster}ms`,
                  ["--cluster-x" as string]: "-30px",
                }}
              >
                <div className="relative w-11 h-11 sm:w-16 sm:h-16 z-10">
                  <div className="absolute inset-[10%] rounded-full bg-white" />
                  <img src="/pensieve-logo.png" alt="Pensive" className="w-full h-full object-contain relative" />
                </div>
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-3 rounded-md bg-black text-white text-xs font-medium px-2 py-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 z-50 whitespace-nowrap">
                  Pensive
                </div>
              </div>
              {/* Google Calendar: outer right, highest */}
              <div
                className="group relative cursor-pointer flex flex-col items-center -ml-1 sm:-ml-3 cluster-emerge"
                style={{
                  marginBottom: "20px",
                  animationDelay: `${HERO_DELAYS.cluster}ms`,
                  ["--cluster-x" as string]: "-60px",
                  ["--cluster-y" as string]: "8px",
                }}
              >
                <svg width="64" height="64" viewBox="0 0 122.88 122.88" className="w-11 h-11 sm:w-16 sm:h-16 relative z-10">
                  <polygon points="93.78,29.1 29.1,29.1 29.1,93.78 93.78,93.78" fill="#fff" />
                  <polygon points="93.78,122.88 122.88,93.78 93.78,93.78" fill="#EA4335" />
                  <polygon points="122.88,29.1 93.78,29.1 93.78,93.78 122.88,93.78" fill="#FBBC04" />
                  <polygon points="93.78,93.78 29.1,93.78 29.1,122.88 93.78,122.88" fill="#34A853" />
                  <path d="M0,93.78v19.4c0,5.36,4.34,9.7,9.7,9.7h19.4v-29.1H0z" fill="#188038" />
                  <path d="M122.88,29.1V9.7c0-5.36-4.34-9.7-9.7-9.7h-19.4v29.1H122.88z" fill="#1967D2" />
                  <path d="M93.78,0H9.7C4.34,0,0,4.34,0,9.7v84.08h29.1V29.1h64.67V0z" fill="#4285F4" />
                  <path d="M42.37,79.27c-2.42-1.63-4.09-4.02-5-7.17l5.61-2.31c0.51,1.94,1.4,3.44,2.67,4.51c1.26,1.07,2.8,1.59,4.59,1.59c1.84,0,3.41-0.56,4.73-1.67c1.32-1.12,1.98-2.54,1.98-4.26c0-1.76-0.7-3.2-2.09-4.32c-1.39-1.12-3.14-1.67-5.22-1.67H46.4v-5.55h2.91c1.79,0,3.31-0.48,4.54-1.46c1.23-0.97,1.84-2.3,1.84-3.99c0-1.5-0.55-2.7-1.65-3.6s-2.49-1.35-4.18-1.35c-1.65,0-2.96,0.44-3.93,1.32c-0.97,0.88-1.7,2-2.12,3.24l-5.55-2.31c0.74-2.09,2.09-3.93,4.07-5.52c1.98-1.59,4.51-2.39,7.58-2.39c2.27,0,4.32,0.44,6.13,1.32c1.81,0.88,3.23,2.1,4.26,3.65c1.03,1.56,1.54,3.31,1.54,5.25c0,1.98-0.48,3.65-1.43,5.03c-0.95,1.37-2.13,2.43-3.52,3.16v0.33c1.79,0.74,3.36,1.96,4.51,3.52c1.17,1.58,1.76,3.46,1.76,5.66c0,2.2-0.56,4.16-1.67,5.88c-1.12,1.72-2.66,3.08-4.62,4.07c-1.96,0.99-4.17,1.49-6.62,1.49C47.41,81.72,44.79,80.91,42.37,79.27z" fill="#1A73E8" />
                  <path d="M76.83,51.43l-6.16,4.45l-3.08-4.67l11.05-7.97h4.24v37.6h-6.05V51.43z" fill="#1A73E8" />
                </svg>
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-3 rounded-md bg-black text-white text-xs font-medium px-2 py-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 z-50 whitespace-nowrap">
                  Google Calendar
                </div>
              </div>
            </div>

            {/* Eyebrow: the count of deadlines actually pulled in says more
                than the product name. Falls back to the name when the count is
                unavailable, so a Supabase blip never leaves a bare "0". */}
            <p
              className="mt-3 sm:mt-5 text-sm sm:text-base font-semibold tracking-tight animate-fade-up"
              style={{ animationDelay: `${HERO_DELAYS.eyebrow}ms` }}
            >
              {assignmentCount > 0 ? (
                // A pill, gray on gray: a quiet status chip under the logos
                // rather than a second headline competing with "Stay ahead."
                <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3.5 py-1.5 text-muted-foreground">
                  {/* A live indicator: the count is real and still climbing,
                      and a solid green dot is the idiom for "happening now".
                      It arrives only once the digits have settled, so it
                      marks a figure that has finished arriving; fade-up's
                      fill-mode keeps it invisible until its delay. */}
                  <span
                    aria-hidden
                    className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-fade-up"
                    style={{ animationDelay: `${COUNT_SETTLED_MS}ms` }}
                  />
                  <span>
                    <SyncedCount count={assignmentCount} />
                    {/* The count is what has synced so far, not a cap. */}
                    {"+ assignments synced"}
                  </span>
                </span>
              ) : (
                BRAND
              )}
            </p>
          </div>



          {/* Heading */}
          <h1
            className="font-sans text-[46px] sm:text-[64px] leading-[0.95] sm:leading-[0.95] tracking-tight text-center text-foreground animate-fade-up"
            style={{ animationDelay: `${HERO_DELAYS.heading}ms` }}
          >
            <span className="font-bold">Stay ahead.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-base sm:text-xl text-center font-sans font-medium mt-4 sm:mt-6 mb-6 sm:mb-8 leading-snug text-foreground max-w-[320px] sm:max-w-none animate-fade-up"
            style={{ animationDelay: `${HERO_DELAYS.subtitle}ms` }}
          >
            <span className="sm:hidden">
              All of your assignments, now in one place. Meet the beautifully designed, fully integrated planner for your school and life.
            </span>
            <span className="hidden sm:inline">
              All of your assignments, now in one
              <br />
              place. Meet the beautifully designed, fully
              <br />
              integrated planner for your school and life.
            </span>
          </p>

          {/* CTA: a signed-in visitor reaching the marketing page (via the
              sidebar logo) wants their app back, not a signup form. */}
          <Link
            href={loggedIn ? "/app/inbox" : "/login?signup=true"}
            className="px-5 py-2.5 sm:px-5 sm:py-2 min-h-11 sm:min-h-0 rounded-xl bg-blue-500 text-white text-sm sm:text-base font-medium hover:bg-blue-600 transition-colors duration-200 mb-4 sm:mb-12 inline-flex items-center gap-1.5 animate-fade-up"
            style={{ animationDelay: `${HERO_DELAYS.cta}ms` }}
          >
            {loggedIn ? "Open app" : "Get started"}
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>

        </div>

        {/* Hero screenshot: MacBook on a muted pill */}
        <div
          ref={mockupRef}
          className="mt-1 sm:mt-1.5 w-full max-w-5xl mx-auto relative px-1 sm:px-0 animate-fade-up"
          style={{ animationDelay: `${HERO_DELAYS.mockup}ms` }}
        >
          {/* Cream pill background */}
          <div className="bg-muted rounded-3xl sm:rounded-[32px] pt-10 sm:pt-16 px-6 sm:px-16 overflow-hidden">
            {/* MacBook frame: top + side bezels via border, no bottom bezel */}
            <div
              className="relative w-full border-t-[8px] border-l-[8px] border-r-[8px] sm:border-t-[10px] sm:border-l-[10px] sm:border-r-[10px] border-[#1c1c1e] rounded-t-[14px] sm:rounded-t-[18px]"
              style={{
                boxShadow: "0 24px 60px -12px rgba(0,0,0,0.25), 0 8px 20px -4px rgba(0,0,0,0.12)",
              }}
            >
              {/* Camera notch */}
              <div className="absolute -top-[5px] sm:-top-[6px] left-1/2 -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#3a3a3c]" />
              {/* Inner screen with browser chrome */}
              <div className="relative w-full overflow-hidden rounded-t-[5px] sm:rounded-t-[7px] bg-white">
                {/* Browser chrome bar with subtle gray dots */}
                <div className="flex items-center gap-1.5 px-2 sm:px-3 h-4 sm:h-5 bg-white">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#d8d8dc]" />
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#d8d8dc]" />
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#d8d8dc]" />
                </div>
                <Image
                  src="/app-screenshot-calendar-live.png"
                  alt="caltodo calendar with a month of assignments on their due dates"
                  width={1410}
                  height={840}
                  priority
                  sizes="(min-width: 1024px) 1024px, 100vw"
                  className="w-full h-auto block"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Trusted by section: scrolling marquee with edge fade */}
        <FadeIn className="w-full">
          <div className="w-full flex flex-col items-center gap-8 sm:gap-12 py-8 sm:py-12">
            <p className="text-center text-lg sm:text-2xl font-semibold text-foreground tracking-tight">
              {userCount ? `Trusted by ${userCount}+ students at` : "Trusted by students at"}
            </p>
            <div
              className="w-full max-w-5xl mx-auto overflow-hidden"
              style={{
                maskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
              }}
            >
              <div
                className="flex items-center gap-8 whitespace-nowrap"
                style={{ animation: "loginMarquee 50s linear infinite" }}
              >
                {(() => {
                  const schools = [
                    { name: "UC Berkeley", src: "/cal-logo.png" },
                    { name: "Stanford", src: "/schools/stanford.svg" },
                    { name: "Harvard", src: "/schools/harvard.svg" },
                    { name: "MIT", src: "/schools/mit.svg" },
                    { name: "Yale", src: "/schools/yale.svg" },
                    { name: "Cornell", src: "/schools/cornell.svg" },
                    { name: "NYU", src: "/schools/nyu.svg" },
                    { name: "UCSD", src: "/schools/ucsd.svg" },
                    { name: "UCLA", src: "/schools/ucla.svg" },
                    { name: "UPenn", src: "/schools/upenn.svg" },
                    { name: "USC", src: "/schools/usc.svg" },
                    { name: "Columbia", src: "/schools/columbia.svg" },
                  ];
                  return [...schools, ...schools].map((school, i) => (
                    <div
                      key={`${school.name}-${i}`}
                      className="h-9 w-24 flex items-center justify-center shrink-0"
                      title={school.name}
                    >
                      <img
                        src={school.src}
                        alt={school.name}
                        className="max-h-full max-w-full object-contain grayscale opacity-60"
                      />
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </FadeIn>

      </main>

      {/* Sentinel: when this scrolls above viewport, nav switches to white */}
      <div ref={heroEndRef} className="h-0 w-full" />

      {/* Steps section on white */}
      <div className="w-full bg-white">
        <div className="flex flex-col items-center px-6 lg:px-10">
          {/* Tagline below mockup */}
          <FadeIn className="max-w-5xl mt-12 sm:mt-20 mb-8 sm:mb-12">
            <p className="text-[28px] sm:text-[44px] font-bold text-foreground text-left leading-[1.05] tracking-tight">
              School, simplified.
            </p>
          </FadeIn>

          {/* How it works: step 1 full width, steps 2 & 3 side-by-side Notion-style */}
          <div className="w-full max-w-5xl mb-16 sm:mb-24 flex flex-col gap-6 sm:gap-8">
            {/* Step 1: text top-left, image fills the right column from top to bottom */}
            <FadeIn>
              <div className="bg-muted rounded-3xl p-8 sm:p-12 overflow-hidden relative min-h-[260px] sm:min-h-[340px]">
                <div className="max-w-md relative z-10">
                  <RefreshCw className="w-7 h-7 text-blue-500 mb-4" strokeWidth={2} />
                  <h3 className="text-2xl sm:text-[32px] font-bold text-foreground leading-tight tracking-tight">
                    Sync your classes
                  </h3>
                  <p className="text-base sm:text-lg text-muted-foreground mt-3 sm:mt-4 leading-snug">
                    Connect Google Calendar, Canvas, Gradescope, Pensive and more, or upload a syllabus, and your assignments sync on their own.
                  </p>
                  <SupportedPlatforms />
                </div>
                {/* Desktop: image fills the right column floor-to-ceiling so there's no empty space above */}
                <div className="hidden sm:block absolute top-8 right-8 bottom-8 w-[40%] max-w-[400px] rounded-2xl overflow-hidden shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)]">
                  <Image
                    src="/step-sync.png"
                    alt="The integrations settings page listing Google Calendar, Canvas, Gradescope, Pensive and syllabus upload"
                    fill
                    sizes="(min-width: 640px) 400px, 0px"
                    className="object-cover object-top"
                  />
                </div>
                {/* Mobile: image stacks below text */}
                <div className="sm:hidden mt-6">
                  <Image
                    src="/step-sync.png"
                    alt="The integrations settings page listing Google Calendar, Canvas, Gradescope, Pensive and syllabus upload"
                    width={1508}
                    height={1238}
                    sizes="100vw"
                    className="w-full h-auto block rounded-xl"
                  />
                </div>
              </div>
            </FadeIn>

            {/* Steps 2 and 3: two-column Notion-style grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <FadeIn delay={100}>
                <div className="bg-muted rounded-3xl p-8 sm:p-10 overflow-hidden flex flex-col h-full">
                  <CalendarDays className="w-7 h-7 text-blue-500 mb-4" strokeWidth={2} />
                  <h3 className="text-2xl sm:text-[28px] font-bold text-foreground leading-tight tracking-tight">
                    Manage your assignments
                  </h3>
                  <p className="text-base sm:text-lg text-muted-foreground mt-3 leading-snug">
                    See every deadline on a single calendar, no more switching between tabs.
                  </p>
                  <div className="mt-8 sm:mt-10 -mx-8 sm:-mx-10 -mb-8 sm:-mb-10 overflow-hidden">
                    <Image
                      src="/step-calendar.png"
                      alt="Manage your assignments"
                      width={1600}
                      height={1123}
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="w-full h-auto block"
                      style={{
                        transform: "scale(1.28)",
                        transformOrigin: "center bottom",
                      }}
                    />
                  </div>
                </div>
              </FadeIn>
              <FadeIn delay={200}>
                <div className="bg-muted rounded-3xl p-8 sm:p-10 overflow-hidden flex flex-col h-full">
                  <LayoutGrid className="w-7 h-7 text-blue-500 mb-4" strokeWidth={2} />
                  <h3 className="text-2xl sm:text-[28px] font-bold text-foreground leading-tight tracking-tight">
                    Personalize your board
                  </h3>
                  <p className="text-base sm:text-lg text-muted-foreground mt-3 leading-snug">
                    Build your perfect dashboard in under 5 minutes with drag-and-drop widgets and themes.
                  </p>
                  <div className="mt-8 sm:mt-10 -mx-8 sm:-mx-10 -mb-8 sm:-mb-10">
                    <Image
                      src="/step-personalize.png"
                      alt="Personalize your board"
                      width={1600}
                      height={1111}
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="w-full h-auto block"
                    />
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
