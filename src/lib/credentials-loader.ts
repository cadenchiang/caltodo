/**
 * Loads a user's integration credentials in the shape the app consumes.
 *
 * Shared by GET /api/credentials and the /app layout's server preload, so
 * the row is assembled by exactly one piece of code whichever path asks.
 *
 * @module credentials-loader
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import type { IntegrationCredentials } from "@/lib/types";

/**
 * Columns guaranteed to exist in every deployed environment. Anything that was
 * added by a recent migration lives in OPTIONAL_SELECT so a prod database that
 * hasn't run that migration yet degrades gracefully (the column defaults) instead
 * of the whole GET 500ing. See the two-tier select in GET below.
 */
export const CORE_SELECT = "canvas_token, canvas_base_url, canvas_ical_url, gradescope_email, gradescope_password_encrypted, last_synced_at, selected_canvas_courses, selected_gradescope_courses, selected_pensieve_courses, google_access_token_encrypted, google_calendar_id, google_email, google_photo_url, canvas_token_created_at, is_founding_member, pensieve_calendar_url, brightspace_calendar_url, gradescope_auth_failed, email_digest_enabled, email_digest_hour, email_digest_address, dismissed_canvas_course_ids, dismissed_modals";

/**
 * Recently-migrated columns that may not exist in a lagging environment. Kept
 * separate so a missing-column error triggers a fallback to CORE_SELECT rather
 * than a 500. Each is optional in IntegrationCredentials (defaults applied below).
 */
export const OPTIONAL_SELECT = "google_auth_failed, additional_canvas_accounts, canvas_auth_failed, canvas_ical_failed, pensieve_auth_failed, brightspace_auth_failed, blackboard_calendar_url, blackboard_auth_failed, classroom_enabled, selected_classroom_courses, classroom_auth_failed";
export const FULL_SELECT = `${CORE_SELECT}, ${OPTIONAL_SELECT}`;

/** Postgres "undefined column" (42703) or the PostgREST message that carries it. */
export function isMissingColumnError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "42703" || /does not exist|could not find/i.test(error.message ?? "");
}


/**
 * Reads the credentials row and derives the flags the UI reads off it.
 *
 * @param supabase - A client acting as the user (RLS applies)
 * @param userId - Whose credentials to load
 * @returns The credentials, or null when the read failed outright
 * @remarks A missing row is not a failure: a new user gets defaults. A
 *          recently-migrated column missing in a lagging environment falls
 *          back to the core columns rather than failing the whole load.
 */
export async function loadCredentials(
  supabase: SupabaseClient,
  userId: string,
): Promise<IntegrationCredentials | null> {
  let { data, error } = await supabase
    .from("integration_credentials")
    .select(FULL_SELECT)
    .eq("user_id", userId)
    .single();

  // If a recently-migrated column doesn't exist yet in this environment
  // (e.g. prod hasn't run the latest migration), retry with only the columns
  // guaranteed to exist. The optional columns fall back to their defaults
  // below, so the endpoint keeps working instead of 500ing every home load.
  if (error && error.code !== "PGRST116" && isMissingColumnError(error)) {
    logger.warn("GET /api/credentials — optional column missing, retrying with CORE_SELECT", { userId: userId, error: error.message });
    ({ data, error } = await supabase
      .from("integration_credentials")
      .select(CORE_SELECT)
      .eq("user_id", userId)
      .single());
  }

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found, which is fine for new users
    logger.error("GET /api/credentials failed", { userId: userId, error: error.message });
    return null;
  }

  // Check if Canvas token has expired (120-day lifetime) or is expiring soon.
  // "Expiring soon" = within the last week of its life (day 113-120), so the
  // health banner can warn the user to reconnect BEFORE sync silently stops.
  let canvasTokenExpired = false;
  let canvasTokenExpiringSoon = false;
  if (data?.canvas_token && data?.canvas_token_created_at) {
    const ageMs = Date.now() - new Date(data.canvas_token_created_at).getTime();
    const day = 24 * 60 * 60 * 1000;
    canvasTokenExpired = ageMs > 120 * day;
    canvasTokenExpiringSoon = !canvasTokenExpired && ageMs > 113 * day;
  }

  const credentialsOnboarded = !!(
    data?.canvas_token ||
    data?.canvas_ical_url ||
    data?.gradescope_password_encrypted ||
    data?.pensieve_calendar_url ||
    data?.brightspace_calendar_url ||
    data?.blackboard_calendar_url ||
    data?.last_synced_at ||
    data?.google_access_token_encrypted
  );

  // A user is also considered onboarded if they belong to any class, even
  // without their own credentials configured — e.g. added by a classmate or
  // already synced via a previous session. This prevents the Chat "locked"
  // state from showing for users who clearly have classes.
  let hasCourseMembership = false;
  if (!credentialsOnboarded) {
    const { count, error: membershipError } = await supabase
      .from("course_memberships")
      .select("course_id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("deleted_at", null);
    if (membershipError) {
      logger.warn("GET /api/credentials: course_memberships count failed", {
        userId: userId,
        error: membershipError.message,
      });
    } else {
      hasCourseMembership = (count ?? 0) > 0;
    }
  }

  const hasCompletedOnboarding = credentialsOnboarded || hasCourseMembership;

  const credentials: IntegrationCredentials = {
    canvas_token: data?.canvas_token ?? null,
    canvas_base_url: data?.canvas_base_url ?? "https://bcourses.berkeley.edu",
    canvas_ical_url: data?.canvas_ical_url ?? null,
    canvas_token_expired: canvasTokenExpired,
    canvas_token_expiring_soon: canvasTokenExpiringSoon,
    gradescope_email: data?.gradescope_email ?? null,
    has_gradescope_password: !!data?.gradescope_password_encrypted,
    gradescope_auth_failed: data?.gradescope_auth_failed ?? false,
    canvas_auth_failed: (data as { canvas_auth_failed?: boolean } | null)?.canvas_auth_failed ?? false,
    canvas_ical_failed: (data as { canvas_ical_failed?: boolean } | null)?.canvas_ical_failed ?? false,
    // Selected above but never returned, so the settings card always saw the
    // integration as off ("Coming soon") while the row had it on and the sync
    // engine kept running it. The user could neither see nor disable it.
    classroom_enabled: (data as { classroom_enabled?: boolean } | null)?.classroom_enabled ?? false,
    selected_classroom_courses:
      (data as { selected_classroom_courses?: Array<{ id: string; name: string }> | null } | null)
        ?.selected_classroom_courses ?? null,
    classroom_auth_failed: (data as { classroom_auth_failed?: boolean } | null)?.classroom_auth_failed ?? false,
    last_synced_at: data?.last_synced_at ?? null,
    selected_canvas_courses: data?.selected_canvas_courses ?? null,
    selected_gradescope_courses: data?.selected_gradescope_courses ?? null,
    selected_pensieve_courses: data?.selected_pensieve_courses ?? null,
    dismissed_canvas_course_ids: data?.dismissed_canvas_course_ids ?? [],
    has_google_calendar: !!data?.google_access_token_encrypted,
    // Only meaningful while tokens still exist; a genuine revocation clears the
    // tokens and flips has_google_calendar false. The flag lets the UI say
    // "reconnect" (revoked) rather than a plain "not connected".
    google_auth_failed: data?.google_auth_failed ?? false,
    google_calendar_id: data?.google_calendar_id ?? null,
    google_email: data?.google_email ?? null,
    google_photo_url: data?.google_photo_url ?? null,
    canvas_token_created_at: data?.canvas_token_created_at ?? null,
    is_founding_member: data?.is_founding_member ?? false,
    pensieve_calendar_url: data?.pensieve_calendar_url ?? null,
    pensieve_auth_failed: (data as { pensieve_auth_failed?: boolean } | null)?.pensieve_auth_failed ?? false,
    brightspace_calendar_url: data?.brightspace_calendar_url ?? null,
    brightspace_auth_failed: (data as { brightspace_auth_failed?: boolean } | null)?.brightspace_auth_failed ?? false,
    blackboard_calendar_url: data?.blackboard_calendar_url ?? null,
    blackboard_auth_failed: (data as { blackboard_auth_failed?: boolean } | null)?.blackboard_auth_failed ?? false,
    additional_canvas_accounts: data?.additional_canvas_accounts ?? [],
    has_completed_onboarding: hasCompletedOnboarding,
    email_digest_enabled: data?.email_digest_enabled ?? true,
    email_digest_hour: data?.email_digest_hour ?? 15,
    email_digest_address: data?.email_digest_address ?? null,
    dismissed_modals: data?.dismissed_modals ?? {},
  };

  return credentials;
}
