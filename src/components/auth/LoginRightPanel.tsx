"use client";

import { useEffect, useState } from "react";

/** Rotating list of made-up student testimonials. */
const TESTIMONIALS: Array<{ quote: string; name: string; school: string }> = [
  {
    quote: "Caltodo saved my GPA last semester. I haven't missed an assignment since.",
    name: "Caden Chiang",
    school: "UC Berkeley",
  },
  {
    quote: "I used to live in three different apps. Now everything just shows up on my calendar.",
    name: "Sarah Martinez",
    school: "Stanford",
  },
  {
    quote: "Finals week used to wreck me. Caltodo basically built my study schedule for me.",
    name: "Emma Patel",
    school: "UCLA",
  },
  {
    quote: "I haven't manually added an assignment in months. It's almost suspicious.",
    name: "Marcus Lee",
    school: "MIT",
  },
  {
    quote: "I can finally see every deadline without opening seven tabs.",
    name: "Aisha Williams",
    school: "Columbia",
  },
  {
    quote: "My friends keep asking how I'm so on top of things this semester. This is how.",
    name: "Tyler Chen",
    school: "USC",
  },
  {
    quote: "The fact that this is free is genuinely confusing to me.",
    name: "Jordan Kim",
    school: "Cornell",
  },
];

/** Single testimonial duration before rotating to the next one (ms). */
const ROTATION_INTERVAL = 6000;
/** How long the cross-fade between testimonials takes (ms). */
const FADE_DURATION = 600;

/**
 * Right-side branding panel shown beside the login form on desktop.
 * Bear illustration up top, a rotating testimonial in the middle, and
 * a "Trusted by" strip of school logos at the bottom.
 */
export default function LoginRightPanel() {
  const [index, setIndex] = useState(0);
  /** When fading=true, the current testimonial fades out before the next one mounts. */
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const tick = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % TESTIMONIALS.length);
        setFading(false);
      }, FADE_DURATION);
    }, ROTATION_INTERVAL);
    return () => clearInterval(tick);
  }, []);

  const t = TESTIMONIALS[index];

  const SCHOOLS: Array<{ name: string; src: string }> = [
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

  return (
    <div className="relative w-full h-full flex flex-col items-center px-10 pt-10 pb-12 overflow-hidden">
      {/* Top: compact scrolling school marquee with edge fade */}
      <div
        className="w-full overflow-hidden mb-8 animate-fade-left"
        style={{
          animationDelay: "0ms",
          maskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      >
        <div className="flex items-center gap-5 whitespace-nowrap login-marquee-track">
          {[...SCHOOLS, ...SCHOOLS].map((school, i) => (
            <div
              key={`${school.name}-${i}`}
              className="h-7 w-20 flex items-center justify-center shrink-0"
              title={school.name}
            >
              <img
                src={school.src}
                alt={school.name}
                className="max-h-full max-w-full object-contain grayscale opacity-50"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Center column: bear + rotating quote */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full min-h-0">
        {/* Bear illustration */}
        <img
          src="/login-bear.png"
          alt=""
          className="w-56 h-auto select-none pointer-events-none animate-fade-left"
          style={{ animationDelay: "150ms" }}
          draggable={false}
        />

        {/* Rotating quote — fixed height so the bear above never shifts when quotes change */}
        <div
          className="text-center max-w-md h-32 flex flex-col items-center justify-center w-full animate-fade-left"
          style={{ animationDelay: "300ms" }}
        >
          <div
            style={{
              opacity: fading ? 0 : 1,
              transform: fading ? "translateX(-3px)" : "translateX(0)",
              transition: `opacity ${FADE_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${FADE_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            }}
          >
            <p className="text-base text-gray-900 leading-relaxed mb-4">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="font-semibold text-gray-900">{t.name}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">{t.school}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
