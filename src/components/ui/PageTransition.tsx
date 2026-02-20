/**
 * Lightweight page transition wrapper.
 * Plays a snappy pop-in animation when the page mounts (tab switch).
 * Tracks pathname changes via state to avoid hydration mismatch from key prop.
 *
 * @param children - Page content to animate
 */

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [pathname]);

  return (
    <div key={animKey} className="animate-page-in h-full">
      {children}
    </div>
  );
}
