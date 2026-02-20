"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mockup, MockupFrame } from "@/components/ui/mockup";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

const HERO_IMAGES = [
  { src: "/app-screenshot-calendar.png", alt: "caltodo calendar view with synced assignments" },
  { src: "/app-screenshot-inbox.png", alt: "caltodo inbox view with task list and detail panel" },
];

/**
 * Hero landing page for unauthenticated users.
 * Always white background with black text.
 */
export default function Hero() {
  const [activeImage, setActiveImage] = useState(0);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [showSpotsModal, setShowSpotsModal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fetch user count for the spots counter
  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setUserCount(data.count ?? 0))
      .catch(() => setUserCount(0));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      {/* Top banner */}
      <button
        onClick={() => setShowSpotsModal(true)}
        className="w-full bg-black text-white text-center text-xs py-1.5 tracking-wide hover:bg-zinc-800 transition-colors cursor-pointer relative flex items-center justify-center"
      >
        <span>exclusively for uc berkeley students · {userCount !== null ? `${1000 - userCount} free lifetime spots remaining` : "\u00A0"}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1.5 opacity-60">
          <path d="M7 17L17 7" />
          <path d="M7 7h10v10" />
        </svg>
      </button>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="caltodo"
            className="h-6"
          />
          <span className="text-lg font-bold tracking-tight text-black">caltodo</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login?signup=true"
            className="px-5 py-2 text-sm font-medium rounded-full bg-black text-white btn-elevated-primary"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-5 py-2 text-sm font-medium rounded-full text-black bg-white btn-elevated-secondary"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero content */}
      <main className="flex flex-col items-center px-6 lg:px-10">
        {/* Eyebrow */}
        <p className="font-sans uppercase tracking-[0.51em] leading-[133%] text-center text-base mt-20 mb-8 text-black animate-appear opacity-0">
          the to-do list for students
        </p>

        {/* Heading */}
        <h2 className="text-7xl sm:text-[96px] sm:leading-[100px] text-center text-black animate-appear opacity-0 delay-100">
          <span className="font-serif font-normal">All your deadlines.</span>
          <br />
          <span className="font-serif font-normal italic">One </span>
          <span className="font-serif font-normal">calendar.</span>
        </h2>

        {/* Integration logos equation */}
        <div className="flex items-center justify-center gap-5 sm:gap-7 mt-10 mb-6 animate-appear opacity-0 delay-300">
          {/* bCourses logo with tooltip */}
          <div className="group relative cursor-pointer">
            <img
              src="/bcourses-logo.png"
              alt="bCourses"
              width={64}
              height={64}
              className="transition-transform duration-200 group-hover:scale-110"
            />
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-3 rounded-lg bg-zinc-900 text-white text-xs px-3 py-2 shadow-lg opacity-0 scale-95 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 z-50 whitespace-nowrap">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45" />
              Sync bCourses assignments
            </div>
          </div>

          <span className="text-2xl sm:text-3xl font-light text-black">+</span>

          {/* Gradescope logo with tooltip */}
          <div className="group relative cursor-pointer">
            <svg width="64" height="64" viewBox="0 0 14 14" fill="none" className="transition-transform duration-200 group-hover:scale-110">
              <rect width="14" height="14" rx="3" fill="#3AADA8" />
              <rect x="1.5" y="8.5" width="2" height="3.5" rx="0.5" fill="white" />
              <rect x="4.5" y="6.5" width="2" height="5.5" rx="0.5" fill="white" />
              <rect x="7.5" y="4.5" width="2" height="7.5" rx="0.5" fill="white" />
              <rect x="10.5" y="2.5" width="2" height="9.5" rx="0.5" fill="white" />
            </svg>
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-3 rounded-lg bg-zinc-900 text-white text-xs px-3 py-2 shadow-lg opacity-0 scale-95 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 z-50 whitespace-nowrap">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45" />
              Sync Gradescope deadlines
            </div>
          </div>

          <span className="text-2xl sm:text-3xl font-light text-black">+</span>

          {/* Google Calendar logo with tooltip */}
          <div className="group relative cursor-pointer">
            <svg width="64" height="64" viewBox="0 0 122.88 122.88" className="transition-transform duration-200 group-hover:scale-110">
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
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-3 rounded-lg bg-zinc-900 text-white text-xs px-3 py-2 shadow-lg opacity-0 scale-95 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 z-50 whitespace-nowrap">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45" />
              Export to Google Calendar
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-center font-sans font-light mb-12 leading-relaxed text-black/70 animate-appear opacity-0 delay-500">
          Never miss an assignment again. bCourses and Gradescope, one calendar.
        </p>

        {/* CTA */}
        <Link href="/login?signup=true" className="animate-appear opacity-0 delay-700">
          <InteractiveHoverButton
            text="Get Started"
            className="w-56 text-base border-black bg-black text-white"
          />
        </Link>

        {/* Mockup */}
        <div className="mt-20 w-full max-w-5xl mx-auto relative animate-appear opacity-0" style={{ animationDelay: "900ms" }}>
          <MockupFrame className="w-full">
            <Mockup type="responsive" className="w-full">
              <div className="relative w-full">
                {HERO_IMAGES.map((img, i) => (
                  <img
                    key={img.src}
                    src={img.src}
                    alt={img.alt}
                    className={`w-full transition-opacity duration-700 ease-in-out ${
                      i === 0 ? "relative" : "absolute inset-0"
                    }`}
                    style={{ opacity: activeImage === i ? 1 : 0 }}
                  />
                ))}
              </div>
            </Mockup>
          </MockupFrame>
          {/* Image indicator dots */}
          <div className="flex justify-center gap-2 mt-4" style={{ zIndex: 11, position: "relative" }}>
            {HERO_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeImage === i ? "bg-black w-6" : "bg-black/20"
                }`}
                aria-label={`Show screenshot ${i + 1}`}
              />
            ))}
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 w-full h-[303px]"
            style={{
              background: "linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0) 100%)",
              zIndex: 10,
            }}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-black/30">
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
          className={`bg-white rounded-2xl max-w-md w-full mx-6 p-8 shadow-2xl transition-all duration-300 ease-out relative ${
            showSpotsModal ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={() => setShowSpotsModal(false)}
            className="absolute top-4 right-4 p-1 text-black/40 hover:text-black transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>

          <h3 className="text-2xl font-bold text-black mb-3">
            Free for life. Seriously.
          </h3>
          <p className="text-sm text-black leading-relaxed mb-6">
            The first 1,000 students get caltodo free forever. No catches.
            {userCount !== null
              ? ` Only ${1000 - userCount} spots left.`
              : ""}
          </p>
          <Link
            href="/login?signup=true"
            className="block w-full text-center px-5 py-3 text-sm font-semibold rounded-xl bg-black text-white btn-elevated-primary"
            onClick={() => setShowSpotsModal(false)}
          >
            Claim your free spot
          </Link>
        </div>
      </div>
    </div>
  );
}
