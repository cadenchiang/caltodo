/**
 * Sync engine that orchestrates fetching assignments from Canvas and Gradescope,
 * then upserts them into the Supabase tasks table (unified with manual tasks).
 * Server-side only — called from API routes.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { fetchAllCanvasAssignments, fetchCanvasAssignmentsForCourses, type NormalizedAssignment } from "@/lib/canvas-client";
import { fetchAllGradescopeAssignments, fetchGradescopeAssignmentsForCourses } from "@/lib/gradescope-client";
import { decrypt } from "@/lib/crypto";
import { logger } from "@/lib/logger";
import type { SyncResult, SyncSourceResult } from "@/lib/types";

const UPSERT_BATCH_SIZE = 50;

/** Default color for Canvas assignments (blue). */
const CANVAS_COLOR = "#3B82F6";
/** Default color for Gradescope assignments (green). */
const GRADESCOPE_COLOR = "#10B981";

interface CredentialsRow {
  canvas_token: string | null;
  canvas_base_url: string;
  gradescope_email: string | null;
  gradescope_password_encrypted: string | null;
  selected_canvas_courses: Array<{ id: number; name: string }> | null;
  selected_gradescope_courses: Array<{ id: string; name: string }> | null;
}

/**
 * Optional course overrides for syncing specific courses instead of stored selections.
 * When provided, these override the selected_*_courses from credentials.
 */
export interface SyncCourseOverrides {
  canvas_courses?: Array<{ id: number; name: string }>;
  gradescope_courses?: Array<{ id: string; name: string }>;
}

/**
 * Runs a full sync: fetches assignments from Canvas and Gradescope,
 * upserts them into the tasks table, and updates last_synced_at.
 * One source failing does not block the other.
 *
 * @param supabase - Authenticated Supabase client (with user session)
 * @param userId - The authenticated user's ID
 * @param timezone - IANA timezone for date/time conversion (default "America/Los_Angeles")
 * @param courseOverrides - Optional course lists to override stored selections
 * @returns SyncResult with counts and errors for each source
 */
export async function runSync(
  supabase: SupabaseClient,
  userId: string,
  timezone: string = "America/Los_Angeles",
  courseOverrides?: SyncCourseOverrides
): Promise<SyncResult> {
  // Fetch credentials
  const { data: creds, error: credsError } = await supabase
    .from("integration_credentials")
    .select("canvas_token, canvas_base_url, gradescope_email, gradescope_password_encrypted, selected_canvas_courses, selected_gradescope_courses")
    .eq("user_id", userId)
    .single();

  if (credsError || !creds) {
    logger.warn("runSync: no credentials found", { userId });
    return {
      canvas: { synced: 0, errors: ["No integration credentials configured. Go to Settings to add them."] },
      gradescope: { synced: 0, errors: ["No integration credentials configured. Go to Settings to add them."] },
      last_synced_at: new Date().toISOString(),
    };
  }

  const credentials = creds as CredentialsRow;

  // Apply course overrides if provided
  if (courseOverrides?.canvas_courses) {
    credentials.selected_canvas_courses = courseOverrides.canvas_courses;
  }
  if (courseOverrides?.gradescope_courses) {
    credentials.selected_gradescope_courses = courseOverrides.gradescope_courses;
  }

  // Run Canvas and Gradescope syncs independently
  const [canvasResult, gradescopeResult] = await Promise.all([
    syncCanvas(supabase, userId, credentials, timezone),
    syncGradescope(supabase, userId, credentials, timezone),
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
  });

  return {
    canvas: canvasResult,
    gradescope: gradescopeResult,
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
 * Supports course filtering via selected_gradescope_courses.
 */
async function syncGradescope(
  supabase: SupabaseClient,
  userId: string,
  creds: CredentialsRow,
  timezone: string
): Promise<SyncSourceResult> {
  if (!creds.gradescope_email || !creds.gradescope_password_encrypted) {
    return { synced: 0, errors: [] };
  }

  try {
    const password = decrypt(creds.gradescope_password_encrypted);
    const selectedCourses = creds.selected_gradescope_courses;
    const assignments = selectedCourses && selectedCourses.length > 0
      ? await fetchGradescopeAssignmentsForCourses(creds.gradescope_email, password, selectedCourses)
      : await fetchAllGradescopeAssignments(creds.gradescope_email, password);
    const synced = await upsertAssignments(supabase, userId, "gradescope", assignments, timezone);
    return { synced, errors: [] };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("syncGradescope failed", { userId, error: message });
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
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date(isoString));
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
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(isoString));
  } catch {
    return null;
  }
}

/**
 * Upserts normalized assignments into the tasks table in batches.
 * Course name is stored in description field for display context.
 * Uses timezone-aware date/time conversion to prevent off-by-one errors.
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
  source: "canvas" | "gradescope",
  assignments: NormalizedAssignment[],
  timezone: string
): Promise<number> {
  let totalUpserted = 0;
  const color = source === "canvas" ? CANVAS_COLOR : GRADESCOPE_COLOR;

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
      description: a.description || "",
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

  return totalUpserted;
}
