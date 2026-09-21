/**
 * Reconciles additional Canvas accounts submitted by the browser with the
 * ones already stored.
 *
 * The client never receives tokens (see credentials-shape), so when it
 * round-trips the account list (removing one, changing a class selection)
 * every existing account arrives without its token. The stored token must
 * be kept for those, and only a freshly entered token may replace it.
 *
 * @module canvas-accounts-merge
 */

import type { AdditionalCanvasAccount, AdditionalCanvasAccountInput } from "@/lib/types";

/**
 * Merges submitted accounts with stored ones by account id.
 *
 * @param incoming - Accounts as the client submitted them (token optional)
 * @param stored - Accounts as currently stored (token present)
 * @returns Accounts ready to store: a submitted token wins, otherwise the
 *          stored token and its creation time are kept; the client-only
 *          `has_token` flag is dropped and `auth_failed` is cleared
 * @remarks An account the client omits is removed (its stored token goes
 *          with it). An unknown account with no token is stored with an
 *          empty token, which the sync engine treats as "not connected".
 */
export function mergeCanvasAccountTokens(
  incoming: AdditionalCanvasAccountInput[],
  stored: AdditionalCanvasAccount[] | null | undefined,
): AdditionalCanvasAccount[] {
  const byId = new Map((stored ?? []).map((account) => [account.id, account]));
  return incoming.map((account) => {
    const { token, has_token: _hasToken, ...rest } = account;
    void _hasToken;
    const submitted = typeof token === "string" && token.length > 0 ? token : null;
    const previous = byId.get(account.id);
    if (submitted) {
      return { ...rest, token: submitted, auth_failed: false };
    }
    return {
      ...rest,
      token: previous?.token ?? "",
      token_created_at: previous?.token_created_at ?? rest.token_created_at,
      // Saving accounts means the user just (re)entered credentials, so clear
      // any stored auth failure. The next sync re-sets it if the token is bad.
      auth_failed: false,
    };
  });
}
