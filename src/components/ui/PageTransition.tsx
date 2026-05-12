/**
 * Lightweight page transition wrapper.
 *
 * Plays a quick, subtle fade-in only when the user is *switching* between
 * pages. Skipped in two cases:
 *   1. Initial app load. The first paint after a hard reload should not
 *      animate — it makes the boot feel tacky.
 *   2. Chat pages (/app/discussions/*). Per product call, chat shouldn't
 *      flicker on entry.
 *
 * @param children - Page content to animate
 */

"use client";

/**
 * No-op wrapper. The fade-in animation was producing a visible white
 * flash on route swaps; we now mount children instantly with no opacity
 * transition. Kept as a thin component so existing call sites compile.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="h-full">{children}</div>;
}
