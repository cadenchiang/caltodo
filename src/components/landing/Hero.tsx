"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { RefreshCw, CalendarDays, LayoutGrid } from "lucide-react";
import GoogleOneTap from "@/components/auth/GoogleOneTap";
import BentoFeatures from "@/components/landing/BentoFeatures";
import FadeIn from "@/components/landing/FadeIn";
import FeatureHighlight from "@/components/landing/FeatureHighlight";
import TestimonialSection from "@/components/landing/TestimonialSection";


/**
 * Hero landing page for unauthenticated users.
 * Always white background with black text.
 */
export default function Hero() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [showSpotsModal, setShowSpotsModal] = useState(false);

  // Fetch user count for the spots counter
  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setUserCount(data.count ?? 0))
      .catch(() => setUserCount(0));
  }, []);

  const mockupRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-dvh flex flex-col bg-white text-black overflow-x-hidden">
      {/* Google One Tap sign-in prompt (desktop only) */}
      <GoogleOneTap />

      {/* Top banner */}
      <button
        onClick={() => setShowSpotsModal(true)}
        className="w-full bg-[#F5F5F7] text-[#1D1D1F] text-center text-xs py-1.5 tracking-wide hover:bg-[#E8E8ED] transition-colors cursor-pointer relative flex items-center justify-center"
      >
        <span className="hidden sm:inline">exclusively for students · {500 - (userCount ?? 326)} free lifetime spots remaining</span>
        <span className="sm:hidden">{500 - (userCount ?? 326)} free lifetime spots left</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1.5 opacity-60">
          <path d="M7 17L17 7" />
          <path d="M7 7h10v10" />
        </svg>
      </button>

      {/* Nav */}
      <nav className="flex items-center justify-between px-4 py-3 sm:px-8 sm:py-6">
        <span className="text-lg sm:text-xl font-bold tracking-tight text-black">caltodo</span>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="px-4 py-1.5 text-xs sm:px-5 sm:py-2 sm:text-sm font-medium rounded-full text-black bg-white hover:scale-[1.05] active:scale-[0.97] transition-transform duration-200"
          >
            Login
          </Link>
          <Link
            href="/mobile"
            className="sm:hidden px-4 py-1.5 text-xs font-medium rounded-full bg-[#0071E3] text-white hover:scale-[1.05] active:scale-[0.97] transition-transform duration-200"
          >
            Get caltodo free
          </Link>
          <Link
            href="/login?signup=true"
            className="hidden sm:block px-5 py-2 text-sm font-medium rounded-full bg-[#0071E3] text-white hover:scale-[1.05] active:scale-[0.97] transition-transform duration-200"
          >
            Get caltodo free
          </Link>
        </div>
      </nav>

      {/* Hero content */}
      <main className="flex-1 flex flex-col items-center px-6 lg:px-10">
        {/* Above-the-fold section — fills viewport on mobile, normal flow on desktop */}
        <div className="min-h-[calc(100dvh-8rem)] sm:min-h-0 flex flex-col items-center justify-center sm:justify-start w-full">
          {/* Logo with integration icons behind */}
          <div className="flex flex-col items-center mt-2 sm:mt-6 mb-3 sm:mb-4">
            <div className="relative flex items-end justify-center" style={{ gap: 0 }}>
              {/* bCourses — outer left, highest */}
              <div className="group relative cursor-pointer flex flex-col items-center -mr-1 sm:-mr-3" style={{ marginBottom: "20px" }}>
                <img src="/bcourses-logo.png" alt="bCourses" className="w-9 h-9 sm:w-16 sm:h-16 object-contain transition-transform duration-200 group-hover:scale-110 relative z-10" />
                <div className="w-7 h-2 sm:w-14 sm:h-4 mt-1 transition-all duration-200 group-hover:w-9 sm:group-hover:w-16" style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.04) 50%, transparent 70%)", borderRadius: "50%" }} />
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-3 rounded-lg bg-[#F5F5F7] text-[#1D1D1F] text-xs px-3 py-2 shadow-md opacity-0 scale-95 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 z-50 whitespace-nowrap">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#F5F5F7] rotate-45" />
                  bCourses
                </div>
              </div>
              {/* Gradescope — inner left, mid */}
              <div className="group relative cursor-pointer flex flex-col items-center -mr-1 sm:-mr-3" style={{ marginBottom: "10px" }}>
                <svg width="64" height="64" viewBox="0 0 14 14" fill="none" className="w-9 h-9 sm:w-16 sm:h-16 transition-transform duration-200 group-hover:scale-110 relative z-10">
                  <rect width="14" height="14" rx="3" fill="#3AADA8" />
                  <rect x="1.5" y="8.5" width="2" height="3.5" rx="0.5" fill="white" />
                  <rect x="4.5" y="6.5" width="2" height="5.5" rx="0.5" fill="white" />
                  <rect x="7.5" y="4.5" width="2" height="7.5" rx="0.5" fill="white" />
                  <rect x="10.5" y="2.5" width="2" height="9.5" rx="0.5" fill="white" />
                </svg>
                <div className="w-7 h-2 sm:w-14 sm:h-4 mt-1 transition-all duration-200 group-hover:w-9 sm:group-hover:w-16" style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.04) 50%, transparent 70%)", borderRadius: "50%" }} />
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-3 rounded-lg bg-[#F5F5F7] text-[#1D1D1F] text-xs px-3 py-2 shadow-md opacity-0 scale-95 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 z-50 whitespace-nowrap">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#F5F5F7] rotate-45" />
                  Gradescope
                </div>
              </div>
              {/* caltodo — center, lowest (bottom of V) */}
              <div className="group relative cursor-pointer flex flex-col items-center z-20">
                <img src="/logo.png" alt="caltodo" className="h-12 sm:h-24 transition-transform duration-200 group-hover:scale-105 relative z-10" />
                <div className="w-10 h-3 sm:w-20 sm:h-5 mt-0.5 transition-all duration-200 group-hover:w-12 sm:group-hover:w-24" style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 45%, transparent 70%)", borderRadius: "50%" }} />
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-3 rounded-lg bg-[#F5F5F7] text-[#1D1D1F] text-xs px-3 py-2 shadow-md opacity-0 scale-95 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 z-50 whitespace-nowrap">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#F5F5F7] rotate-45" />
                  caltodo
                </div>
              </div>
              {/* Pensieve — inner right, mid */}
              <div className="group relative cursor-pointer flex flex-col items-center -ml-1 sm:-ml-3 z-10" style={{ marginBottom: "10px" }}>
                <div className="relative w-9 h-9 sm:w-16 sm:h-16 transition-transform duration-200 group-hover:scale-110 z-10">
                  <div className="absolute inset-[10%] rounded-full bg-white" />
                  <img src="/pensieve-logo.png" alt="Pensieve" className="w-full h-full object-contain relative" />
                </div>
                <div className="w-7 h-2 sm:w-14 sm:h-4 mt-1 transition-all duration-200 group-hover:w-9 sm:group-hover:w-16" style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.04) 50%, transparent 70%)", borderRadius: "50%" }} />
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-3 rounded-lg bg-[#F5F5F7] text-[#1D1D1F] text-xs px-3 py-2 shadow-md opacity-0 scale-95 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 z-50 whitespace-nowrap">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#F5F5F7] rotate-45" />
                  Pensieve
                </div>
              </div>
              {/* Google Calendar — outer right, highest */}
              <div className="group relative cursor-pointer flex flex-col items-center -ml-1 sm:-ml-3" style={{ marginBottom: "20px" }}>
                <svg width="64" height="64" viewBox="0 0 122.88 122.88" className="w-9 h-9 sm:w-16 sm:h-16 transition-transform duration-200 group-hover:scale-110 relative z-10">
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
                <div className="w-7 h-2 sm:w-14 sm:h-4 mt-1 transition-all duration-200 group-hover:w-9 sm:group-hover:w-16" style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.04) 50%, transparent 70%)", borderRadius: "50%" }} />
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-3 rounded-lg bg-[#F5F5F7] text-[#1D1D1F] text-xs px-3 py-2 shadow-md opacity-0 scale-95 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 z-50 whitespace-nowrap">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#F5F5F7] rotate-45" />
                  Google Calendar
                </div>
              </div>
            </div>
          </div>



          {/* Heading */}
          <h2 className="text-[36px] sm:text-[64px] leading-[0.95] sm:leading-[0.95] tracking-tight text-center text-black" style={{ fontFamily: '-apple-system, "SF Pro Display", BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
            <span className="font-medium">Never miss a</span>
            <br />
            <span className="font-medium">deadline </span><span className="font-medium italic">again.</span>
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-xl text-center font-sans font-light mt-3 sm:mt-6 mb-5 sm:mb-8 leading-relaxed text-black/45 max-w-[280px] sm:max-w-none">
            Sync and manage all your assignments in one place.
          </p>

          {/* CTA — simple pill on mobile, interactive hover button on desktop */}
          <Link
            href="/mobile"
            className="sm:hidden flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0071E3] text-white text-sm font-semibold mb-6 active:scale-[0.97] transition-transform"
          >
            Get caltodo free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/login?signup=true"
            className="group hidden sm:flex items-center gap-2 px-8 py-2 rounded-full bg-[#0071E3] text-white text-base font-medium hover:scale-[1.05] active:scale-[0.97] transition-transform duration-200 sm:mb-12"
          >
            Get caltodo free
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-2">
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </Link>

        </div>

        {/* Hero screenshot */}
        <div
          ref={mockupRef}
          className="mt-1 sm:mt-1.5 w-full sm:max-w-4xl mx-auto relative px-1 sm:px-0"
        >
          <div className="relative sm:max-h-[50vh] md:max-h-none rounded-2xl p-1.5 sm:p-2 bg-gray-100 border border-gray-200">
            <div className="relative w-full overflow-hidden rounded-xl">
              <img
                src="/app-screenshot-board.png"
                alt="caltodo board view with widgets and calendar"
                className="w-full block"
              />
              <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none sm:block md:hidden" style={{ background: "linear-gradient(to bottom, transparent, white)" }} />
            </div>
          </div>
        </div>

      </main>

      {/* Gradient transition into light gray section */}
      <div className="w-full" style={{ background: "linear-gradient(to bottom, #ffffff, #FCFCFD)" }}>
        <div className="flex flex-col items-center px-6 lg:px-10">
          {/* Tagline below mockup */}
          <FadeIn className="max-w-4xl mt-12 sm:mt-20 mb-12 sm:mb-20">
            <p className="text-[22px] sm:text-[32px] font-medium text-black text-left leading-[1.05] tracking-tight" style={{ fontFamily: '-apple-system, "SF Pro Display", BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
              Sync your classes, manage every deadline, and personalize your workflow, all in one place.
            </p>
          </FadeIn>

          {/* Three-step how it works */}
          <div className="w-full max-w-5xl mb-16 sm:mb-24 flex flex-col gap-8 sm:gap-10">
            {([
              { step: "1", title: "Sync your classes", desc: "Connect bCourses, Gradescope, Pensieve, and Google Calendar in one click.", img: "/step-sync.png", icon: RefreshCw },
              { step: "2", title: "Manage your assignments", desc: "See every deadline on a single calendar — no more switching between tabs.", img: "/step-calendar.png", icon: CalendarDays },
              { step: "3", title: "Personalize your board", desc: "Build your perfect dashboard in under 5 minutes with drag-and-drop widgets and themes.", img: "/step-personalize.png", icon: LayoutGrid },
            ] as const).map((item, i) => {
              const Icon = item.icon;
              return (
                <FadeIn key={item.step} delay={i * 100}>
                  <div className={`flex flex-col sm:flex-row items-center gap-8 sm:gap-12 ${i % 2 === 1 ? "sm:flex-row-reverse" : ""}`}>
                    <div className="sm:w-1/2 w-full">
                      <img src={item.img} alt={item.title} className="w-full rounded-xl block shadow-lg" />
                    </div>
                    <div className="sm:w-1/2 text-center sm:text-left">
                      <Icon className="w-6 h-6 text-black/25 mb-3 mx-auto sm:mx-0" strokeWidth={1.5} />
                      <span className="text-xs font-semibold text-[#0071E3] tracking-wide">STEP {item.step}</span>
                      <h3 className="text-2xl sm:text-[32px] font-medium text-black leading-tight tracking-tight mt-2" style={{ fontFamily: '-apple-system, "SF Pro Display", BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                        {item.title}
                      </h3>
                      <p className="text-sm sm:text-base text-black/40 mt-2 sm:mt-3 max-w-sm mx-auto sm:mx-0">{item.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </div>

      <FeatureHighlight />

      <div className="w-full bg-[#FCFCFD]">
        <div className="flex flex-col items-center px-6 lg:px-10 py-4 sm:py-6">
          <FadeIn delay={100}>
            <BentoFeatures />
          </FadeIn>
        </div>
      </div>

      <TestimonialSection />

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-black/30 bg-[#FCFCFD]">
        Built for Bears, by Bears.
        <span className="mx-1">·</span>
        <Link href="/privacy" className="hover:text-black/50 transition-colors">Privacy</Link>
        <span className="mx-1">·</span>
        <Link href="/terms" className="hover:text-black/50 transition-colors">Terms</Link>
      </footer>

      {/* Spots modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-out ${
          showSpotsModal ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: showSpotsModal ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)", backdropFilter: showSpotsModal ? "blur(4px)" : "blur(0px)" }}
        onClick={() => setShowSpotsModal(false)}
      >
        <div
          className={`bg-white rounded-3xl max-w-sm w-full mx-6 overflow-hidden shadow-2xl transition-all duration-300 ease-out relative ${
            showSpotsModal ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={() => setShowSpotsModal(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/5 text-black/40 hover:bg-black/10 hover:text-black transition-all z-10"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>

          <div className="px-6 pt-6 pb-3 sm:px-8 sm:pt-8 sm:pb-4">
            <h3 className="text-xl sm:text-2xl font-semibold text-black leading-tight tracking-tight" style={{ fontFamily: '-apple-system, "SF Pro Display", BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
              free for life. seriously.
            </h3>
            <p className="text-xs sm:text-sm text-black/40 leading-relaxed mt-2 sm:mt-3">
              the first 500 students get caltodo free forever. no credit card. no catches. just sign up.
            </p>
          </div>

          <div className="px-6 pb-3 sm:px-8 sm:pb-4">
            <div className="w-full h-1 rounded-full bg-black/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-black/80"
                style={{ width: `${((userCount ?? 326) / 500) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 sm:mt-2">
              <span className="text-[10px] sm:text-[11px] text-black/30">{userCount ?? 326} claimed</span>
              <span className="text-[10px] sm:text-[11px] text-black/30">500 total</span>
            </div>
          </div>

          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            <Link
              href="/login?signup=true"
              className="block w-full text-center px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium rounded-xl bg-black text-white hover:bg-black/85 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              onClick={() => setShowSpotsModal(false)}
            >
              Get caltodo free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
