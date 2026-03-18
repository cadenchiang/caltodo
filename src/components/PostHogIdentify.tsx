"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { ADMIN_EMAIL } from "@/lib/admin";

/**
 * Client component that identifies the current user in PostHog.
 * Ties all captured events and session recordings to a specific user.
 * Sets PostHog special properties ($email, $name) so the People list
 * shows human-readable names instead of UUIDs.
 * Must be rendered inside the authenticated app layout where user data is available.
 *
 * @param userId - Supabase user ID
 * @param email - User's email address (optional)
 * @param fullName - User's display name from auth metadata (optional)
 */
export default function PostHogIdentify({
  userId,
  email,
  fullName,
}: {
  userId: string;
  email: string | null;
  fullName: string | null;
}) {
  useEffect(() => {
    if (!userId) return;

    // Exclude the app owner from analytics to avoid skewing results.
    // Hardcoded because ADMIN_EMAIL is a server-side env var unavailable on the client.
    if (email === "cadenchiang@berkeley.edu") {
      posthog.opt_out_capturing();
      return;
    }

    // Users without an email haven't completed sign-up — skip tracking
    if (!email) {
      posthog.identify(userId, { userId, $name: "Didn't sign up" });
      return;
    }

    const properties: Record<string, string> = {
      userId,
      email,
      $email: email,
    };
    if (fullName) {
      properties.$name = fullName;
    }

    posthog.identify(email, properties);
  }, [userId, email, fullName]);

  return null;
}
