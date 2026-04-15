/**
 * Lightweight page transition wrapper.
 * Plays a snappy pop-in animation only on tab/page navigation, not on initial load.
 *
 * @param children - Page content to animate
 */

"use client";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  // No-op wrapper: previously remounted children via a `key` that bumped on
  // every pathname change, which made clicking a sidebar item feel delayed
  // because the old subtree had to unmount before the new page could paint.
  // Rendering children directly lets Next.js' prefetched route paint in the
  // next frame. CSS-only animations on individual pages are still fine.
  return <div className="h-full">{children}</div>;
}
