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
    "Log in to caltodo — the free assignment tracker for UC Berkeley students. Sync bCourses and Gradescope deadlines in one place.",
  openGraph: {
    title: "Log In - caltodo",
    description:
      "Log in to caltodo — the free assignment tracker for UC Berkeley students.",
    url: "https://caltodo.me/login",
  },
};

/**
 * Login page with theme-aware styling, centered form, and staggered drop-in animations.
 * Suspense boundary required because LoginForm uses useSearchParams.
 */
export default function LoginPage() {
  return (
    <ToastProvider>
      <div className="h-dvh overflow-hidden flex items-center justify-center px-4 bg-white force-light">
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
