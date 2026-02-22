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
import type { IntegrationCredentials, CredentialsSavePayload } from "@/lib/types";

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

  const { data, error } = await supabase
    .from("integration_credentials")
    .select("canvas_token, canvas_base_url, gradescope_email, gradescope_password_encrypted, last_synced_at, selected_canvas_courses, selected_gradescope_courses, google_access_token_encrypted, google_calendar_id, google_email, google_photo_url, canvas_token_created_at, is_founding_member, pensieve_calendar_url")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found, which is fine for new users
    logger.error("GET /api/credentials failed", { userId: user.id, error: error.message });
    return NextResponse.json({ error: "Failed to fetch credentials" }, { status: 500 });
  }

  const credentials: IntegrationCredentials = {
    canvas_token: data?.canvas_token ?? null,
    canvas_base_url: data?.canvas_base_url ?? "https://bcourses.berkeley.edu",
    gradescope_email: data?.gradescope_email ?? null,
    has_gradescope_password: !!data?.gradescope_password_encrypted,
    last_synced_at: data?.last_synced_at ?? null,
    selected_canvas_courses: data?.selected_canvas_courses ?? null,
    selected_gradescope_courses: data?.selected_gradescope_courses ?? null,
    has_google_calendar: !!data?.google_access_token_encrypted,
    google_calendar_id: data?.google_calendar_id ?? null,
    google_email: data?.google_email ?? null,
    google_photo_url: data?.google_photo_url ?? null,
    canvas_token_created_at: data?.canvas_token_created_at ?? null,
    is_founding_member: data?.is_founding_member ?? false,
    pensieve_calendar_url: data?.pensieve_calendar_url ?? null,
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
  if (body.gradescope_email !== undefined) {
    updateData.gradescope_email = body.gradescope_email;
  }
  if (body.selected_canvas_courses !== undefined) {
    updateData.selected_canvas_courses = body.selected_canvas_courses;
  }
  if (body.selected_gradescope_courses !== undefined) {
    updateData.selected_gradescope_courses = body.selected_gradescope_courses;
  }
  if (body.pensieve_calendar_url !== undefined) {
    updateData.pensieve_calendar_url = body.pensieve_calendar_url;
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
    // New user — check if we're still under 1,000 total users
    const admin = createAdminClient();
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1, page: 1 });
    const totalUsers = (authData && "total" in authData ? authData.total : authData?.users.length) ?? 0;
    updateData.is_founding_member = totalUsers <= 1000;
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
  const { data: updated, error: readError } = await supabase
    .from("integration_credentials")
    .select("canvas_token, canvas_base_url, gradescope_email, gradescope_password_encrypted, last_synced_at, selected_canvas_courses, selected_gradescope_courses, google_access_token_encrypted, google_calendar_id, google_email, google_photo_url, canvas_token_created_at, is_founding_member, pensieve_calendar_url")
    .eq("user_id", user.id)
    .single();

  if (readError || !updated) {
    logger.error("PUT /api/credentials — re-read failed after upsert", { userId: user.id, error: readError?.message });
    return NextResponse.json({ error: "Credentials saved but failed to read back" }, { status: 500 });
  }

  const credentials: IntegrationCredentials = {
    canvas_token: updated?.canvas_token ?? null,
    canvas_base_url: updated?.canvas_base_url ?? "https://bcourses.berkeley.edu",
    gradescope_email: updated?.gradescope_email ?? null,
    has_gradescope_password: !!updated?.gradescope_password_encrypted,
    last_synced_at: updated?.last_synced_at ?? null,
    selected_canvas_courses: updated?.selected_canvas_courses ?? null,
    selected_gradescope_courses: updated?.selected_gradescope_courses ?? null,
    has_google_calendar: !!updated?.google_access_token_encrypted,
    google_calendar_id: updated?.google_calendar_id ?? null,
    google_email: updated?.google_email ?? null,
    google_photo_url: updated?.google_photo_url ?? null,
    canvas_token_created_at: updated?.canvas_token_created_at ?? null,
    is_founding_member: updated?.is_founding_member ?? false,
    pensieve_calendar_url: updated?.pensieve_calendar_url ?? null,
  };

  return NextResponse.json(credentials);
}
