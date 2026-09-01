/**
 * Resolves an `?account_id=` query parameter to one of a user's accounts.
 *
 * The course endpoints were written when a provider had exactly one account,
 * so each read the flat `integration_credentials` columns and there was no way
 * to ask for any other account's courses. Listing classes per account needs
 * that, and the lookup has to be done in one place: every one of these
 * resolvers is a point where returning the wrong row would hand one user
 * another user's courses.
 *
 * Both lookups are therefore constrained by `user_id` in the query itself, not
 * filtered afterwards, so an id belonging to somebody else resolves to nothing
 * rather than to their account.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdditionalCanvasAccount } from "@/lib/types";

/**
 * The sentinel meaning "the account in the flat credential columns".
 *
 * Callers send this rather than omitting the parameter so that a missing id is
 * distinguishable from a deliberate request for the primary account.
 */
export const PRIMARY_ACCOUNT_ID = "primary";

/** A resolved Canvas connection, whichever account it came from. */
export interface CanvasConnection {
  token: string | null;
  baseUrl: string;
  icalUrl: string | null;
}

/**
 * Reports whether an id refers to the primary account.
 *
 * @param accountId - The raw `account_id` parameter, which may be absent.
 * @returns True when the caller wants the flat credential columns.
 */
export function isPrimaryAccount(accountId: string | null): boolean {
  return !accountId || accountId === PRIMARY_ACCOUNT_ID;
}

/**
 * Resolves one of the user's Canvas accounts.
 *
 * @param supabase - Server client already bound to the request's session.
 * @param userId - The authenticated user.
 * @param accountId - `account_id` parameter, or null for the primary account.
 * @returns The connection, or null when no such account exists for this user.
 * @remarks Extra Canvas schools live in a JSONB column on the user's own
 *          credentials row, so reading that row is itself the ownership check.
 */
export async function resolveCanvasAccount(
  supabase: SupabaseClient,
  userId: string,
  accountId: string | null
): Promise<CanvasConnection | null> {
  const { data: creds } = await supabase
    .from("integration_credentials")
    .select("canvas_token, canvas_base_url, canvas_ical_url, additional_canvas_accounts")
    .eq("user_id", userId)
    .single();

  if (!creds) return null;

  if (isPrimaryAccount(accountId)) {
    return {
      token: creds.canvas_token ?? null,
      baseUrl: creds.canvas_base_url ?? "",
      icalUrl: creds.canvas_ical_url ?? null,
    };
  }

  const extra = (creds.additional_canvas_accounts ?? []) as AdditionalCanvasAccount[];
  const account = extra.find((a) => a.id === accountId);
  if (!account) return null;

  return {
    token: account.token ?? null,
    baseUrl: account.base_url ?? "",
    icalUrl: account.ical_url ?? null,
  };
}

/**
 * Resolves one of the user's feed accounts to its calendar URL.
 *
 * @param supabase - Server client already bound to the request's session.
 * @param userId - The authenticated user.
 * @param provider - Feed provider the account must belong to.
 * @param accountId - `account_id` parameter, or null for the primary account.
 * @param primaryColumn - Credential column holding the primary account's URL.
 * @returns The feed URL, or null when no such account exists for this user.
 * @remarks The provider is part of the query, so an id that exists under a
 *          different provider does not resolve here either.
 */
export async function resolveFeedAccountUrl(
  supabase: SupabaseClient,
  userId: string,
  provider: string,
  accountId: string | null,
  primaryColumn: string
): Promise<string | null> {
  if (isPrimaryAccount(accountId)) {
    const { data: creds } = await supabase
      .from("integration_credentials")
      .select(primaryColumn)
      .eq("user_id", userId)
      .single();
    const value = (creds as Record<string, unknown> | null)?.[primaryColumn];
    return typeof value === "string" && value ? value : null;
  }

  const { data: account } = await supabase
    .from("integration_accounts")
    .select("connection")
    .eq("user_id", userId)
    .eq("provider", provider)
    .eq("id", accountId)
    .single();

  const url = (account?.connection as Record<string, unknown> | undefined)?.calendar_url;
  return typeof url === "string" && url ? url : null;
}
