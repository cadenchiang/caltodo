"use client";

/**
 * Per-route template wrapper for authenticated /app routes.
 *
 * Next.js mounts a fresh instance of this on every route change, which
 * lets us run the subtle `.animate-fade-in` keyframe on the new page
 * each time it appears. Without this wrapper the fade-in CSS exists
 * but is never applied to route swaps, leaving navigation abrupt.
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
