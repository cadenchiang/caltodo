"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

/**
 * Client component that identifies the current user in PostHog.
 * Ties all captured events and session recordings to a specific user.
 * Must be rendered inside the authenticated app layout where user data is available.
 *
 * @param userId - Supabase user ID
 * @param email - User's email address (optional)
 */
export default function PostHogIdentify({
  userId,
  email,
}: {
  userId: string;
  email: string | null;
}) {
  useEffect(() => {
    if (!userId) return;

    // Exclude the app owner from analytics to avoid skewing results
    if (email === "cadenchiang@berkeley.edu") {
      posthog.opt_out_capturing();
      return;
    }

    const properties: Record<string, string> = { userId };
    if (email) {
      properties.email = email;
    }

    // Use email as the distinct ID so people show as emails in PostHog,
    // falling back to Supabase userId if email is unavailable
    posthog.identify(email ?? userId, properties);
  }, [userId, email]);

  return null;
}
