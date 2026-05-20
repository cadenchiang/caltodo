"use client";

/**
 * Page transition wrapper — simple fade in/out across every /app/*
 * route. 350ms, just opacity, nothing fancy. The loading.tsx flash
 * that used to blank the screen before the fade started has been
 * removed so the previous page stays visible until the new one
 * mounts, and the fade lands on top of it instead of on a white card.
 */

import { useEffect, useState } from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Schedule the opacity flip on the SECOND animation frame so the
  // browser actually paints the initial opacity:0 state before the
  // transition kicks in. A single requestAnimationFrame fires before
  // the first paint commits, so the previous behavior went straight
  // to opacity:1 and the user saw no fade at all.
  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setMounted(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  return (
    <div
      className="h-full transition-opacity duration-[350ms] ease-out"
      style={{ opacity: mounted ? 1 : 0 }}
    >
      {children}
    </div>
  );
}
