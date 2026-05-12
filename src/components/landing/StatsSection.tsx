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
  { label: "Manually adding tasks", logo: "/notion-logo.png", minutes: 60, tint: "rgba(200,200,200,0.18)" },
  { label: "bCourses", logo: "/bcourses-logo.png", minutes: 40, tint: "rgba(160,175,210,0.16)" },
  { label: "Gradescope", logo: "/gradescope-logo.png", minutes: 25, tint: "rgba(150,170,220,0.15)" },
  { label: "Google Calendar", logo: "/gcal-logo.png", minutes: 20, tint: "rgba(160,200,170,0.14)" },
];

/**
 * Animated two-bar comparison section for the landing page.
 * Dark background section with bar chart comparing time with/without caltodo.
 * Hovering a platform card spotlights its bar segment.
 *
 * @returns React element containing the stats section.
 */
export default function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
    <section ref={sectionRef} className="pt-28 pb-40 sm:pt-40 sm:pb-56 bg-[#141416]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2
            className="text-[22px] sm:text-[32px] font-medium text-white leading-[1.05] tracking-tight"
            style={{
              fontFamily:
                '-apple-system, "SF Pro Display", BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            }}
          >
            Save 2 hours <em>every week.</em>
          </h2>
          <p className="text-sm sm:text-base text-white/55 mt-2">
            Time spent viewing and managing deadlines.
          </p>
        </div>

        <div className="relative mx-auto flex items-end gap-6 sm:gap-12 justify-center h-72 sm:h-[26rem]">

          {/* ── Left: 3 hr segmented bar ── */}
          <div className="relative flex flex-col items-center h-full">
            <div className="relative flex-1 w-32 sm:w-44 mt-6">
              {/* Platform labels — desktop only, positioned at vertical center of each segment */}
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
                      className="absolute right-full hidden sm:flex items-center -translate-y-1/2"
                      style={{ top: `${centerPct}%` }}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Label card */}
                      <div
                        className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all duration-200 cursor-default border"
                        style={{
                          backgroundColor: hoveredIndex === i ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
                          borderColor: hoveredIndex === i ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)",
                          opacity: hoveredIndex !== null && hoveredIndex !== i ? 0.35 : 1,
                        }}
                      >
                        <div className="w-[24px] h-[24px] shrink-0 relative overflow-hidden rounded">
                          <Image src={p.logo} alt={p.label} fill sizes="24px" className="object-cover" />
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-xs font-medium text-white/70 leading-tight whitespace-nowrap">
                            {p.label}
                          </span>
                          <span className="text-[11px] text-white/30 leading-tight">
                            {p.minutes} min
                          </span>
                        </div>
                      </div>
                      {/* Connector line */}
                      <div
                        className="w-12 h-px shrink-0 transition-colors duration-200"
                        style={{
                          backgroundColor: hoveredIndex === i ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                        }}
                      />
                    </motion.div>
                  );
                });
              })()}

              {/* Segmented bar */}
              <div className="relative h-full rounded-[32px] overflow-hidden bg-white/[0.15]">
                {/* Time label overlaid at top of bar */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="absolute top-3 left-0 right-0 z-10 text-center"
                >
                  <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                    <NumberFlow value={inView ? 145 : 0} />
                    <span className="text-xs sm:text-sm font-semibold ml-0.5">min</span>
                  </span>
                </motion.div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={inView ? { height: "100%" } : {}}
                  transition={{ duration: 0.6, type: "spring", damping: 18, delay: 0.2 }}
                  className="absolute bottom-0 w-full rounded-[32px] overflow-hidden flex flex-col"
                >
                  {PLATFORMS.map((p, i) => (
                    <div
                      key={p.label}
                      className={`w-full flex items-center px-2.5 overflow-hidden transition-all duration-200${i < PLATFORMS.length - 1 ? " border-b-[2px] border-black/40" : ""}`}
                      style={{
                        flex: p.minutes,
                        backgroundColor: hoveredIndex === i
                          ? p.tint.replace(/[\d.]+\)$/, (m) => `${Math.min(1, parseFloat(m) + 0.15)})`)
                          : hoveredIndex !== null
                            ? p.tint.replace(/[\d.]+\)$/, (m) => `${Math.max(0.08, parseFloat(m) - 0.12)})`)
                            : p.tint,
                      }}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <div className="flex items-center gap-2 sm:hidden w-full min-w-0">
                        <div className="w-4 h-4 shrink-0 relative overflow-hidden rounded">
                          <Image src={p.logo} alt={p.label} fill sizes="16px" className="object-cover" />
                        </div>
                        <span className="text-[10px] font-medium text-white/75 leading-tight truncate flex-1">
                          {p.label}
                        </span>
                        <span className="text-[10px] text-white/40 leading-tight shrink-0">
                          {p.minutes}m
                        </span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>

            <p className="mt-3 text-xs sm:text-sm tracking-tight font-medium text-white/25 text-center">
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
              className="mb-3"
            >
              <div className="relative rounded-full bg-[#0e89d6] px-3.5 py-1 text-xs sm:text-sm font-medium text-white whitespace-nowrap shadow-[0_0_16px_rgba(0,122,255,0.4)]">
                all-in-one
                <svg
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[#0e89d6]"
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

            <div className="relative w-32 sm:w-44" style={{ height: `${(15 / 145) * 85}%` }}>
              {/* Caltodo logo — desktop only, right of bar */}
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.9 }}
                className="absolute left-full top-1/2 -translate-y-1/2 hidden sm:flex items-center"
              >
                {/* Connector line */}
                <div className="w-12 h-px bg-white/10 shrink-0" />
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3.5 py-2.5">
                  <Image src="/logo.png" alt="caltodo" width={24} height={24} className="rounded shrink-0" />
                  <span className="text-xs font-medium text-white/70 leading-tight">caltodo</span>
                </div>
              </motion.div>

              <div className="relative h-full rounded-[32px] overflow-hidden bg-[#0e89d6]/15">
                <motion.div
                  initial={{ height: 0 }}
                  animate={inView ? { height: "100%" } : {}}
                  transition={{ duration: 0.6, type: "spring", damping: 18, delay: 0.5 }}
                  className="absolute bottom-0 w-full rounded-[32px] bg-[#0e89d6] flex items-center justify-center"
                >
                  <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                    <NumberFlow value={inView ? 15 : 0} />
                    <span className="text-xs sm:text-sm font-semibold ml-0.5">min</span>
                  </span>
                </motion.div>
              </div>
            </div>

            <p className="mt-3 text-xs sm:text-sm tracking-tight font-semibold text-[#0e89d6] text-center">
              With caltodo
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
