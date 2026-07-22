/**
 * Incremental sync for Google Calendar events using syncToken.
 * On first call or token expiry (410 Gone), performs a full fetch and stores the syncToken.
 * Subsequent calls use the syncToken to fetch only changed events.
 *
 * @module gcal/incremental-sync
 */

import { logger } from "@/lib/logger";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Google Calendar events.list endpoint base. */
const GCAL_EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars";

/** Maximum events per page when doing a full sync. */
const MAX_RESULTS = 2500;

/**
 * Result of an incremental or full sync operation.
 *
 * @param syncToken - The new syncToken to use for the next incremental fetch
 * @param isFullSync - Whether this was a full sync (no prior token or 410 Gone)
 */
interface SyncResult {
  syncToken: string;
  isFullSync: boolean;
}

/**
 * Performs an incremental sync using a stored syncToken, or a full sync if no token exists.
 * Handles 410 Gone by clearing the token and retrying with a full sync.
 * Stores the new syncToken in the database after a successful sync.
 *
 * @param supabase - Supabase client (admin or authenticated)
 * @param userId - The user's UUID
 * @param accessToken - Valid Google OAuth2 access token
 * @param calendarId - The Google Calendar ID to sync
 * @returns SyncResult with the new syncToken, or null on failure
 */
export async function performIncrementalSync(
  supabase: SupabaseClient,
  userId: string,
  accessToken: string,
  calendarId: string
): Promise<SyncResult | null> {
  // Read stored syncToken
  const { data: creds } = await supabase
    .from("integration_credentials")
    .select("gcal_sync_token")
    .eq("user_id", userId)
    .single();

  const storedToken = creds?.gcal_sync_token ?? null;

  if (storedToken) {
    const result = await syncWithToken(accessToken, calendarId, storedToken);
    if (result === "gone") {
      logger.info("incrementalSync: syncToken expired (410 Gone), performing full sync", { userId, calendarId });
      return performFullSync(supabase, userId, accessToken, calendarId);
    }
    if (!result) return null;

    await saveSyncState(supabase, userId, result.syncToken, false);
    return { syncToken: result.syncToken, isFullSync: false };
  }

  return performFullSync(supabase, userId, accessToken, calendarId);
}

/**
 * Performs a full sync: fetches all events and stores the resulting syncToken.
 * Updates gcal_last_full_sync_at timestamp.
 *
 * @param supabase - Supabase client
 * @param userId - The user's UUID
 * @param accessToken - Valid Google OAuth2 access token
 * @param calendarId - The Google Calendar ID to sync
 * @returns SyncResult or null on failure
 */
export async function performFullSync(
  supabase: SupabaseClient,
  userId: string,
  accessToken: string,
  calendarId: string
): Promise<SyncResult | null> {
  let pageToken: string | undefined;
  let syncToken: string | undefined;

  // Paginate through all events to obtain the final syncToken
  do {
    const params = new URLSearchParams({ maxResults: String(MAX_RESULTS) });
    if (pageToken) params.set("pageToken", pageToken);

    const url = `${GCAL_EVENTS_URL}/${encodeURIComponent(calendarId)}/events?${params}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const body = await res.text();
      logger.error("fullSync: events.list failed", { userId, calendarId, status: res.status, body: body.slice(0, 500) });
      return null;
    }

    const data = await res.json();
    pageToken = data.nextPageToken;
    syncToken = data.nextSyncToken;
  } while (pageToken);

  if (!syncToken) {
    logger.error("fullSync: no syncToken received", { userId, calendarId });
    return null;
  }

  await saveSyncState(supabase, userId, syncToken, true);
  logger.info("fullSync: completed", { userId, calendarId });
  return { syncToken, isFullSync: true };
}

/**
 * Attempts an incremental sync using the provided syncToken.
 * Returns "gone" if Google responds with 410 (token expired).
 *
 * @param accessToken - Valid Google OAuth2 access token
 * @param calendarId - The Google Calendar ID
 * @param syncToken - The syncToken from a previous sync
 * @returns Object with new syncToken, "gone" if 410, or null on error
 */
async function syncWithToken(
  accessToken: string,
  calendarId: string,
  syncToken: string
): Promise<{ syncToken: string } | "gone" | null> {
  // Google's incremental sync: the FIRST request carries the syncToken; each
  // subsequent page carries ONLY the pageToken (sending syncToken + pageToken
  // together is rejected with 400 invalid_argument). A 410 (expired syncToken)
  // can arrive on ANY page and must trigger a full resync, so check it every
  // iteration — not just the first request.
  let pageToken: string | undefined;
  let latestSyncToken: string | undefined;

  do {
    const params = pageToken
      ? new URLSearchParams({ pageToken })
      : new URLSearchParams({ syncToken });
    const url = `${GCAL_EVENTS_URL}/${encodeURIComponent(calendarId)}/events?${params}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status === 410) return "gone";
    if (!res.ok) {
      const body = await res.text();
      logger.error("syncWithToken: failed", { calendarId, status: res.status, body: body.slice(0, 500) });
      return null;
    }

    const data = await res.json();
    // nextSyncToken is only present on the final page.
    if (data.nextSyncToken) latestSyncToken = data.nextSyncToken;
    pageToken = data.nextPageToken;
  } while (pageToken);

  if (!latestSyncToken) return null;
  return { syncToken: latestSyncToken };
}

/**
 * Saves sync state to the database.
 *
 * @param supabase - Supabase client
 * @param userId - The user's UUID
 * @param syncToken - The new syncToken to store
 * @param isFullSync - Whether to also update gcal_last_full_sync_at
 */
async function saveSyncState(
  supabase: SupabaseClient,
  userId: string,
  syncToken: string,
  isFullSync: boolean
): Promise<void> {
  const update: Record<string, unknown> = {
    gcal_sync_token: syncToken,
    gcal_events_updated_at: new Date().toISOString(),
  };
  if (isFullSync) {
    update.gcal_last_full_sync_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("integration_credentials")
    .update(update)
    .eq("user_id", userId);

  if (error) {
    logger.error("saveSyncState: failed to save", { userId, error: error.message });
  }
}
