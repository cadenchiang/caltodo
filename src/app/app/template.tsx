"use client";

/**
 * Per-route template wrapper for authenticated /app routes.
 *
 * Next.js mounts a fresh instance of this on every route change, which
 * runs the one page fade (`.animate-fade-in`, 150ms) on the new page each
 * time it appears. This is the only page-level fade: PageTransition is a
 * plain wrapper, so nothing stacks a second fade on top.
 *
 * Keep the wrapper styling minimal so it doesn't interfere with each
 * page's own layout (no width/height changes, no background).
 */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  // h-full so the wrapper inherits the parent <main>'s height. Without
  // this, the wrapper collapses to its content's natural height and the
  // board view's widgets shrink because they can no longer fill the
  // available vertical space.
  return <div className="animate-fade-in h-full">{children}</div>;
}
