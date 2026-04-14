/**
 * API route for reading and saving integration credentials.
 * GET: Returns credentials (password masked as boolean).
 * PUT: Creates or updates credentials (encrypts Gradescope password).
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { encrypt } from "@/lib/crypto";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { isAllowedCanvasUrl } from "@/lib/canvas-url-validation";
import type { IntegrationCredentials, CredentialsSavePayload, AdditionalCanvasAccount } from "@/lib/types";

/** Base columns selected from integration_credentials (excludes additional_canvas_accounts for fallback). */
const BASE_SELECT = "canvas_token, canvas_base_url, canvas_ical_url, gradescope_email, gradescope_password_encrypted, last_synced_at, selected_canvas_courses, selected_gradescope_courses, selected_pensieve_courses, google_access_token_encrypted, google_calendar_id, google_email, google_photo_url, canvas_token_created_at, is_founding_member, pensieve_calendar_url, brightspace_calendar_url, gradescope_auth_failed, email_digest_enabled, email_digest_hour, email_digest_address, dismissed_canvas_course_ids, dismissed_modals";

/**
 * GET /api/credentials
 * Returns the user's integration credentials.
 * Gradescope password is never returned — only has_gradescope_password boolean.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`credentials:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let { data, error } = await supabase
    .from("integration_credentials")
    .select(`${BASE_SELECT}, additional_canvas_accounts`)
    .eq("user_id", user.id)
    .single();

  // If the additional_canvas_accounts column doesn't exist yet, retry without it
  if (error && error.code !== "PGRST116" && error.message?.includes("additional_canvas_accounts")) {
    logger.warn("GET /api/credentials — additional_canvas_accounts column missing, retrying without it", { userId: user.id });
    ({ data, error } = await supabase
      .from("integration_credentials")
      .select(BASE_SELECT)
      .eq("user_id", user.id)
      .single());
  }

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found, which is fine for new users
    logger.error("GET /api/credentials failed", { userId: user.id, error: error.message });
    return NextResponse.json({ error: "Failed to fetch credentials" }, { status: 500 });
  }

  // Check if Canvas token has expired (120-day lifetime)
  let canvasTokenExpired = false;
  if (data?.canvas_token && data?.canvas_token_created_at) {
    const createdAt = new Date(data.canvas_token_created_at).getTime();
    const now = Date.now();
    const days120 = 120 * 24 * 60 * 60 * 1000;
    canvasTokenExpired = now - createdAt > days120;
  }

  const credentialsOnboarded = !!(
    data?.canvas_token ||
    data?.canvas_ical_url ||
    data?.gradescope_password_encrypted ||
    data?.pensieve_calendar_url ||
    data?.brightspace_calendar_url ||
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
      .eq("user_id", user.id)
      .is("deleted_at", null);
    if (membershipError) {
      logger.warn("GET /api/credentials: course_memberships count failed", {
        userId: user.id,
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
    gradescope_email: data?.gradescope_email ?? null,
    has_gradescope_password: !!data?.gradescope_password_encrypted,
    gradescope_auth_failed: data?.gradescope_auth_failed ?? false,
    last_synced_at: data?.last_synced_at ?? null,
    selected_canvas_courses: data?.selected_canvas_courses ?? null,
    selected_gradescope_courses: data?.selected_gradescope_courses ?? null,
    selected_pensieve_courses: data?.selected_pensieve_courses ?? null,
    dismissed_canvas_course_ids: data?.dismissed_canvas_course_ids ?? [],
    has_google_calendar: !!data?.google_access_token_encrypted,
    google_calendar_id: data?.google_calendar_id ?? null,
    google_email: data?.google_email ?? null,
    google_photo_url: data?.google_photo_url ?? null,
    canvas_token_created_at: data?.canvas_token_created_at ?? null,
    is_founding_member: data?.is_founding_member ?? false,
    pensieve_calendar_url: data?.pensieve_calendar_url ?? null,
    brightspace_calendar_url: data?.brightspace_calendar_url ?? null,
    additional_canvas_accounts: data?.additional_canvas_accounts ?? [],
    has_completed_onboarding: hasCompletedOnboarding,
    email_digest_enabled: data?.email_digest_enabled ?? true,
    email_digest_hour: data?.email_digest_hour ?? 15,
    email_digest_address: data?.email_digest_address ?? null,
    dismissed_modals: data?.dismissed_modals ?? {},
  };

  return NextResponse.json(credentials);
}

/**
 * PUT /api/credentials
 * Creates or updates integration credentials.
 * Gradescope password is encrypted server-side before storage.
 * Passing gradescope_password as null keeps the existing encrypted password.
 */
export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`credentials:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: CredentialsSavePayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Build the update object
  const updateData: Record<string, unknown> = {
    user_id: user.id,
  };

  if (body.canvas_token !== undefined) {
    updateData.canvas_token = body.canvas_token;
    // Track when the canvas token was set for 120-day expiration
    updateData.canvas_token_created_at = body.canvas_token
      ? new Date().toISOString()
      : null;
  }
  if (body.canvas_base_url !== undefined) {
    updateData.canvas_base_url = body.canvas_base_url;
  }
  if (body.canvas_ical_url !== undefined) {
    updateData.canvas_ical_url = body.canvas_ical_url;
  }
  if (body.gradescope_email !== undefined) {
    updateData.gradescope_email = body.gradescope_email;
  }
  if (body.selected_canvas_courses !== undefined) {
    updateData.selected_canvas_courses = body.selected_canvas_courses;
  }
  if (body.dismissed_canvas_course_ids !== undefined) {
    updateData.dismissed_canvas_course_ids = body.dismissed_canvas_course_ids;
  }
  if (body.selected_gradescope_courses !== undefined) {
    updateData.selected_gradescope_courses = body.selected_gradescope_courses;
  }
  if (body.selected_pensieve_courses !== undefined) {
    updateData.selected_pensieve_courses = body.selected_pensieve_courses;
  }
  if (body.pensieve_calendar_url !== undefined) {
    if (body.pensieve_calendar_url) {
      // Validate Pensieve URL against SSRF: must be HTTPS, not internal
      try {
        const pUrl = new URL(body.pensieve_calendar_url);
        if (pUrl.protocol !== "https:") {
          return NextResponse.json({ error: "Pensieve calendar URL must use HTTPS" }, { status: 400 });
        }
        const hostname = pUrl.hostname.toLowerCase();
        if (
          hostname === "localhost" ||
          hostname.startsWith("127.") ||
          hostname.startsWith("10.") ||
          hostname.startsWith("192.168.") ||
          /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
          hostname === "0.0.0.0" ||
          hostname === "[::1]"
        ) {
          logger.warn("PUT /api/credentials: rejected internal Pensieve URL", { userId: user.id, url: body.pensieve_calendar_url });
          return NextResponse.json({ error: "Internal URLs are not allowed" }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: "Invalid Pensieve calendar URL" }, { status: 400 });
      }
    }
    updateData.pensieve_calendar_url = body.pensieve_calendar_url;
  }
  if (body.brightspace_calendar_url !== undefined) {
    if (body.brightspace_calendar_url) {
      try {
        const bUrl = new URL(body.brightspace_calendar_url);
        if (bUrl.protocol !== "https:") {
          return NextResponse.json({ error: "Brightspace URL must use HTTPS" }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: "Invalid Brightspace URL" }, { status: 400 });
      }
    }
    updateData.brightspace_calendar_url = body.brightspace_calendar_url;
    if (body.brightspace_calendar_url) {
      logger.info("Brightspace connected", { userId: user.id, email: user.email, url: body.brightspace_calendar_url.slice(0, 60) });
    }
  }
  if (body.additional_canvas_accounts !== undefined) {
    // Validate each additional Canvas account URL against allowlist
    const accounts = body.additional_canvas_accounts as AdditionalCanvasAccount[] | null;
    if (accounts && accounts.length > 10) {
      return NextResponse.json({ error: "Maximum 10 additional Canvas accounts allowed" }, { status: 400 });
    }
    if (accounts && accounts.length > 0) {
      for (const account of accounts) {
        if (account.base_url && !isAllowedCanvasUrl(account.base_url)) {
          logger.warn("PUT /api/credentials: rejected disallowed additional Canvas URL", {
            userId: user.id,
            baseUrl: account.base_url,
          });
          return NextResponse.json(
            { error: `Invalid Canvas base URL: ${account.base_url}. Please use an HTTPS URL.` },
            { status: 400 }
          );
        }
      }
    }
    updateData.additional_canvas_accounts = body.additional_canvas_accounts;
  }
  if (body.email_digest_enabled !== undefined) {
    updateData.email_digest_enabled = body.email_digest_enabled;
  }
  if (body.email_digest_hour !== undefined) {
    updateData.email_digest_hour = body.email_digest_hour;
  }
  if (body.email_digest_address !== undefined) {
    updateData.email_digest_address = body.email_digest_address;
  }
  if (body.dismissed_modals !== undefined) {
    updateData.dismissed_modals = body.dismissed_modals;
  }
  // Only update password if explicitly provided (not null/undefined means "keep existing")
  if (body.gradescope_password !== undefined && body.gradescope_password !== null) {
    updateData.gradescope_password_encrypted = encrypt(body.gradescope_password);
    // Clear auth failure flag so auto-sync retries with new password
    updateData.gradescope_auth_failed = false;
  } else if (body.gradescope_password === null) {
    // Explicitly clear the password
    updateData.gradescope_password_encrypted = null;
    updateData.gradescope_auth_failed = false;
  }

  // Check if this is a new row (no existing credentials) — if so, mark as founding member
  const { data: existing } = await supabase
    .from("integration_credentials")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    // New user — check if we're still under 500 total users (founding member spots)
    const admin = createAdminClient();
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1, page: 1 });
    const totalUsers = (authData && "total" in authData ? authData.total : authData?.users.length) ?? 0;
    updateData.is_founding_member = totalUsers <= 500;
  }

  const { error } = await supabase
    .from("integration_credentials")
    .upsert(updateData, { onConflict: "user_id" });

  if (error) {
    logger.error("PUT /api/credentials failed", { userId: user.id, error: error.message });
    return NextResponse.json({ error: "Failed to save credentials" }, { status: 500 });
  }

  logger.info("PUT /api/credentials success", { userId: user.id });

  // Return updated credentials
  let { data: updated, error: readError } = await supabase
    .from("integration_credentials")
    .select(`${BASE_SELECT}, additional_canvas_accounts`)
    .eq("user_id", user.id)
    .single();

  // Retry without additional_canvas_accounts if column doesn't exist yet
  if (readError && readError.message?.includes("additional_canvas_accounts")) {
    logger.warn("PUT /api/credentials — additional_canvas_accounts column missing, retrying without it", { userId: user.id });
    ({ data: updated, error: readError } = await supabase
      .from("integration_credentials")
      .select(BASE_SELECT)
      .eq("user_id", user.id)
      .single());
  }

  if (readError || !updated) {
    logger.error("PUT /api/credentials — re-read failed after upsert", { userId: user.id, error: readError?.message });
    return NextResponse.json({ error: "Credentials saved but failed to read back" }, { status: 500 });
  }

  // Check Canvas token expiration for the response
  let putCanvasTokenExpired = false;
  if (updated?.canvas_token && updated?.canvas_token_created_at) {
    const createdAt = new Date(updated.canvas_token_created_at).getTime();
    const days120 = 120 * 24 * 60 * 60 * 1000;
    putCanvasTokenExpired = Date.now() - createdAt > days120;
  }

  const putHasCompletedOnboarding = !!(
    updated?.canvas_token ||
    updated?.canvas_ical_url ||
    updated?.gradescope_password_encrypted ||
    updated?.pensieve_calendar_url ||
    updated?.brightspace_calendar_url ||
    updated?.last_synced_at ||
    updated?.google_access_token_encrypted
  );

  const credentials: IntegrationCredentials = {
    canvas_token: updated?.canvas_token ?? null,
    canvas_base_url: updated?.canvas_base_url ?? "https://bcourses.berkeley.edu",
    canvas_ical_url: updated?.canvas_ical_url ?? null,
    canvas_token_expired: putCanvasTokenExpired,
    gradescope_email: updated?.gradescope_email ?? null,
    has_gradescope_password: !!updated?.gradescope_password_encrypted,
    gradescope_auth_failed: updated?.gradescope_auth_failed ?? false,
    last_synced_at: updated?.last_synced_at ?? null,
    selected_canvas_courses: updated?.selected_canvas_courses ?? null,
    dismissed_canvas_course_ids: updated?.dismissed_canvas_course_ids ?? [],
    selected_gradescope_courses: updated?.selected_gradescope_courses ?? null,
    selected_pensieve_courses: updated?.selected_pensieve_courses ?? null,
    has_google_calendar: !!updated?.google_access_token_encrypted,
    google_calendar_id: updated?.google_calendar_id ?? null,
    google_email: updated?.google_email ?? null,
    google_photo_url: updated?.google_photo_url ?? null,
    canvas_token_created_at: updated?.canvas_token_created_at ?? null,
    is_founding_member: updated?.is_founding_member ?? false,
    pensieve_calendar_url: updated?.pensieve_calendar_url ?? null,
    brightspace_calendar_url: updated?.brightspace_calendar_url ?? null,
    additional_canvas_accounts: updated?.additional_canvas_accounts ?? [],
    has_completed_onboarding: putHasCompletedOnboarding,
    email_digest_enabled: updated?.email_digest_enabled ?? true,
    email_digest_hour: updated?.email_digest_hour ?? 15,
    email_digest_address: updated?.email_digest_address ?? null,
    dismissed_modals: updated?.dismissed_modals ?? {},
  };

  return NextResponse.json(credentials);
}
