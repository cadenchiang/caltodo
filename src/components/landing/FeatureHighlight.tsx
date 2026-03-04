"use client";

import { useState } from "react";
import FadeIn from "@/components/landing/FadeIn";

/**
 * Slide data for the feature carousel.
 * Each slide has a screenshot, title, and hover description.
 */
const SLIDES = [
  {
    src: "/chat-feature-preview.png",
    alt: "caltodo class chat feature preview",
    title: "Class Chat",
    description: "Message classmates in real time, organized by course.",
    badge: "New",
  },
  {
    src: "/app-screenshot-board.png",
    alt: "caltodo board view with drag-and-drop columns",
    title: "Dashboard",
    description: "Your personalized home for every deadline and task.",
    badge: "New",
    badgeColor: "blue" as const,
  },
  {
    src: "/app-screenshot-calendar.png",
    alt: "caltodo calendar view with synced assignments",
    title: "Calendar View",
    description: "See all your due dates laid out so nothing slips through.",
  },
];

/**
 * Center-stage carousel. Active slide is centered with adjacent slides
 * peeking from the screen edges (same size, faded, clipped by overflow).
 * Hovering the active slide blurs the image and shows a description at bottom-right.
 *
 * @returns React element for the feature carousel section.
 */
export default function FeatureHighlight() {
  const [active, setActive] = useState(1);
  const [hoveredSlide, setHoveredSlide] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const changeSlide = (next: number) => {
    setHoveredSlide(null);
    setTransitioning(true);
    setActive(next);
    setTimeout(() => setTransitioning(false), 600);
  };
  const goNext = () => changeSlide(Math.min(active + 1, SLIDES.length - 1));
  const goPrev = () => changeSlide(Math.max(active - 1, 0));

  return (
    <section className="w-full bg-[#FCFCFD] py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        {/* Badge + Heading */}
        <FadeIn>
          <h2
            className="text-[22px] sm:text-[32px] font-medium text-black leading-[1.05] tracking-tight"
            style={{
              fontFamily:
                '-apple-system, "SF Pro Display", BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            }}
          >
            See and manage all your assignments.
          </h2>
          <p className="text-base sm:text-xl text-black/50 mt-1 max-w-none leading-relaxed">
            Every view you need to stay on top of your semester.
          </p>
        </FadeIn>
      </div>

      {/* Carousel — full viewport width, clips side slides */}
      <FadeIn delay={150}>
        <div className="relative mt-5 sm:mt-8 overflow-hidden">
          {/* Track — shifts left based on active index */}
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              /* Center the active slide: 50vw (half screen) - 30vw (half slide) - active * 60vw (slide width) */
              transform: `translateX(calc(23vw - ${active * 54}vw))`,
            }}
          >
            {SLIDES.map((slide, i) => {
              const isActive = i === active;
              return (
                <div
                  key={slide.title}
                  className="flex-shrink-0 transition-all duration-500 origin-center"
                  style={{
                    width: "54vw",
                    transform: `scale(${isActive ? 1 : 0.95}) translateX(${i < active ? "-0.5vw" : i > active ? "0.5vw" : "0"})`,
                  }}
                  onClick={() => !isActive && changeSlide(i)}
                  onMouseEnter={() => setHoveredSlide(i)}
                  onMouseLeave={() => setHoveredSlide(null)}
                >
                  {/* Outer frame — padded card border */}
                  <div
                    className={`rounded-2xl p-1.5 sm:p-2 transition-all duration-500 ${
                      isActive
                        ? "bg-gray-100 border border-gray-200 shadow-xl"
                        : "bg-gray-100 border border-gray-200 shadow-sm cursor-pointer"
                    }`}
                  >
                    {/* Inner image container */}
                    <div
                      className="relative rounded-xl overflow-hidden"
                      style={{ aspectRatio: "2912 / 1732" }}
                    >
                      <img
                        src={slide.src}
                        alt={slide.alt}
                        className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-300 block ${
                          hoveredSlide === i && !transitioning ? "blur-[14px] scale-[0.99]" : ""
                        }`}
                        draggable={false}
                      />
                      {/* Hover overlay — bottom right text, no darkening */}
                      <div
                        className={`absolute inset-0 flex flex-col items-end justify-end p-6 sm:p-8 transition-opacity duration-300 ${
                          hoveredSlide === i && !transitioning ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <h3 className="flex items-center gap-2 text-black text-xl sm:text-2xl font-semibold tracking-tight">
                          {"badge" in slide && slide.badge && (
                            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-xl tracking-wide ${
                              "badgeColor" in slide && slide.badgeColor === "blue"
                                ? "bg-[#007AFF] text-white"
                                : "bg-[#ff5a05] text-white"
                            }`}>
                              {slide.badge}
                            </span>
                          )}
                          {slide.title}
                        </h3>
                        <p className="text-black/50 text-sm sm:text-base text-right whitespace-nowrap mt-0.5">
                          {slide.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Left arrow */}
          {active > 0 && (
            <button
              onClick={goPrev}
              className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-black/15 flex items-center justify-center hover:bg-black/20 transition-colors z-30"
              style={{ left: "20vw" }}
              aria-label="Previous slide"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* Right arrow */}
          {active < SLIDES.length - 1 && (
            <button
              onClick={goNext}
              className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-black/15 flex items-center justify-center hover:bg-black/20 transition-colors z-30"
              style={{ right: "20vw" }}
              aria-label="Next slide"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                active === i ? "bg-black/50 w-6" : "bg-black/15 w-2"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
