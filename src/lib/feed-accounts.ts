/**
 * Multi-account support for the iCal-feed integrations.
 *
 * Pensive, Brightspace and Blackboard each connect with nothing but a calendar
 * URL, so a user can legitimately hold several: two schools, or a personal and
 * a departmental feed. The primary account still lives in its flat
 * `integration_credentials` column; any further ones live in
 * `integration_accounts`.
 *
 * Two correctness traps this module exists to close.
 *
 * First, `dismissMissingTasks` removes every task for a source that is absent
 * from the set it is given. Syncing accounts one at a time would therefore make
 * each account dismiss the previous one's tasks. Callers must gather every
 * account's assignments and upsert once, which is what `fetchAllFeedAssignments`
 * returns.
 *
 * Second, `external_id` is only unique within a feed. Two Brightspace
 * installations can hand out the same VEVENT UID, and the upsert key is
 * (user_id, source, external_id), so the second account's assignment would
 * overwrite the first's. Non-primary accounts therefore carry an account-scoped
 * suffix.
 */

import { logger } from "@/lib/logger";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NormalizedAssignment } from "@/lib/canvas-client";
import type { FeedProvider } from "@/lib/integration-providers";

/** One connected feed for a provider. */
export interface FeedAccount {
  /** integration_accounts.id, or "primary" for the flat-column account. */
  id: string;
  /** The iCal feed URL to fetch. */
  url: string;
  /**
   * True for the account stored in integration_credentials. Its assignments
   * keep their unsuffixed external_id so existing rows are not orphaned.
   */
  isPrimary: boolean;
}

/** Sentinel id for the account that still lives in the flat columns. */
export const PRIMARY_ACCOUNT_ID = "primary";

/**
 * Suffix marking an assignment as belonging to a non-primary account.
 *
 * "@" cannot appear in the generated prefixes ("bs-", "bb-", "pen-") and is
 * not produced by any feed's UID, so it cannot collide with a real id.
 */
const ACCOUNT_SUFFIX = "@";

/**
 * Scopes an external_id to a specific account.
 *
 * Primary accounts are returned unchanged: their assignments already exist in
 * the database under the bare id, and rewriting it would orphan every one of
 * them and re-import duplicates.
 *
 * @param externalId - The id the feed client generated.
 * @param account - The account the assignment came from.
 * @returns The id to upsert under.
 */
export function scopeExternalId(externalId: string, account: FeedAccount): string {
  if (account.isPrimary) return externalId;
  return `${externalId}${ACCOUNT_SUFFIX}${account.id}`;
}

/**
 * Loads every feed account for a provider, primary first.
 *
 * Failures reading `integration_accounts` are swallowed to the primary
 * account: an unavailable or not-yet-migrated table must degrade to today's
 * single-account behaviour rather than stop the sync outright.
 *
 * @param supabase - Authenticated Supabase client.
 * @param userId - Owner of the accounts.
 * @param provider - Which feed provider to load.
 * @param primaryUrl - URL from the flat column, or null when not connected.
 * @returns Accounts to sync; empty when nothing is connected at all.
 */
export async function loadFeedAccounts(
  supabase: SupabaseClient,
  userId: string,
  provider: FeedProvider,
  primaryUrl: string | null
): Promise<FeedAccount[]> {
  const accounts: FeedAccount[] = [];
  if (primaryUrl) {
    accounts.push({ id: PRIMARY_ACCOUNT_ID, url: primaryUrl, isPrimary: true });
  }

  try {
    const { data, error } = await supabase
      .from("integration_accounts")
      .select("id, connection")
      .eq("user_id", userId)
      .eq("provider", provider)
      .eq("is_primary", false);

    if (error) {
      logger.warn("loadFeedAccounts: could not read additional accounts", {
        userId,
        provider,
        error: error.message,
      });
      return accounts;
    }

    for (const row of data ?? []) {
      const url = (row.connection as Record<string, unknown> | null)?.calendar_url;
      if (typeof url === "string" && url.trim()) {
        accounts.push({ id: row.id as string, url: url.trim(), isPrimary: false });
      }
    }
  } catch (err) {
    logger.warn("loadFeedAccounts: unexpected failure, using primary only", {
      userId,
      provider,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return accounts;
}

/** Everything gathered across a provider's accounts. */
export interface FeedFetchResult {
  /** Assignments from every account that responded, ids already scoped. */
  assignments: NormalizedAssignment[];
  /** One message per account that failed. */
  errors: string[];
  /** True when at least one account was fetched without error. */
  anySucceeded: boolean;
}

/**
 * Fetches every account's feed and merges the results.
 *
 * Accounts are isolated: one broken feed contributes an error and no
 * assignments, while the rest still sync. That matters because the caller
 * upserts and dismisses over the combined set, so aborting on the first
 * failure would delete the healthy accounts' tasks.
 *
 * @param accounts - Accounts to fetch, from `loadFeedAccounts`.
 * @param fetcher - Provider's feed client, e.g. fetchBlackboardAssignments.
 * @returns Merged assignments, per-account errors, and whether any succeeded.
 */
export async function fetchAllFeedAssignments(
  accounts: FeedAccount[],
  fetcher: (url: string) => Promise<NormalizedAssignment[]>
): Promise<FeedFetchResult> {
  const assignments: NormalizedAssignment[] = [];
  const errors: string[] = [];
  let anySucceeded = false;

  const settled = await Promise.all(
    accounts.map(async (account) => {
      try {
        return { account, assignments: await fetcher(account.url), error: null as string | null };
      } catch (err) {
        return {
          account,
          assignments: [] as NormalizedAssignment[],
          error: err instanceof Error ? err.message : String(err),
        };
      }
    })
  );

  for (const { account, assignments: fetched, error } of settled) {
    if (error) {
      errors.push(account.isPrimary ? error : `Additional account: ${error}`);
      continue;
    }
    anySucceeded = true;
    for (const a of fetched) {
      assignments.push({ ...a, external_id: scopeExternalId(a.external_id, account) });
    }
  }

  return { assignments, errors, anySucceeded };
}
