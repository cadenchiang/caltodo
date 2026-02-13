"use client";

import { useState } from "react";
import { signIn, signUp } from "@/app/login/actions";
import { createClient } from "@/lib/supabase/client";

/**
 * Login/signup form component with email/password fields and Google OAuth.
 * Glassy styling with no outline borders.
 */
export default function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const action = isSignUp ? signUp : signIn;
    const result = await action(formData);

    setLoading(false);

    if (result && "error" in result) {
      setError(result.error);
    } else if (result && "success" in result) {
      setSuccess(result.success);
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
    <div className="flex flex-col gap-4 w-full">
      <h1 className="text-2xl font-bold text-center text-gray-800">
        <span className="text-gray-800 font-bold">toodoo</span><span className="brand-gradient font-black">cal</span>
      </h1>
      <p className="text-sm text-center text-gray-500 -mt-2">
        {isSignUp ? "Create Account" : "Welcome Back"}
      </p>

      {error && (
        <div className="bg-red-400/10 text-red-500 text-sm p-3 rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-400/10 text-green-600 text-sm p-3 rounded-xl">
          {success}
        </div>
      )}

      {/* Google OAuth button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="flex items-center justify-center gap-3 px-4 py-3 bg-white/50 rounded-xl font-medium text-gray-700 hover:bg-white/70 transition-all"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-300/40" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-300/40" />
      </div>

      {/* Email/password form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="px-4 py-3 rounded-xl bg-white/50 text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white/70 transition-all text-sm"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          minLength={6}
          className="px-4 py-3 rounded-xl bg-white/50 text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white/70 transition-all text-sm"
        />

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-3 bg-blue-500/90 text-white rounded-xl font-medium hover:bg-blue-600/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setIsSignUp(!isSignUp);
          setError(null);
          setSuccess(null);
        }}
        className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        {isSignUp
          ? "Already have an account? Sign in"
          : "Don't have an account? Sign up"}
      </button>
    </div>
  );
}
