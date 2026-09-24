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
import { rowHasOwnCredentials, shapeCredentials } from "@/lib/credentials-shape";

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

  const credentialsOnboarded = rowHasOwnCredentials(data);

  // A user is also considered onboarded if they belong to any class, even
  // without their own credentials configured — e.g. added by a classmate or
  // already synced via a previous session. Users who clearly have classes
  // should never be treated as un-onboarded.
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

  // One shaping function for every path that hands the row to the client,
  // so a secret can only be masked or leaked in one place.
  return shapeCredentials(data, hasCompletedOnboarding);
}
