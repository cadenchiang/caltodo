/**
 * Sync engine that orchestrates fetching assignments from Canvas and Gradescope,
 * then upserts them into the Supabase tasks table (unified with manual tasks).
 * Server-side only — called from API routes.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { fetchAllCanvasAssignments, fetchCanvasAssignmentsForCourses, type NormalizedAssignment } from "@/lib/canvas-client";
import { fetchAllGradescopeAssignments, fetchGradescopeAssignmentsForCourses } from "@/lib/gradescope-client";
import { fetchPensieveAssignments, PENSIEVE_COLOR } from "@/lib/pensieve-client";
import { decrypt } from "@/lib/crypto";
import { logger } from "@/lib/logger";
import type { SyncResult, SyncSourceResult } from "@/lib/types";

const UPSERT_BATCH_SIZE = 50;

/** Default color for Canvas assignments (blue). */
const CANVAS_COLOR = "#3B82F6";
/** Default color for Gradescope assignments (green). */
const GRADESCOPE_COLOR = "#10B981";

/**
 * Minimum time between Gradescope login attempts (1 hour).
 * Gradescope uses password-based auth, so frequent logins trigger
 * their security system to send password reset emails.
 */
const GRADESCOPE_SYNC_COOLDOWN_MS = 60 * 60 * 1000;

interface CredentialsRow {
  canvas_token: string | null;
  canvas_base_url: string;
  gradescope_email: string | null;
  gradescope_password_encrypted: string | null;
  gradescope_auth_failed: boolean;
  last_gradescope_synced_at: string | null;
  selected_canvas_courses: Array<{ id: number; name: string }> | null;
  selected_gradescope_courses: Array<{ id: string; name: string }> | null;
  pensieve_calendar_url: string | null;
}

/**
 * Optional course overrides for syncing specific courses instead of stored selections.
 * When provided, these override the selected_*_courses from credentials.
 */
export interface SyncCourseOverrides {
  canvas_courses?: Array<{ id: number; name: string }>;
  gradescope_courses?: Array<{ id: string; name: string }>;
}

/** Which platforms to sync. When omitted, all platforms are synced. */
export type SyncPlatform = "canvas" | "gradescope" | "pensieve";

/**
 * Runs a full sync: fetches assignments from Canvas and Gradescope,
 * upserts them into the tasks table, and updates last_synced_at.
 * One source failing does not block the other.
 *
 * @param supabase - Authenticated Supabase client (with user session)
 * @param userId - The authenticated user's ID
 * @param timezone - IANA timezone for date/time conversion (default "America/Los_Angeles")
 * @param courseOverrides - Optional course lists to override stored selections
 * @param forceGradescope - If true, bypasses the 30-minute Gradescope cooldown (for manual syncs)
 * @param platforms - Optional list of platforms to sync (default: all)
 * @returns SyncResult with counts and errors for each source
 */
export async function runSync(
  supabase: SupabaseClient,
  userId: string,
  timezone: string = "America/Los_Angeles",
  courseOverrides?: SyncCourseOverrides,
  forceGradescope: boolean = false,
  platforms?: SyncPlatform[]
): Promise<SyncResult> {
  // Fetch credentials
  const { data: creds, error: credsError } = await supabase
    .from("integration_credentials")
    .select("canvas_token, canvas_base_url, gradescope_email, gradescope_password_encrypted, gradescope_auth_failed, last_gradescope_synced_at, selected_canvas_courses, selected_gradescope_courses, pensieve_calendar_url")
    .eq("user_id", userId)
    .single();

  if (credsError || !creds) {
    logger.warn("runSync: no credentials found", { userId });
    return {
      canvas: { synced: 0, errors: ["No integration credentials configured. Go to Settings to add them."] },
      gradescope: { synced: 0, errors: [] },
      pensieve: { synced: 0, errors: [] },
      last_synced_at: new Date().toISOString(),
    };
  }

  const credentials = creds as CredentialsRow;

  logger.info("runSync: credentials loaded", {
    userId,
    hasCanvasToken: !!credentials.canvas_token,
    hasGradescopeEmail: !!credentials.gradescope_email,
    hasPensieveUrl: !!credentials.pensieve_calendar_url,
    platforms: platforms ?? "all",
  });

  // Apply course overrides if provided
  if (courseOverrides?.canvas_courses) {
    credentials.selected_canvas_courses = courseOverrides.canvas_courses;
  }
  if (courseOverrides?.gradescope_courses) {
    credentials.selected_gradescope_courses = courseOverrides.gradescope_courses;
  }

  // Run syncs independently — only for requested platforms (default: all)
  const syncAll = !platforms || platforms.length === 0;
  const [canvasResult, gradescopeResult, pensieveResult] = await Promise.all([
    syncAll || platforms!.includes("canvas")
      ? syncCanvas(supabase, userId, credentials, timezone)
      : { synced: 0, errors: [] } as SyncSourceResult,
    syncAll || platforms!.includes("gradescope")
      ? syncGradescope(supabase, userId, credentials, timezone, forceGradescope)
      : { synced: 0, errors: [] } as SyncSourceResult,
    syncAll || platforms!.includes("pensieve")
      ? syncPensieve(supabase, userId, credentials, timezone)
      : { synced: 0, errors: [] } as SyncSourceResult,
  ]);

  // Update last_synced_at
  const now = new Date().toISOString();
  await supabase
    .from("integration_credentials")
    .update({ last_synced_at: now })
    .eq("user_id", userId);

  logger.info("runSync complete", {
    userId,
    canvasSynced: canvasResult.synced,
    canvasErrors: canvasResult.errors.length,
    gradescopeSynced: gradescopeResult.synced,
    gradescopeErrors: gradescopeResult.errors.length,
    pensieveSynced: pensieveResult.synced,
    pensieveErrors: pensieveResult.errors.length,
  });

  return {
    canvas: canvasResult,
    gradescope: gradescopeResult,
    pensieve: pensieveResult,
    last_synced_at: now,
  };
}

/**
 * Syncs assignments from Canvas. Returns sync result with count and errors.
 */
async function syncCanvas(
  supabase: SupabaseClient,
  userId: string,
  creds: CredentialsRow,
  timezone: string
): Promise<SyncSourceResult> {
  if (!creds.canvas_token) {
    return { synced: 0, errors: [] };
  }

  try {
    const selectedCourses = creds.selected_canvas_courses;
    const assignments = selectedCourses && selectedCourses.length > 0
      ? await fetchCanvasAssignmentsForCourses(creds.canvas_token, creds.canvas_base_url, selectedCourses)
      : await fetchAllCanvasAssignments(creds.canvas_token, creds.canvas_base_url);
    const synced = await upsertAssignments(supabase, userId, "canvas", assignments, timezone);
    return { synced, errors: [] };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("syncCanvas failed", { userId, error: message });
    return { synced: 0, errors: [message] };
  }
}

/**
 * Syncs assignments from Gradescope. Returns sync result with count and errors.
 * Enforces a 30-minute cooldown between login attempts to prevent Gradescope's
 * security system from sending password reset emails due to frequent logins.
 * Supports course filtering via selected_gradescope_courses.
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - The user's ID
 * @param creds - User's integration credentials
 * @param timezone - IANA timezone for date/time conversion
 * @param force - If true, bypasses the 30-minute cooldown (for manual syncs)
 * @returns Sync result with count and errors
 */
async function syncGradescope(
  supabase: SupabaseClient,
  userId: string,
  creds: CredentialsRow,
  timezone: string,
  force: boolean = false
): Promise<SyncSourceResult> {
  if (!creds.gradescope_email || !creds.gradescope_password_encrypted) {
    return { synced: 0, errors: [] };
  }

  // Skip sync if previous auth failed — prevents spamming Gradescope with bad credentials
  if (creds.gradescope_auth_failed) {
    logger.info("syncGradescope skipped: auth previously failed", { userId });
    return { synced: 0, errors: ["Gradescope login failed. Please update your password in Settings."] };
  }

  // Enforce 30-minute cooldown between Gradescope logins (unless forced by manual sync).
  // Gradescope uses password auth, so frequent logins trigger security emails.
  if (!force && creds.last_gradescope_synced_at) {
    const lastSync = new Date(creds.last_gradescope_synced_at).getTime();
    const elapsed = Date.now() - lastSync;
    if (elapsed < GRADESCOPE_SYNC_COOLDOWN_MS) {
      const minutesLeft = Math.ceil((GRADESCOPE_SYNC_COOLDOWN_MS - elapsed) / 60_000);
      logger.info("syncGradescope skipped: cooldown active", { userId, minutesLeft });
      return { synced: 0, errors: [] };
    }
  }

  try {
    const password = decrypt(creds.gradescope_password_encrypted);
    const selectedCourses = creds.selected_gradescope_courses;
    const assignments = selectedCourses && selectedCourses.length > 0
      ? await fetchGradescopeAssignmentsForCourses(creds.gradescope_email, password, selectedCourses)
      : await fetchAllGradescopeAssignments(creds.gradescope_email, password);
    const synced = await upsertAssignments(supabase, userId, "gradescope", assignments, timezone);

    // Update last Gradescope sync timestamp on success
    await supabase
      .from("integration_credentials")
      .update({ last_gradescope_synced_at: new Date().toISOString() })
      .eq("user_id", userId);

    return { synced, errors: [] };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("syncGradescope failed", { userId, error: message });

    // If login failed, set flag to stop retrying on future auto-syncs
    if (message.toLowerCase().includes("login failed")) {
      await supabase
        .from("integration_credentials")
        .update({ gradescope_auth_failed: true })
        .eq("user_id", userId);
      logger.warn("syncGradescope: marked auth as failed, stopping retries", { userId });
    }

    return { synced: 0, errors: [message] };
  }
}

/**
 * Syncs assignments from Pensieve iCal calendar feed.
 * Returns sync result with count and errors.
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - The user's ID
 * @param creds - User's integration credentials
 * @param timezone - IANA timezone for date/time conversion
 * @returns Sync result with count and errors
 */
async function syncPensieve(
  supabase: SupabaseClient,
  userId: string,
  creds: CredentialsRow,
  timezone: string
): Promise<SyncSourceResult> {
  if (!creds.pensieve_calendar_url) {
    logger.info("syncPensieve skipped: no calendar URL configured", { userId });
    return { synced: 0, errors: [] };
  }

  try {
    logger.info("syncPensieve: fetching assignments", { userId, url: creds.pensieve_calendar_url.slice(0, 60) });
    const assignments = await fetchPensieveAssignments(creds.pensieve_calendar_url);
    logger.info("syncPensieve: parsed assignments", { userId, count: assignments.length });
    const synced = await upsertAssignments(supabase, userId, "pensieve", assignments, timezone);
    logger.info("syncPensieve: upserted", { userId, synced });
    return { synced, errors: [] };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("syncPensieve failed", { userId, error: message });
    return { synced: 0, errors: [message] };
  }
}

/**
 * Converts an ISO datetime string to a local date string (YYYY-MM-DD)
 * in the given IANA timezone.
 *
 * @param isoString - ISO 8601 datetime string (e.g. "2026-02-14T07:59:00Z")
 * @param tz - IANA timezone identifier (e.g. "America/Los_Angeles")
 * @returns Local date string "YYYY-MM-DD" or null if input is null/invalid
 */
export function toLocalDateString(isoString: string | null, tz: string): string | null {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(d);
  } catch {
    return null;
  }
}

/**
 * Converts an ISO datetime string to a local time string (HH:MM, 24-hour)
 * in the given IANA timezone.
 *
 * @param isoString - ISO 8601 datetime string (e.g. "2026-02-14T07:59:00Z")
 * @param tz - IANA timezone identifier (e.g. "America/Los_Angeles")
 * @returns Local time string "HH:MM" or null if input is null/invalid
 */
export function toLocalTimeString(isoString: string | null, tz: string): string | null {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
  } catch {
    return null;
  }
}

/**
 * Upserts normalized assignments into the tasks table in batches.
 * Uses timezone-aware date/time conversion to prevent off-by-one errors.
 * Clears dismissed_at on upsert so previously deleted tasks reappear on resync.
 * After upserting, auto-completes all submitted but uncompleted assignments.
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - The user's ID
 * @param source - Assignment source ("canvas" or "gradescope")
 * @param assignments - Normalized assignments to upsert
 * @param timezone - IANA timezone for date/time conversion
 * @returns Number of successfully upserted assignments
 */
async function upsertAssignments(
  supabase: SupabaseClient,
  userId: string,
  source: "canvas" | "gradescope" | "pensieve",
  assignments: NormalizedAssignment[],
  timezone: string
): Promise<number> {
  let totalUpserted = 0;
  const colorMap = { canvas: CANVAS_COLOR, gradescope: GRADESCOPE_COLOR, pensieve: PENSIEVE_COLOR };
  const color = colorMap[source];
  const syncStartTime = new Date().toISOString();

  for (let i = 0; i < assignments.length; i += UPSERT_BATCH_SIZE) {
    const batch = assignments.slice(i, i + UPSERT_BATCH_SIZE);
    const rows = batch.map((a) => ({
      user_id: userId,
      source,
      external_id: a.external_id,
      course_name: a.course_name,
      title: a.title,
      due_date: toLocalDateString(a.due_date, timezone),
      due_time: toLocalTimeString(a.due_date, timezone),
      source_url: a.source_url,
      points_possible: a.points_possible,
      is_submitted: a.is_submitted ?? false,
      color,
      late_due_date: a.late_due_date ? toLocalDateString(a.late_due_date, timezone) : null,
      description: a.description || "",
      updated_at: new Date().toISOString(),
      // Clear dismissed_at so previously deleted tasks reappear on resync.
      // If the assignment exists on the source platform, it should show in caltodo.
      dismissed_at: null,
      // Clear snoozed_until so re-synced tasks are not permanently hidden.
      snoozed_until: null,
    }));

    const { error } = await supabase
      .from("tasks")
      .upsert(rows, { onConflict: "user_id,source,external_id" });

    if (error) {
      logger.error("upsertAssignments batch failed", {
        source,
        batchStart: i,
        error: error.message,
      });
    } else {
      totalUpserted += batch.length;
    }
  }

  // Auto-complete all submitted assignments that aren't yet marked complete.
  // Removed created_at filter so assignments submitted between syncs get auto-completed.
  const { error: autoCompleteError } = await supabase
    .from("tasks")
    .update({ is_completed: true, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("source", source)
    .eq("is_submitted", true)
    .eq("is_completed", false);

  if (autoCompleteError) {
    logger.error("upsertAssignments auto-complete failed", {
      source,
      error: autoCompleteError.message,
    });
  }

  return totalUpserted;
}
