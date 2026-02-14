"use client";

import Link from "next/link";

/**
 * Hero landing page for unauthenticated users.
 * Notion Calendar-style design adapted for toodoocal branding.
 * Features staggered appear animations and clean typography.
 */
export default function Hero() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <h1 className="text-lg font-bold tracking-tight">
          <span className="text-foreground">toodoo</span>
          <span className="brand-gradient font-black">cal</span>
        </h1>
        <Link
          href="/login"
          className="px-5 py-2 text-sm font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
        >
          Sign in
        </Link>
      </nav>

      {/* Hero content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="max-w-2xl text-center">
          {/* Pill badge */}
          <div className="opacity-0 animate-appear inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            For UC Berkeley students
          </div>

          {/* Heading */}
          <h2 className="opacity-0 animate-appear delay-100 text-5xl sm:text-6xl font-bold text-foreground tracking-tight leading-[1.1] mb-6">
            Your assignments,{" "}
            <span className="brand-gradient">one calendar.</span>
          </h2>

          {/* Subtitle */}
          <p className="opacity-0 animate-appear delay-300 text-lg text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
            toodoocal syncs your Canvas and Gradescope assignments into a single, clean inbox and calendar. Never miss a deadline again.
          </p>

          {/* CTA buttons */}
          <div className="opacity-0 animate-appear delay-500 flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-3 text-sm font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
            >
              Get started free
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 text-sm font-semibold text-secondary-foreground bg-muted rounded-full hover:bg-accent transition-colors"
            >
              Learn more
            </Link>
          </div>
        </div>

        {/* Feature pills */}
        <div className="opacity-0 animate-appear delay-700 flex flex-wrap items-center justify-center gap-3 mt-16">
          {[
            "Canvas sync",
            "Gradescope sync",
            "Course selection",
            "Calendar view",
            "One-click setup",
          ].map((feature) => (
            <span
              key={feature}
              className="px-4 py-1.5 text-xs font-medium text-muted-foreground bg-card border border-border rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-subtle-foreground">
        Built for Bears, by Bears.
      </footer>
    </div>
  );
}
