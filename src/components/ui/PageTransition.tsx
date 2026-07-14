"use client";

/**
 * Page transition wrapper — simple fade in/out across every /app/*
 * route. 350ms, just opacity, nothing fancy. The loading.tsx flash
 * that used to blank the screen before the fade started has been
 * removed so the previous page stays visible until the new one
 * mounts, and the fade lands on top of it instead of on a white card.
 */

import { useEffect, useState } from "react";

/**
 * Tracks whether the app has already painted its first page this page-load.
 * The very first `/app/*` page a user lands on (a hard load) should appear
 * instantly — starting it at opacity:0 and fading in just stacked a 350ms
 * fade on top of the skeleton, which read as slow/glitchy first-load. Only
 * client-side route changes (the 2nd+ mount) get the fade.
 */
let hasPaintedFirstPage = false;

export default function PageTransition({ children }: { children: React.ReactNode }) {
  // On the first page of a load, render visible immediately (no fade). On
  // subsequent route changes, start hidden and fade in.
  const isFirstPage = !hasPaintedFirstPage;
  const [mounted, setMounted] = useState(isFirstPage);

  useEffect(() => {
    if (isFirstPage) {
      hasPaintedFirstPage = true;
      return; // already visible — nothing to animate
    }
    // Schedule the opacity flip on the SECOND animation frame so the browser
    // actually paints the initial opacity:0 state before the transition kicks
    // in (a single rAF fires before the first paint commits).
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setMounted(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [isFirstPage]);

  return (
    <div
      className="h-full transition-opacity duration-[350ms] ease-out"
      style={{ opacity: mounted ? 1 : 0 }}
    >
      {children}
    </div>
  );
}
