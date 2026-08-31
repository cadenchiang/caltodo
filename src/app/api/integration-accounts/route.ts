/**
 * CRUD for additional integration accounts.
 *
 * The primary account for each provider still lives in the flat
 * `integration_credentials` columns and is managed by /api/credentials. This
 * route only handles the extra accounts a user adds on top, which live in
 * `integration_accounts`.
 *
 * The table deliberately stores no secrets, so this route refuses any provider
 * whose connection needs one. See `integration-providers.ts` for that list and
 * the reasoning behind it.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { isAllowedCanvasUrl } from "@/lib/canvas-url-validation";
import {
  isIntegrationProvider,
  isFeedProvider,
  supportsMultipleAccounts,
  type IntegrationProvider,
} from "@/lib/integration-providers";

/** Longest accepted user-supplied label, matching the settings input. */
const MAX_LABEL_LENGTH = 60;

/**
 * GET /api/integration-accounts
 *
 * Lists the caller's additional accounts, oldest first. Never returns the
 * primary rows, which the credentials endpoint already exposes.
 *
 * @returns 200 with `{ accounts }`, or 401 when unauthenticated.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`integration-accounts:get:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { data, error } = await supabase
    .from("integration_accounts")
    .select("id, provider, label, connection, auth_failed, created_at")
    .eq("user_id", user.id)
    .eq("is_primary", false)
    .order("created_at", { ascending: true });

  if (error) {
    logger.error("integration-accounts GET failed", { userId: user.id, error: error.message });
    return NextResponse.json({ error: "Failed to load accounts" }, { status: 500 });
  }

  return NextResponse.json({ accounts: data ?? [] });
}

/**
 * POST /api/integration-accounts
 *
 * Adds one further account for a provider. Body: `{ provider, calendar_url,
 * label? }`. Only feed providers are accepted today: their whole connection is
 * a URL, so a row here is a complete account. Canvas adds go through the
 * existing credentials flow, which also stores a token.
 *
 * @returns 201 with `{ account }`, or 400/401/429 on rejection.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`integration-accounts:post:${user.id}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { provider?: unknown; calendar_url?: unknown; label?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const provider = body.provider;
  if (!isIntegrationProvider(provider)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  }
  if (!supportsMultipleAccounts(provider)) {
    return NextResponse.json(
      { error: `${provider} does not support more than one account` },
      { status: 400 }
    );
  }
  if (!isFeedProvider(provider)) {
    // Canvas is multi-account but needs a token, which this table cannot hold.
    return NextResponse.json(
      { error: `Add another ${provider} account through its setup flow` },
      { status: 400 }
    );
  }

  const url = typeof body.calendar_url === "string" ? body.calendar_url.trim() : "";
  if (!url) {
    return NextResponse.json({ error: "A calendar URL is required" }, { status: 400 });
  }
  // Same SSRF allowlist the primary feed URLs go through. Without it this
  // route would be a request forwarder pointed at arbitrary internal hosts.
  if (!isAllowedCanvasUrl(url)) {
    return NextResponse.json({ error: "Invalid calendar URL" }, { status: 400 });
  }

  const label = typeof body.label === "string" ? body.label.trim().slice(0, MAX_LABEL_LENGTH) : "";

  const { data, error } = await supabase
    .from("integration_accounts")
    .insert({
      user_id: user.id,
      provider: provider as IntegrationProvider,
      label,
      connection: { calendar_url: url },
      is_primary: false,
    })
    .select("id, provider, label, connection, auth_failed, created_at")
    .single();

  if (error) {
    logger.error("integration-accounts POST failed", {
      userId: user.id,
      provider,
      error: error.message,
    });
    return NextResponse.json({ error: "Failed to add account" }, { status: 500 });
  }

  logger.info("integration account added", { userId: user.id, provider, accountId: data.id });
  return NextResponse.json({ account: data }, { status: 201 });
}

/**
 * DELETE /api/integration-accounts?id=<uuid>
 *
 * Removes one additional account. Scoped to the caller and to non-primary
 * rows, so this can never delete the account backed by the flat columns.
 * Tasks synced from it are left for the next sync to reconcile.
 *
 * @returns 200 on success, or 400/401/404 on rejection.
 */
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "An account id is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("integration_accounts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("is_primary", false)
    .select("id")
    .maybeSingle();

  if (error) {
    logger.error("integration-accounts DELETE failed", { userId: user.id, error: error.message });
    return NextResponse.json({ error: "Failed to remove account" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  logger.info("integration account removed", { userId: user.id, accountId: id });
  return NextResponse.json({ ok: true });
}
