/**
 * Shapes an integration_credentials row into what the browser may see.
 *
 * Secrets never leave this function: the Canvas token (primary and per
 * additional account) and the Gradescope password become booleans. Both
 * GET and PUT /api/credentials and the /app layout preload go through here,
 * so there is exactly one place that decides what the client receives.
 *
 * @module credentials-shape
 */

import type { AdditionalCanvasAccount, AdditionalCanvasAccountView, IntegrationCredentials } from "@/lib/types";

/** Canvas tokens live 120 days; the banner warns during the last week. */
const DAY_MS = 24 * 60 * 60 * 1000;
export const CANVAS_TOKEN_LIFETIME_DAYS = 120;
export const CANVAS_TOKEN_WARN_AFTER_DAYS = 113;

/** The raw row as selected from integration_credentials (all optional). */
export type CredentialsRow = Partial<{
  canvas_token: string | null;
  canvas_base_url: string | null;
  canvas_ical_url: string | null;
  canvas_token_created_at: string | null;
  canvas_auth_failed: boolean | null;
  canvas_ical_failed: boolean | null;
  gradescope_email: string | null;
  gradescope_password_encrypted: string | null;
  gradescope_auth_failed: boolean | null;
  last_synced_at: string | null;
  selected_canvas_courses: Array<{ id: number; name: string }> | null;
  selected_gradescope_courses: Array<{ id: string; name: string }> | null;
  selected_pensieve_courses: Array<{ id: string; name: string }> | null;
  dismissed_canvas_course_ids: number[] | null;
  google_access_token_encrypted: string | null;
  google_auth_failed: boolean | null;
  google_calendar_id: string | null;
  google_email: string | null;
  google_photo_url: string | null;
  is_founding_member: boolean | null;
  pensieve_calendar_url: string | null;
  pensieve_auth_failed: boolean | null;
  brightspace_calendar_url: string | null;
  brightspace_auth_failed: boolean | null;
  blackboard_calendar_url: string | null;
  blackboard_auth_failed: boolean | null;
  classroom_enabled: boolean | null;
  selected_classroom_courses: Array<{ id: string; name: string }> | null;
  classroom_auth_failed: boolean | null;
  additional_canvas_accounts: AdditionalCanvasAccount[] | null;
  email_digest_enabled: boolean | null;
  email_digest_hour: number | null;
  email_digest_address: string | null;
  dismissed_modals: IntegrationCredentials["dismissed_modals"] | null;
}> | null;

/**
 * Whether the row itself proves the user has set up an integration.
 *
 * @param row - The credentials row, or null for a user with none
 * @returns True when any connection or a past sync is recorded
 */
export function rowHasOwnCredentials(row: CredentialsRow): boolean {
  return !!(
    row?.canvas_token ||
    row?.canvas_ical_url ||
    row?.gradescope_password_encrypted ||
    row?.pensieve_calendar_url ||
    row?.brightspace_calendar_url ||
    row?.blackboard_calendar_url ||
    row?.last_synced_at ||
    row?.google_access_token_encrypted
  );
}

/**
 * Age-based Canvas token state.
 *
 * @param row - The credentials row
 * @param now - Current time in ms (injectable for tests)
 * @returns expired past 120 days; expiringSoon during days 113-120
 * @remarks Both false when there is no token or no creation date.
 */
export function canvasTokenAge(row: CredentialsRow, now = Date.now()): { expired: boolean; expiringSoon: boolean } {
  if (!row?.canvas_token || !row?.canvas_token_created_at) return { expired: false, expiringSoon: false };
  const ageMs = now - new Date(row.canvas_token_created_at).getTime();
  const expired = ageMs > CANVAS_TOKEN_LIFETIME_DAYS * DAY_MS;
  const expiringSoon = !expired && ageMs > CANVAS_TOKEN_WARN_AFTER_DAYS * DAY_MS;
  return { expired, expiringSoon };
}

/**
 * Replaces each additional account's token with a boolean.
 *
 * @param accounts - Accounts as stored (with tokens), or null
 * @returns The same accounts with `token` removed and `has_token` added
 */
export function maskCanvasAccounts(accounts: AdditionalCanvasAccount[] | null | undefined): AdditionalCanvasAccountView[] {
  return (accounts ?? []).map((account) => {
    const { token, ...rest } = account;
    return { ...rest, has_token: typeof token === "string" && token.length > 0 };
  });
}

/**
 * Builds the client-facing credentials object from a row.
 *
 * @param row - The row as read from the database, or null for a new user
 * @param hasCompletedOnboarding - Computed by the caller (may include course membership)
 * @param now - Current time in ms (injectable for tests)
 * @returns Credentials with every secret reduced to a boolean
 */
export function shapeCredentials(
  row: CredentialsRow,
  hasCompletedOnboarding: boolean,
  now = Date.now(),
): IntegrationCredentials {
  const age = canvasTokenAge(row, now);
  return {
    has_canvas_token: !!row?.canvas_token,
    canvas_base_url: row?.canvas_base_url ?? "https://bcourses.berkeley.edu",
    canvas_ical_url: row?.canvas_ical_url ?? null,
    canvas_token_expired: age.expired,
    canvas_token_expiring_soon: age.expiringSoon,
    canvas_auth_failed: row?.canvas_auth_failed ?? false,
    canvas_ical_failed: row?.canvas_ical_failed ?? false,
    classroom_enabled: row?.classroom_enabled ?? false,
    selected_classroom_courses: row?.selected_classroom_courses ?? null,
    classroom_auth_failed: row?.classroom_auth_failed ?? false,
    gradescope_email: row?.gradescope_email ?? null,
    has_gradescope_password: !!row?.gradescope_password_encrypted,
    gradescope_auth_failed: row?.gradescope_auth_failed ?? false,
    last_synced_at: row?.last_synced_at ?? null,
    selected_canvas_courses: row?.selected_canvas_courses ?? null,
    selected_gradescope_courses: row?.selected_gradescope_courses ?? null,
    selected_pensieve_courses: row?.selected_pensieve_courses ?? null,
    dismissed_canvas_course_ids: row?.dismissed_canvas_course_ids ?? [],
    has_google_calendar: !!row?.google_access_token_encrypted,
    google_auth_failed: row?.google_auth_failed ?? false,
    google_calendar_id: row?.google_calendar_id ?? null,
    google_email: row?.google_email ?? null,
    google_photo_url: row?.google_photo_url ?? null,
    canvas_token_created_at: row?.canvas_token_created_at ?? null,
    is_founding_member: row?.is_founding_member ?? false,
    pensieve_calendar_url: row?.pensieve_calendar_url ?? null,
    pensieve_auth_failed: row?.pensieve_auth_failed ?? false,
    brightspace_calendar_url: row?.brightspace_calendar_url ?? null,
    brightspace_auth_failed: row?.brightspace_auth_failed ?? false,
    blackboard_calendar_url: row?.blackboard_calendar_url ?? null,
    blackboard_auth_failed: row?.blackboard_auth_failed ?? false,
    additional_canvas_accounts: maskCanvasAccounts(row?.additional_canvas_accounts),
    has_completed_onboarding: hasCompletedOnboarding,
    email_digest_enabled: row?.email_digest_enabled ?? true,
    email_digest_hour: row?.email_digest_hour ?? 15,
    email_digest_address: row?.email_digest_address ?? null,
    dismissed_modals: row?.dismissed_modals ?? {},
  };
}
