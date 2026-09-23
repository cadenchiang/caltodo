/**
 * API route for reading and saving integration credentials.
 * GET: Returns credentials (Canvas token and password masked as booleans).
 * PUT: Creates or updates credentials (encrypts Gradescope password).
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { encrypt } from "@/lib/crypto";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { isAllowedCanvasUrl } from "@/lib/canvas-url-validation";
import { loadCredentials, FULL_SELECT, CORE_SELECT, isMissingColumnError } from "@/lib/credentials-loader";
import { rowHasOwnCredentials, shapeCredentials } from "@/lib/credentials-shape";
import { mergeCanvasAccountTokens } from "@/lib/canvas-accounts-merge";
import type { CredentialsSavePayload, AdditionalCanvasAccount, AdditionalCanvasAccountInput } from "@/lib/types";

/**
 * GET /api/credentials
 * Returns the user's integration credentials.
 * Secrets are never returned: has_canvas_token and has_gradescope_password
 * are booleans, and additional accounts carry has_token instead of a token.
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

  const credentials = await loadCredentials(supabase, user.id);
  if (!credentials) {
    return NextResponse.json({ error: "Failed to fetch credentials" }, { status: 500 });
  }
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

  // Basic shape + length validation. We don't check exhaustively (the client
  // is authoritative for its fields) but reject obvious garbage.
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be an object" }, { status: 400 });
  }
  const CANVAS_TOKEN_MAX = 256;
  if (
    body.canvas_token !== undefined &&
    body.canvas_token !== null &&
    (typeof body.canvas_token !== "string" ||
      body.canvas_token.length === 0 ||
      body.canvas_token.length > CANVAS_TOKEN_MAX ||
      !/^[\w~.+/=-]+$/.test(body.canvas_token))
  ) {
    return NextResponse.json({ error: "canvas_token is malformed" }, { status: 400 });
  }
  if (
    body.gradescope_email !== undefined &&
    body.gradescope_email !== null &&
    (typeof body.gradescope_email !== "string" ||
      body.gradescope_email.length > 254 ||
      !body.gradescope_email.includes("@"))
  ) {
    return NextResponse.json({ error: "gradescope_email is malformed" }, { status: 400 });
  }
  const URL_FIELDS = ["canvas_ical_url", "pensieve_calendar_url", "brightspace_calendar_url", "blackboard_calendar_url"] as const;
  for (const field of URL_FIELDS) {
    const value = (body as unknown as Record<string, unknown>)[field];
    if (value !== undefined && value !== null) {
      if (typeof value !== "string" || value.length > 2048) {
        return NextResponse.json({ error: `${field} is malformed` }, { status: 400 });
      }
      try {
        new URL(value);
      } catch {
        return NextResponse.json({ error: `${field} is not a valid URL` }, { status: 400 });
      }
    }
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
    // A freshly-saved token clears any prior auth-failure flag so sync retries.
    updateData.canvas_auth_failed = false;
  }
  if (body.canvas_base_url !== undefined) {
    // SSRF guard: this URL is fetched server-side with the user's Canvas token
    // attached, so block internal/metadata hosts and non-HTTPS.
    if (body.canvas_base_url && !isAllowedCanvasUrl(body.canvas_base_url)) {
      return NextResponse.json({ error: "Invalid Canvas URL" }, { status: 400 });
    }
    updateData.canvas_base_url = body.canvas_base_url;
  }
  if (body.canvas_ical_url !== undefined) {
    if (body.canvas_ical_url && !isAllowedCanvasUrl(body.canvas_ical_url)) {
      return NextResponse.json({ error: "Invalid Canvas calendar URL" }, { status: 400 });
    }
    updateData.canvas_ical_url = body.canvas_ical_url;
    // Saving a new feed URL is the fix action — clear the stale failure flag so
    // the health banner drops the warning immediately (the next sync re-sets it
    // if the new URL is also broken).
    updateData.canvas_ical_failed = false;
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
    // Same SSRF guard as Canvas — blocks internal/metadata hosts (incl.
    // 169.254.169.254, CGNAT, IPv6, numeric encodings) and non-HTTPS.
    if (body.pensieve_calendar_url && !isAllowedCanvasUrl(body.pensieve_calendar_url)) {
      logger.warn("PUT /api/credentials: rejected disallowed Pensieve URL", { userId: user.id });
      return NextResponse.json({ error: "Invalid Pensive calendar URL" }, { status: 400 });
    }
    updateData.pensieve_calendar_url = body.pensieve_calendar_url;
    // Clear the stale failure flag on save (the fix action).
    updateData.pensieve_auth_failed = false;
  }
  if (body.blackboard_calendar_url !== undefined) {
    if (body.blackboard_calendar_url && !isAllowedCanvasUrl(body.blackboard_calendar_url)) {
      return NextResponse.json({ error: "Invalid Blackboard calendar URL" }, { status: 400 });
    }
    updateData.blackboard_calendar_url = body.blackboard_calendar_url;
    // Saving a new URL clears the stored failure so the banner does not keep
    // reporting a feed the user has just replaced.
    updateData.blackboard_auth_failed = false;
    if (body.blackboard_calendar_url) {
      logger.info("Blackboard connected", { userId: user.id, url: body.blackboard_calendar_url.slice(0, 60) });
    }
  }

  if (body.brightspace_calendar_url !== undefined) {
    if (body.brightspace_calendar_url && !isAllowedCanvasUrl(body.brightspace_calendar_url)) {
      return NextResponse.json({ error: "Invalid Brightspace URL" }, { status: 400 });
    }
    updateData.brightspace_calendar_url = body.brightspace_calendar_url;
    updateData.brightspace_auth_failed = false;
    if (body.brightspace_calendar_url) {
      logger.info("Brightspace connected", { userId: user.id, url: body.brightspace_calendar_url.slice(0, 60) });
    }
  }
  if (body.additional_canvas_accounts !== undefined) {
    // Validate each additional Canvas account URL against allowlist
    const accounts = body.additional_canvas_accounts as AdditionalCanvasAccountInput[] | null;
    if (accounts && accounts.length > 10) {
      return NextResponse.json({ error: "Maximum 10 additional Canvas accounts allowed" }, { status: 400 });
    }
    if (accounts && accounts.length > 0) {
      for (const account of accounts) {
        // Validate BOTH the API base URL and the iCal feed URL — both are
        // fetched server-side, so both are SSRF sinks.
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
        if (account.ical_url && !isAllowedCanvasUrl(account.ical_url)) {
          logger.warn("PUT /api/credentials: rejected disallowed additional Canvas iCal URL", {
            userId: user.id,
          });
          return NextResponse.json(
            { error: "Invalid Canvas calendar URL. Please use an HTTPS URL." },
            { status: 400 }
          );
        }
      }
    }
    // The client never holds tokens (GET masks them), so a round-tripped
    // account arrives without one. Keep the stored token for every account
    // id that already exists; only a freshly entered token replaces it.
    if (accounts) {
      const { data: storedRow, error: storedError } = await supabase
        .from("integration_credentials")
        .select("additional_canvas_accounts")
        .eq("user_id", user.id)
        .maybeSingle();
      if (storedError) {
        logger.error("PUT /api/credentials: failed to read stored Canvas accounts", {
          userId: user.id,
          error: storedError.message,
          impact: "save refused so existing account tokens are not overwritten",
        });
        return NextResponse.json({ error: "Failed to save credentials" }, { status: 500 });
      }
      const stored = (storedRow?.additional_canvas_accounts ?? []) as AdditionalCanvasAccount[];
      updateData.additional_canvas_accounts = mergeCanvasAccountTokens(accounts, stored);
    } else {
      updateData.additional_canvas_accounts = body.additional_canvas_accounts;
    }
  }
  if (body.email_digest_enabled !== undefined) {
    updateData.email_digest_enabled = body.email_digest_enabled;
  }
  if (body.email_digest_hour !== undefined) {
    // Validate hour is an integer 0-23; reject junk/floats/out-of-range.
    const h = body.email_digest_hour;
    if (typeof h !== "number" || !Number.isInteger(h) || h < 0 || h > 23) {
      return NextResponse.json({ error: "email_digest_hour must be an integer 0-23" }, { status: 400 });
    }
    updateData.email_digest_hour = h;
  }
  if (body.email_digest_address !== undefined) {
    if (body.email_digest_address && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email_digest_address)) {
      return NextResponse.json({ error: "Invalid email digest address" }, { status: 400 });
    }
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
    // New user — grant founding-member only if we can CONFIRM we're under 500
    // total users. `listUsers` with perPage:1 returns users.length === 1, so
    // relying on that as a fallback would flag every new user as founding.
    // Read the real `total`; if it isn't present, fail closed (don't grant).
    const admin = createAdminClient();
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1, page: 1 });
    const total = authData && typeof (authData as { total?: number }).total === "number"
      ? (authData as { total?: number }).total!
      : null;
    updateData.is_founding_member = total !== null && total <= 500;
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
    .select(FULL_SELECT)
    .eq("user_id", user.id)
    .single();

  // Retry with only guaranteed columns if a recently-migrated one is missing.
  if (readError && isMissingColumnError(readError)) {
    logger.warn("PUT /api/credentials — optional column missing, retrying with CORE_SELECT", { userId: user.id, error: readError.message });
    ({ data: updated, error: readError } = await supabase
      .from("integration_credentials")
      .select(CORE_SELECT)
      .eq("user_id", user.id)
      .single());
  }

  if (readError || !updated) {
    logger.error("PUT /api/credentials — re-read failed after upsert", { userId: user.id, error: readError?.message });
    return NextResponse.json({ error: "Credentials saved but failed to read back" }, { status: 500 });
  }

  // Same shaping as GET, so the PUT response can never carry a secret the
  // GET response would have masked.
  const credentials = shapeCredentials(updated, rowHasOwnCredentials(updated));

  return NextResponse.json(credentials);
}
