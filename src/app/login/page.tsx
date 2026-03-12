import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import { ToastProvider } from "@/contexts/ToastContext";

/**
 * Page-level metadata for /login.
 * Overrides root layout title/description with login-specific copy
 * and Open Graph tags for link previews.
 */
export const metadata: Metadata = {
  title: "Log In - caltodo",
  description:
    "log in to caltodo. sync your classes, upload your syllabus, and manage every deadline in one place.",
  alternates: { canonical: "/login" },
  openGraph: {
    title: "Log In - caltodo",
    description:
      "log in to caltodo. sync your classes and manage every deadline in one place.",
    url: "https://caltodo.me/login",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "caltodo — your assignments, synced and organized" }],
  },
};

/**
 * Login page with theme-aware styling, centered form, and staggered drop-in animations.
 * Suspense boundary required because LoginForm uses useSearchParams.
 */
export default function LoginPage() {
  return (
    <ToastProvider>
      <div className="h-dvh overflow-hidden flex flex-col items-center justify-center px-4 bg-white force-light">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <img
              src="/logo.png"
              alt="caltodo"
              className="h-14"
            />
          </div>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </ToastProvider>
  );
}
