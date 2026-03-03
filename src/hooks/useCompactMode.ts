import { useRef, useState, useEffect } from "react";

/**
 * Hook that observes container height and returns whether compact mode should be active.
 * Uses ResizeObserver to detect size changes in real time.
 *
 * @param heightThreshold - Pixel height below which compact mode activates (default 160)
 * @returns Object with containerRef to attach to the observed element, and compact boolean
 */
export function useCompactMode(heightThreshold = 160) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCompact(entry.contentRect.height < heightThreshold);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [heightThreshold]);

  return { containerRef, compact };
}
