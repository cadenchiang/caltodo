import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";
import LoginRightPanel from "@/components/auth/LoginRightPanel";
import GoogleOneTap from "@/components/auth/GoogleOneTap";
import { ToastProvider } from "@/contexts/ToastContext";

/**
 * Page-level metadata for /login.
 * Overrides root layout title/description with login-specific copy
 * and Open Graph tags for link previews.
 */
export const metadata: Metadata = {
  title: "Log In - caltodo",
  description:
    "Log in to caltodo. Sync your classes, upload your syllabus, and manage every deadline in one place.",
  alternates: { canonical: "/login" },
  openGraph: {
    title: "Log In - caltodo",
    description:
      "Log in to caltodo. Sync your classes and manage every deadline in one place.",
    url: "https://caltodo.me/login",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "caltodo — your assignments, synced and organized" }],
  },
};

/**
 * Two-column login page: white form on the left, cream branding panel on the right.
 * On mobile the right panel hides and the form takes the full width.
 */
export default function LoginPage() {
  return (
    <ToastProvider>
      {/* Native Google One Tap prompt — appears top-right on desktop if user has a Google session */}
      <GoogleOneTap />
      <div className="relative min-h-dvh md:h-dvh md:overflow-hidden flex flex-col md:flex-row bg-white force-light">
        {/* Logo — links back to the landing page. */}
        <Link
          href="/"
          aria-label="Back to caltodo home"
          className="absolute top-5 left-5 sm:top-6 sm:left-6 z-20 inline-flex items-center hover:opacity-70 transition-opacity"
        >
          <img src="/logo.png" alt="caltodo" className="h-7 sm:h-8 w-auto" />
        </Link>
        {/* Left: the form. Full width on mobile, half-width once the right
            panel becomes visible at md.

            flex-1 matters on mobile: the parent is flex-col there, so without
            it this column is only as tall as its content and justify-center
            has nothing to center within — the form pinned to the top of the
            viewport with a screen of dead space underneath. */}
        <div className="w-full flex-1 md:flex-none md:basis-1/2 min-w-0 flex flex-col items-center justify-center px-6 py-10 md:py-8 relative">
          {/* The glass card is a desktop treatment: it reads as a panel
              floating over the two-tone split. On mobile there is nothing
              behind it, so the border + blur just looked like a stray box on
              white — there the form sits directly on the page. */}
          <div className="w-full max-w-sm relative rounded-none md:rounded-2xl px-0 md:px-8 py-0 md:py-10 login-card">
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </div>

        {/* Right: testimonial panel — hidden on mobile */}
        <div className="hidden md:block basis-1/2 min-w-0 bg-[#f6f5f4]">
          <LoginRightPanel />
        </div>
      </div>
    </ToastProvider>
  );
}
