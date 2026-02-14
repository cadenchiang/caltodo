"use client";

import { useState } from "react";
import { signIn, signUp } from "@/app/login/actions";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/contexts/ToastContext";

/**
 * Login/signup form with always-white styling, clean minimal layout, and staggered
 * drop-in animations. Supports email/password and Google OAuth.
 */
export default function LoginForm() {
  const { showToast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const action = isSignUp ? signUp : signIn;
    const result = await action(formData);

    setLoading(false);

    if (result && "error" in result) {
      setError(result.error);
    } else if (result && "success" in result) {
      showToast(result.success);
    }
  }

  /**
   * Initiates Google OAuth sign-in via Supabase.
   * Redirects user to Google consent screen, then back to /auth/callback.
   */
  async function handleGoogleSignIn() {
    setError(null);
    const supabase = createClient();

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
    }
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-gray-800 animate-drop-in">
          {isSignUp ? "create your account" : "welcome back"}
        </h1>
        <p className="text-sm text-gray-500 mt-2 animate-drop-in delay-100">
          all your deadlines, one calendar
        </p>
      </div>

      {/* Error / Success messages */}
      {error && (
        <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-xl animate-drop-in">
          {error}
        </div>
      )}

      {/* Email/password form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="animate-drop-in delay-150">
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            email
          </label>
          <input
            name="email"
            type="email"
            placeholder="email"
            required
            autoComplete="one-time-code"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors text-sm"
          />
        </div>

        <div className="animate-drop-in delay-250">
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            password
          </label>
          <input
            name="password"
            type="password"
            placeholder="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-sm animate-drop-in delay-350 !transition-none"
        >
          {loading ? "loading..." : isSignUp ? "sign up" : "sign in"}
        </button>
      </form>

      {/* Toggle sign in / sign up */}
      <button
        type="button"
        onClick={() => {
          setIsSignUp(!isSignUp);
          setError(null);
        }}
        className="text-sm text-gray-500 hover:text-gray-800 hover:underline animate-drop-in delay-400 !transition-none"
      >
        {isSignUp
          ? "already have an account? sign in"
          : "don't have an account? sign up"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 animate-drop-in delay-450">
        <div className="flex-1 h-px bg-gray-800" />
        <span className="text-xs text-gray-500">or</span>
        <div className="flex-1 h-px bg-gray-800" />
      </div>

      {/* Google OAuth button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl bg-white text-gray-500 text-sm animate-drop-in delay-550 btn-elevated"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 3.58z" fill="#EA4335"/>
        </svg>
      </button>

      {/* Footer */}
      <p className="text-xs text-center text-gray-400 animate-drop-in delay-600">
        built for bears, by bears
      </p>
    </div>
  );
}
