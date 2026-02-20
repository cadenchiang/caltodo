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

    const properties: Record<string, string> = {};
    if (email) {
      properties.email = email;
    }

    posthog.identify(userId, properties);
  }, [userId, email]);

  return null;
}
