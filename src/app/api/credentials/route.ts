/**
 * API route for reading and saving integration credentials.
 * GET: Returns credentials (password masked as boolean).
 * PUT: Creates or updates credentials (encrypts Gradescope password).
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/crypto";
import { logger } from "@/lib/logger";
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

  const { data, error } = await supabase
    .from("integration_credentials")
    .select("canvas_token, canvas_base_url, gradescope_email, gradescope_password_encrypted, last_synced_at, selected_canvas_courses, selected_gradescope_courses")
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
  // Only update password if explicitly provided (not null/undefined means "keep existing")
  if (body.gradescope_password !== undefined && body.gradescope_password !== null) {
    updateData.gradescope_password_encrypted = encrypt(body.gradescope_password);
  } else if (body.gradescope_password === null) {
    // Explicitly clear the password
    updateData.gradescope_password_encrypted = null;
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
  const { data: updated } = await supabase
    .from("integration_credentials")
    .select("canvas_token, canvas_base_url, gradescope_email, gradescope_password_encrypted, last_synced_at, selected_canvas_courses, selected_gradescope_courses")
    .eq("user_id", user.id)
    .single();

  const credentials: IntegrationCredentials = {
    canvas_token: updated?.canvas_token ?? null,
    canvas_base_url: updated?.canvas_base_url ?? "https://bcourses.berkeley.edu",
    gradescope_email: updated?.gradescope_email ?? null,
    has_gradescope_password: !!updated?.gradescope_password_encrypted,
    last_synced_at: updated?.last_synced_at ?? null,
    selected_canvas_courses: updated?.selected_canvas_courses ?? null,
    selected_gradescope_courses: updated?.selected_gradescope_courses ?? null,
  };

  return NextResponse.json(credentials);
}
