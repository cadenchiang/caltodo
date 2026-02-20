import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import { ToastProvider } from "@/contexts/ToastContext";

/**
 * Login page with theme-aware styling, centered form, and staggered drop-in animations.
 * Suspense boundary required because LoginForm uses useSearchParams.
 */
export default function LoginPage() {
  return (
    <ToastProvider>
      <div className="min-h-dvh flex items-center justify-center px-4 bg-white force-light">
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
