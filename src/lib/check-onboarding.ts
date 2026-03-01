/**
 * Server-side helper to check whether a user has completed onboarding.
 * A user is considered onboarded if they have at least one integration
 * credential (Canvas token, Gradescope password, or Pensieve URL).
 *
 * @module check-onboarding
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Checks if the given user has completed onboarding (has at least one integration).
 *
 * @param supabase - Supabase client (server-side, authenticated as the user)
 * @param userId - The user's UUID
 * @returns true if the user has completed onboarding
 */
export async function hasCompletedOnboarding(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("integration_credentials")
    .select("canvas_token, gradescope_password_encrypted, pensieve_calendar_url")
    .eq("user_id", userId)
    .single();

  if (!data) return false;

  return !!(
    data.canvas_token ||
    data.gradescope_password_encrypted ||
    data.pensieve_calendar_url
  );
}
