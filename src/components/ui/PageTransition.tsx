"use client";

/**
 * Page wrapper for /app/* routes. The route fade lives in
 * src/app/app/template.tsx (one 150ms `.animate-fade-in` per route change);
 * this used to stack a second 350ms opacity transition on top of it, which
 * read as a slow double fade. It now only provides the full-height box the
 * pages lay out in, so existing call sites keep working.
 *
 * @param children - The page
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="h-full">{children}</div>;
}
