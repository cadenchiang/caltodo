/**
 * Lightweight page transition wrapper.
 * Plays a snappy pop-in animation when the page mounts (tab switch).
 * Uses pathname as key so the animation re-triggers on every navigation.
 *
 * @param children - Page content to animate
 */

"use client";

import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="animate-page-in h-full">
      {children}
    </div>
  );
}
