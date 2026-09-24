"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Whether scroll-triggered reveals can run at all. When the browser has no
 * IntersectionObserver the content must simply be visible: an element that
 * waits for an observer that never fires stays invisible forever.
 *
 * @param win - The window-like object to inspect (injected for tests)
 * @returns True when IntersectionObserver exists
 */
export function canObserve(win: { IntersectionObserver?: unknown } | undefined): boolean {
  return typeof win?.IntersectionObserver === "function";
}

/**
 * Wraps children in a subtle scroll-triggered fade-in and slight upward
 * slide. Renders visible immediately when IntersectionObserver is missing.
 * The global prefers-reduced-motion rule collapses the transition.
 *
 * @param children - React children to wrap.
 * @param className - Optional additional class names.
 * @param delay - Optional delay in ms before the animation starts (default 0).
 */
export default function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!canObserve(window)) {
      // One-shot: flips once on mount and never again, so it cannot cascade.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
