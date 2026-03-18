"use client";

import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Platform breakdown shown alongside the left bar.
 * Each gets a proportional section of the gray bar based on minutes.
 */
const PLATFORMS = [
  { label: "Manually adding tasks", logo: "/notion-logo.png", minutes: 50 },
  { label: "bCourses", logo: "/bcourses-logo.png", minutes: 40 },
  { label: "Gradescope", logo: "/gradescope-logo.png", minutes: 25 },
  { label: "Google Calendar", logo: "/gcal-logo.png", minutes: 20 },
];

/**
 * Animated two-bar comparison section for the landing page.
 * Left: 3 hr segmented bar (without caltodo) with platform labels.
 * Right: 15 min bar (with caltodo) with logo.
 *
 * @returns React element containing the stats section.
 */
export default function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-10 sm:mb-14">
          <h2
            className="text-[22px] sm:text-[32px] font-medium text-black leading-[1.05] tracking-tight"
            style={{
              fontFamily:
                '-apple-system, "SF Pro Display", BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            }}
          >
            Save 2 hours every week.
          </h2>
          <p className="text-sm sm:text-base text-black/45 mt-2">
            Time spent per week managing deadlines.
          </p>
        </div>

        <div className="relative mx-auto flex items-end gap-8 sm:gap-12 justify-center h-80 sm:h-[26rem]">

          {/* ── Left: 3 hr segmented bar ── */}
          <div className="relative flex flex-col items-center h-full">
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="mb-2"
            >
              <span className="text-base sm:text-lg font-bold tracking-tight text-black/30">
                <NumberFlow value={inView ? 2 : 0} />
                <span className="text-xs sm:text-sm font-semibold">:</span>
                <NumberFlow value={inView ? 15 : 0} />
              </span>
            </motion.div>

            <div className="relative flex-1 w-36 sm:w-44">
              {/* Platform labels — each positioned at the vertical center of its bar section */}
              {(() => {
                const total = PLATFORMS.reduce((s, p) => s + p.minutes, 0);
                let cumulative = 0;
                return PLATFORMS.map((p, i) => {
                  const centerPct = ((cumulative + p.minutes / 2) / total) * 100;
                  cumulative += p.minutes;
                  return (
                    <motion.div
                      key={p.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
                      className="absolute right-full flex items-center -translate-y-1/2"
                      style={{ top: `${centerPct}%` }}
                    >
                      {/* Label card */}
                      <div className="flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-3 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                        <div className="w-[18px] h-[18px] shrink-0 relative overflow-hidden rounded">
                          <Image src={p.logo} alt={p.label} fill sizes="18px" className="object-cover" />
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[11px] sm:text-xs font-medium text-black/60 leading-tight whitespace-nowrap">
                            {p.label}
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-black/30 leading-tight">
                            {p.minutes} min
                          </span>
                        </div>
                      </div>
                      {/* Connector line — flush against bar edge */}
                      <div className="w-8 sm:w-12 h-px bg-black/15 shrink-0" />
                    </motion.div>
                  );
                });
              })()}

              {/* Segmented bar */}
              <div className="relative h-full rounded-[32px] overflow-hidden bg-black/[0.06]">
                <motion.div
                  initial={{ height: 0 }}
                  animate={inView ? { height: "100%" } : {}}
                  transition={{ duration: 0.6, type: "spring", damping: 18, delay: 0.2 }}
                  className="absolute bottom-0 w-full rounded-[32px] overflow-hidden flex flex-col"
                >
                  {PLATFORMS.map((p, i) => (
                    <div
                      key={p.label}
                      className={`w-full bg-black/35${i < PLATFORMS.length - 1 ? " border-b-[2px] border-white/40" : ""}`}
                      style={{ flex: p.minutes }}
                    />
                  ))}
                </motion.div>
              </div>
            </div>

            <p className="mt-3 text-xs sm:text-sm tracking-tight font-medium text-black/30 text-center">
              Without caltodo
            </p>
          </div>

          {/* ── Right: 15 min bar ── */}
          <div className="relative flex flex-col items-center h-full justify-end">
            {/* "all-in-one" tooltip */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, type: "spring", damping: 15, delay: 1.0 }}
              className="mb-1"
            >
              <div className="relative rounded-xl bg-[#007AFF] px-3 py-1 text-xs sm:text-sm font-medium text-white whitespace-nowrap shadow-lg">
                all-in-one
                <svg
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[#007AFF]"
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                >
                  <path
                    d="M4.13 5.36a1 1 0 001.74 0L9.33.86A1 1 0 008.46 0H1.54a1 1 0 00-.87 1.5l3.46 3.86z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.9 }}
              className="mb-2"
            >
              <span className="text-base sm:text-lg font-bold tracking-tight text-[#007AFF]">
                <NumberFlow value={inView ? 15 : 0} />
                <span className="text-xs sm:text-sm font-semibold ml-0.5">min</span>
              </span>
            </motion.div>

            <div className="relative w-36 sm:w-44" style={{ height: `${(15 / 135) * 85}%` }}>
              {/* Caltodo logo — right of bar */}
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.9 }}
                className="absolute left-full top-1/2 -translate-y-1/2 flex items-center"
              >
                {/* Connector line — flush against bar edge */}
                <div className="w-8 sm:w-12 h-px bg-black/15 shrink-0" />
                <div className="flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-3 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <Image src="/logo.png" alt="caltodo" width={20} height={20} className="rounded shrink-0" />
                  <span className="text-[11px] sm:text-xs font-medium text-black/60 leading-tight">caltodo</span>
                </div>
              </motion.div>

              <div className="relative h-full rounded-[32px] overflow-hidden bg-[#007AFF]/10">
                <motion.div
                  initial={{ height: 0 }}
                  animate={inView ? { height: "100%" } : {}}
                  transition={{ duration: 0.6, type: "spring", damping: 18, delay: 0.5 }}
                  className="absolute bottom-0 w-full rounded-[32px] bg-[#007AFF]"
                />
              </div>
            </div>

            <p className="mt-3 text-xs sm:text-sm tracking-tight font-semibold text-[#007AFF] text-center">
              With caltodo
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

