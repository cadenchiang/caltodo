/**
 * Sync engine that orchestrates fetching assignments from Canvas and Gradescope,
 * then upserts them into the Supabase tasks table (unified with manual tasks).
 * Server-side only — called from API routes.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { fetchAllCanvasAssignments, fetchCanvasAssignmentsForCourses, fetchCanvasCourses, type NormalizedAssignment } from "@/lib/canvas-client";
import { fetchCanvasICalAssignments } from "@/lib/canvas-ical-client";
import { fetchAllGradescopeAssignments, fetchGradescopeAssignmentsForCourses } from "@/lib/gradescope-client";
import { fetchPensieveAssignments, PENSIEVE_COLOR } from "@/lib/pensieve-client";
import { fetchBrightspaceAssignments } from "@/lib/brightspace-client";
import { decrypt } from "@/lib/crypto";
import { logger } from "@/lib/logger";
import { isAllowedCanvasUrl } from "@/lib/canvas-url-validation";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncCourseEnrollments, gatherEnrollableCourses } from "@/lib/course-enrollment";
import { buildCourseNameMap, getCanonicalName } from "@/lib/course-name-merge";
import type { SyncResult, SyncSourceResult, AdditionalCanvasAccount } from "@/lib/types";

const UPSERT_BATCH_SIZE = 50;

/** Default color for Canvas assignments (blue). */
const CANVAS_COLOR = "#0e89d6";
/** Default color for Gradescope assignments (green). */
const GRADESCOPE_COLOR = "#10B981";

interface CredentialsRow {
  canvas_token: string | null;
  canvas_token_created_at: string | null;
  canvas_base_url: string;
  canvas_ical_url: string | null;
  gradescope_email: string | null;
  gradescope_password_encrypted: string | null;
  gradescope_auth_failed: boolean;
  last_gradescope_synced_at: string | null;
  selected_canvas_courses: Array<{ id: number; name: string }> | null;
  selected_gradescope_courses: Array<{ id: string; name: string }> | null;
  selected_pensieve_courses: Array<{ id: string; name: string }> | null;
  pensieve_calendar_url: string | null;
  brightspace_calendar_url: string | null;
  additional_canvas_accounts: AdditionalCanvasAccount[];
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
export type SyncPlatform = "canvas" | "gradescope" | "pensieve" | "brightspace";

/**
 * Runs a full sync: fetches assignments from Canvas and Gradescope,
 * upserts them into the tasks table, and updates last_synced_at.
 * One source failing does not block the other.
 *
 * @param supabase - Authenticated Supabase client (with user session)
 * @param userId - The authenticated user's ID
 * @param timezone - IANA timezone for date/time conversion (default "America/Los_Angeles")
 * @param courseOverrides - Optional course lists to override stored selections
 * @param forceGradescope - If true, bypasses the 1-hour Gradescope cooldown (for manual syncs)
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
    .select("canvas_token, canvas_token_created_at, canvas_base_url, canvas_ical_url, gradescope_email, gradescope_password_encrypted, gradescope_auth_failed, last_gradescope_synced_at, selected_canvas_courses, selected_gradescope_courses, selected_pensieve_courses, pensieve_calendar_url, brightspace_calendar_url, additional_canvas_accounts")
    .eq("user_id", userId)
    .single();

  if (credsError || !creds) {
    logger.warn("runSync: no credentials found", { userId });
    return {
      canvas: { synced: 0, errors: ["No integration credentials configured. Go to Settings to add them."] },
      gradescope: { synced: 0, errors: [] },
      pensieve: { synced: 0, errors: [] },
      brightspace: { synced: 0, errors: [] },
      last_synced_at: new Date().toISOString(),
    };
  }

  const credentials = creds as CredentialsRow;

  logger.info("runSync: credentials loaded", {
    userId,
    hasCanvasToken: !!credentials.canvas_token,
    hasCanvasIcal: !!credentials.canvas_ical_url,
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

  // Build cross-platform course name map so duplicate courses (e.g. "UGBA 101A"
  // on both Canvas and Gradescope) get the same canonical course_name on tasks.
  const enrollable = gatherEnrollableCourses(credentials);
  const courseNameMap = buildCourseNameMap(enrollable);

  // Run syncs independently — only for requested platforms (default: all)
  const syncAll = !platforms || platforms.length === 0;
  const [canvasResult, gradescopeResult, pensieveResult, brightspaceResult] = await Promise.all([
    syncAll || platforms!.includes("canvas")
      ? syncCanvas(supabase, userId, credentials, timezone, courseNameMap)
      : { synced: 0, errors: [] } as SyncSourceResult,
    syncAll || platforms!.includes("gradescope")
      ? syncGradescope(supabase, userId, credentials, timezone, forceGradescope, courseNameMap)
      : { synced: 0, errors: [] } as SyncSourceResult,
    syncAll || platforms!.includes("pensieve")
      ? syncPensieve(supabase, userId, credentials, timezone, courseNameMap)
      : { synced: 0, errors: [] } as SyncSourceResult,
    syncAll || platforms!.includes("brightspace")
      ? syncBrightspace(supabase, userId, credentials, timezone, courseNameMap)
      : { synced: 0, errors: [] } as SyncSourceResult,
  ]);

  // Sync additional Canvas accounts (all run under the "canvas" platform flag)
  if (syncAll || platforms?.includes("canvas")) {
    const additionalAccounts = credentials.additional_canvas_accounts ?? [];
    for (const account of additionalAccounts) {
      const result = await syncAdditionalCanvas(supabase, userId, account, timezone, courseNameMap);
      canvasResult.synced += result.synced;
      canvasResult.errors.push(...result.errors);
    }
  }

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
    brightspaceSynced: brightspaceResult.synced,
    brightspaceErrors: brightspaceResult.errors.length,
  });

  // Auto-enroll user into discussion boards for their synced courses.
  // Uses (source, external_id) as dedup key so name changes don't split boards.
  try {
    const adminClient = createAdminClient();
    // Apply canonical names to enrollable courses so cross-platform duplicates
    // share the same display name in the courses table.
    const mergedEnrollable = enrollable.map((c) => ({
      ...c,
      name: getCanonicalName(c.name, courseNameMap),
    }));
    await syncCourseEnrollments(adminClient, userId, mergedEnrollable);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("runSync: course enrollment failed (non-blocking)", {
      userId,
      error: message,
    });
    // Enrollment failure is non-blocking — sync results are still valid
  }

  // Detect new Canvas courses the user hasn't selected yet
  let newCanvasCourses: Array<{ id: number; name: string }> | undefined;
  if (credentials.canvas_token && Array.isArray(credentials.selected_canvas_courses) && credentials.selected_canvas_courses.length > 0) {
    try {
      const allCourses = await fetchCanvasCourses(credentials.canvas_token, credentials.canvas_base_url);
      const selectedIds = new Set(credentials.selected_canvas_courses.map((c) => c.id));
      // Only flag current-term courses (Spring 2026 patterns)
      const termPatterns = ["Spring 2026", "SP26", "Sp26", "S'26", "S26", "sp2026", "Sp2026"];
      const unselected = allCourses.filter(
        (c) => !selectedIds.has(c.id) && c.name && termPatterns.some((p) => c.name.includes(p))
      );
      if (unselected.length > 0) {
        newCanvasCourses = unselected.map((c) => ({ id: c.id, name: c.name }));
        logger.info("runSync: detected new unselected Canvas courses", {
          userId,
          courses: newCanvasCourses.map((c) => c.name),
        });
      }
    } catch {
      // Non-blocking — don't fail sync if course detection fails
    }
  }

  return {
    canvas: canvasResult,
    gradescope: gradescopeResult,
    pensieve: pensieveResult,
    brightspace: brightspaceResult,
    last_synced_at: now,
    ...(newCanvasCourses?.length ? { new_canvas_courses: newCanvasCourses } : {}),
  };
}

/**
 * Syncs assignments from Canvas. Returns sync result with count and errors.
 */
async function syncCanvas(
  supabase: SupabaseClient,
  userId: string,
  creds: CredentialsRow,
  timezone: string,
  courseNameMap: Map<string, string> = new Map()
): Promise<SyncSourceResult> {
  if (!creds.canvas_ical_url && !creds.canvas_token) {
    return { synced: 0, errors: [] };
  }

  // Check if Canvas API token has expired (120-day lifespan)
  if (creds.canvas_token && creds.canvas_token_created_at) {
    const TOKEN_LIFESPAN_MS = 120 * 24 * 60 * 60 * 1000; // 120 days
    const createdAt = new Date(creds.canvas_token_created_at).getTime();
    if (createdAt + TOKEN_LIFESPAN_MS < Date.now()) {
      logger.warn("syncCanvas: canvas token expired", { userId });
      return { synced: 0, errors: ["bCourses token expired. Reconnect in Settings."] };
    }
  }

  try {
    let assignments: NormalizedAssignment[];

    if (creds.canvas_ical_url) {
      // iCal feed path — filter by selected courses if set
      const selectedCourses = creds.selected_canvas_courses;
      if (Array.isArray(selectedCourses) && selectedCourses.length === 0) {
        logger.info("syncCanvas skipped: no courses selected (iCal)", { userId });
        return { synced: 0, errors: [] };
      }
      const allIcalAssignments = await fetchCanvasICalAssignments(creds.canvas_ical_url);
      if (selectedCourses && selectedCourses.length > 0) {
        const selectedNames = new Set(selectedCourses.map((c) => c.name));
        assignments = allIcalAssignments.filter((a) => selectedNames.has(a.course_name));
      } else {
        assignments = allIcalAssignments;
      }
    } else if (creds.canvas_token) {
      // API token path
      const selectedCourses = creds.selected_canvas_courses;

      // [] = user explicitly deselected all courses, sync nothing
      if (Array.isArray(selectedCourses) && selectedCourses.length === 0) {
        logger.info("syncCanvas skipped: no courses selected", { userId });
        return { synced: 0, errors: [] };
      }

      // null = no selection made yet, sync ALL courses
      // array with items = sync only selected courses
      assignments = selectedCourses && selectedCourses.length > 0
        ? await fetchCanvasAssignmentsForCourses(creds.canvas_token, creds.canvas_base_url, selectedCourses)
        : await fetchAllCanvasAssignments(creds.canvas_token, creds.canvas_base_url);
    } else {
      return { synced: 0, errors: [] };
    }
    // Apply canonical course names so cross-platform duplicates merge
    const merged = assignments.map((a) => ({
      ...a,
      course_name: getCanonicalName(a.course_name, courseNameMap),
    }));
    const result = await upsertAssignments(supabase, userId, "canvas", merged, timezone);
    // Dismiss tasks the user/teacher deleted on Canvas itself: any DB row
    // whose course we just successfully synced but whose external_id wasn't
    // in the fresh API response is no longer real.
    await dismissMissingTasks(supabase, userId, "canvas", merged);
    return { synced: result.synced, errors: result.errors };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("syncCanvas failed", { userId, error: message });
    return { synced: 0, errors: [message] };
  }
}

/**
 * Syncs assignments from an additional Canvas account.
 * Namespaces external_id as "<account_id>:<assignment_id>" to prevent
 * collisions with the primary bCourses integration and other accounts.
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - The user's ID
 * @param account - The additional Canvas account to sync
 * @param timezone - IANA timezone for date/time conversion
 * @returns Sync result with count and errors
 */
async function syncAdditionalCanvas(
  supabase: SupabaseClient,
  userId: string,
  account: AdditionalCanvasAccount,
  timezone: string,
  courseNameMap: Map<string, string> = new Map()
): Promise<SyncSourceResult> {
  if (!account.token && !account.ical_url) {
    return { synced: 0, errors: [] };
  }

  try {
    let assignments: NormalizedAssignment[];

    if (account.ical_url) {
      // iCal feed path
      assignments = await fetchCanvasICalAssignments(account.ical_url);
    } else if (account.token) {
      // Defense-in-depth: validate URL before making any outbound request
      if (!isAllowedCanvasUrl(account.base_url)) {
        logger.warn("syncAdditionalCanvas: rejected disallowed base_url", {
          userId,
          accountId: account.id,
          baseUrl: account.base_url,
        });
        return { synced: 0, errors: [`${account.label}: URL not allowed (${account.base_url})`] };
      }

      const selectedCourses = account.selected_courses;

      // [] = user explicitly deselected all courses, sync nothing
      if (Array.isArray(selectedCourses) && selectedCourses.length === 0) {
        logger.info("syncAdditionalCanvas skipped: no courses selected", { userId, accountId: account.id });
        return { synced: 0, errors: [] };
      }

      assignments = selectedCourses && selectedCourses.length > 0
        ? await fetchCanvasAssignmentsForCourses(account.token, account.base_url, selectedCourses)
        : await fetchAllCanvasAssignments(account.token, account.base_url);
    } else {
      return { synced: 0, errors: [] };
    }

    // Namespace external_id to prevent collisions with primary bCourses
    // and apply canonical course names for cross-platform merging
    const namespacedAssignments = assignments.map((a) => ({
      ...a,
      external_id: `${account.id}:${a.external_id}`,
      course_name: getCanonicalName(a.course_name, courseNameMap),
    }));

    const result = await upsertAssignments(supabase, userId, "canvas", namespacedAssignments, timezone);
    await dismissMissingTasks(supabase, userId, "canvas", namespacedAssignments);
    logger.info("syncAdditionalCanvas complete", {
      userId,
      accountId: account.id,
      label: account.label,
      synced: result.synced,
    });
    return { synced: result.synced, errors: result.errors };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("syncAdditionalCanvas failed", { userId, accountId: account.id, error: message });
    return { synced: 0, errors: [`${account.label}: ${message}`] };
  }
}

/**
 * Syncs assignments from Gradescope. Returns sync result with count and errors.
 * Enforces a 1-hour cooldown between login attempts to prevent Gradescope's
 * security system from sending password reset emails due to frequent logins.
 * Supports course filtering via selected_gradescope_courses.
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - The user's ID
 * @param creds - User's integration credentials
 * @param timezone - IANA timezone for date/time conversion
 * @param force - If true, bypasses the 1-hour cooldown (for manual syncs)
 * @returns Sync result with count and errors
 */
async function syncGradescope(
  supabase: SupabaseClient,
  userId: string,
  creds: CredentialsRow,
  timezone: string,
  force: boolean = false,
  courseNameMap: Map<string, string> = new Map()
): Promise<SyncSourceResult> {
  if (!creds.gradescope_email || !creds.gradescope_password_encrypted) {
    return { synced: 0, errors: [] };
  }

  // Skip sync if previous auth failed — prevents spamming Gradescope with bad credentials
  if (creds.gradescope_auth_failed) {
    logger.info("syncGradescope skipped: auth previously failed", { userId });
    return { synced: 0, errors: ["Gradescope login failed. Please update your password in Settings."] };
  }

  // Enforce a login cooldown. Gradescope's anti-abuse system reacts to frequent
  // programmatic logins by locking the account / sending password-reset emails,
  // which kills sync for the rest of the semester. Auto-syncs (force=false)
  // that ran a successful login recently are skipped entirely (not an error);
  // manual syncs (force=true) always go through. Without this the client's
  // on-mount + 30-min + on-focus auto-sync, multiplied across tabs/devices,
  // hammered the login endpoint. See route: forceGradescope.
  const GRADESCOPE_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes
  if (!force) {
    // Atomically CLAIM the cooldown window before logging in. The previous
    // read-then-act check let two concurrent syncs (mount + focus + timer
    // across tabs/devices) both read a stale timestamp, both pass, and both
    // log in — tripping Gradescope's anti-abuse lockout. This conditional
    // update advances last_gradescope_synced_at only if it's null or older
    // than the cooldown; if it returns no row, another sync just claimed the
    // window, so we skip. Claiming before login also means a failed login
    // still holds the cooldown (don't hammer on failure).
    const cutoff = new Date(Date.now() - GRADESCOPE_COOLDOWN_MS).toISOString();
    const { data: claimed, error: claimError } = await supabase
      .from("integration_credentials")
      .update({ last_gradescope_synced_at: new Date().toISOString() })
      .eq("user_id", userId)
      .or(`last_gradescope_synced_at.is.null,last_gradescope_synced_at.lt.${cutoff}`)
      .select("user_id");
    if (claimError) {
      logger.error("syncGradescope: failed to claim cooldown", { userId, error: claimError.message });
      return { synced: 0, errors: [claimError.message] };
    }
    if (!claimed || claimed.length === 0) {
      logger.info("syncGradescope skipped: cooldown held by another sync or still cooling down", { userId });
      return { synced: 0, errors: [] };
    }
  }

  try {
    const password = decrypt(creds.gradescope_password_encrypted);
    const selectedCourses = creds.selected_gradescope_courses;

    // null = no selection made yet (first time), sync all courses
    // [] = user explicitly deselected all courses, sync nothing
    if (Array.isArray(selectedCourses) && selectedCourses.length === 0) {
      logger.info("syncGradescope skipped: no courses selected", { userId });
      return { synced: 0, errors: [] };
    }

    const assignments = selectedCourses && selectedCourses.length > 0
      ? await fetchGradescopeAssignmentsForCourses(creds.gradescope_email, password, selectedCourses)
      : await fetchAllGradescopeAssignments(creds.gradescope_email, password);

    // Login succeeded but zero assignments parsed. Because Gradescope is an
    // HTML scraper, this is a strong signal the page structure changed (broken
    // selectors) rather than a genuinely empty account — flag it loudly so it
    // surfaces in logs / monitoring instead of masquerading as a clean sync.
    if (assignments.length === 0) {
      logger.warn("syncGradescope: login succeeded but parsed 0 assignments — possible Gradescope HTML/structure change", {
        userId,
        hadSelectedCourses: Array.isArray(selectedCourses) && selectedCourses.length > 0,
      });
    }

    // Login succeeded — clear any previous auth failure flag before processing
    await supabase
      .from("integration_credentials")
      .update({ gradescope_auth_failed: false })
      .eq("user_id", userId);

    // Apply canonical course names for cross-platform merging
    const merged = assignments.map((a) => ({
      ...a,
      course_name: getCanonicalName(a.course_name, courseNameMap),
    }));
    const result = await upsertAssignments(supabase, userId, "gradescope", merged, timezone);
    await dismissMissingTasks(supabase, userId, "gradescope", merged);

    // Update last Gradescope sync timestamp on success and clear auth failure flag
    await supabase
      .from("integration_credentials")
      .update({ last_gradescope_synced_at: new Date().toISOString(), gradescope_auth_failed: false })
      .eq("user_id", userId);

    return { synced: result.synced, errors: result.errors };
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
  timezone: string,
  courseNameMap: Map<string, string> = new Map()
): Promise<SyncSourceResult> {
  if (!creds.pensieve_calendar_url) {
    logger.info("syncPensieve skipped: no calendar URL configured", { userId });
    return { synced: 0, errors: [] };
  }

  try {
    logger.info("syncPensieve: fetching assignments", { userId, url: creds.pensieve_calendar_url.slice(0, 60) });
    let assignments = await fetchPensieveAssignments(creds.pensieve_calendar_url);
    logger.info("syncPensieve: parsed assignments", { userId, count: assignments.length });

    // null = no selection made yet (first time), sync all courses
    // [] = user explicitly deselected all courses, sync nothing
    if (Array.isArray(creds.selected_pensieve_courses) && creds.selected_pensieve_courses.length === 0) {
      logger.info("syncPensieve skipped: no courses selected", { userId });
      return { synced: 0, errors: [] };
    }

    if (creds.selected_pensieve_courses && creds.selected_pensieve_courses.length > 0) {
      const allowedNames = new Set(creds.selected_pensieve_courses.map((c) => c.name));
      assignments = assignments.filter((a) => a.course_name && allowedNames.has(a.course_name));
      logger.info("syncPensieve: filtered by selected courses", {
        userId,
        allowed: creds.selected_pensieve_courses.length,
        afterFilter: assignments.length,
      });
    }

    // Apply canonical course names for cross-platform merging
    const merged = assignments.map((a) => ({
      ...a,
      course_name: getCanonicalName(a.course_name, courseNameMap),
    }));
    const result = await upsertAssignments(supabase, userId, "pensieve", merged, timezone);
    await dismissMissingTasks(supabase, userId, "pensieve", merged);
    logger.info("syncPensieve: upserted", { userId, synced: result.synced });
    return { synced: result.synced, errors: result.errors };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("syncPensieve failed", { userId, error: message });
    return { synced: 0, errors: [message] };
  }
}

/**
 * Syncs assignments from Brightspace iCal calendar feed.
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - The user's ID
 * @param creds - User's integration credentials
 * @param timezone - IANA timezone for date/time conversion
 * @returns Sync result with count and errors
 */
async function syncBrightspace(
  supabase: SupabaseClient,
  userId: string,
  creds: CredentialsRow,
  timezone: string,
  courseNameMap: Map<string, string> = new Map()
): Promise<SyncSourceResult> {
  if (!creds.brightspace_calendar_url) {
    return { synced: 0, errors: [] };
  }

  try {
    logger.info("syncBrightspace: fetching assignments", { userId });
    const assignments = await fetchBrightspaceAssignments(creds.brightspace_calendar_url);
    logger.info("syncBrightspace: parsed assignments", { userId, count: assignments.length });

    const merged = assignments.map((a) => ({
      ...a,
      course_name: getCanonicalName(a.course_name, courseNameMap),
    }));
    const result = await upsertAssignments(supabase, userId, "brightspace", merged, timezone);
    await dismissMissingTasks(supabase, userId, "brightspace", merged);
    return { synced: result.synced, errors: result.errors };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("syncBrightspace failed", { userId, error: message });
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
 * @returns Object with count of successfully upserted assignments and any errors
 */
async function upsertAssignments(
  supabase: SupabaseClient,
  userId: string,
  source: "canvas" | "gradescope" | "pensieve" | "brightspace",
  assignments: NormalizedAssignment[],
  timezone: string
): Promise<{ synced: number; errors: string[] }> {
  let totalUpserted = 0;
  let failedBatches = 0;
  const BRIGHTSPACE_COLOR = "#E87040"; // D2L orange
  const colorMap = { canvas: CANVAS_COLOR, gradescope: GRADESCOPE_COLOR, pensieve: PENSIEVE_COLOR, brightspace: BRIGHTSPACE_COLOR };
  const color = colorMap[source];
  const syncStartTime = new Date().toISOString();
  const upsertedExternalIds: string[] = [];

  // Query existing rows so we can:
  //   1. Skip overwriting user-customized colors on existing tasks
  //   2. Skip overwriting user-edited due_date / due_time
  // See migration 20260409000001 for the manual-edit tracking columns.
  //
  // Paginate: PostgREST caps a single response at ~1000 rows by default. A
  // user with >1000 synced tasks in one source would otherwise have the
  // overflow rows treated as "new" — clobbering their custom colors and
  // manually-edited due dates/times on every sync.
  type ExistingRow = { external_id: string | null; due_date_manually_edited_at: string | null; due_time_manually_edited_at: string | null };
  const existingTaskRows: ExistingRow[] = [];
  const EXISTING_PAGE = 1000;
  for (let from = 0; ; from += EXISTING_PAGE) {
    const { data: page, error: pageError } = await supabase
      .from("tasks")
      .select("external_id, due_date_manually_edited_at, due_time_manually_edited_at")
      .eq("user_id", userId)
      .eq("source", source)
      .range(from, from + EXISTING_PAGE - 1);
    if (pageError) {
      logger.error("upsertAssignments: failed to page existing tasks", { userId, source, error: pageError.message });
      break;
    }
    if (!page || page.length === 0) break;
    existingTaskRows.push(...page);
    if (page.length < EXISTING_PAGE) break;
  }
  const existingIds = new Set(existingTaskRows?.map((r) => r.external_id) ?? []);
  const dueDateLockedIds = new Set(
    (existingTaskRows ?? [])
      .filter((r) => r.due_date_manually_edited_at != null)
      .map((r) => r.external_id)
  );
  const dueTimeLockedIds = new Set(
    (existingTaskRows ?? [])
      .filter((r) => r.due_time_manually_edited_at != null)
      .map((r) => r.external_id)
  );

  for (let i = 0; i < assignments.length; i += UPSERT_BATCH_SIZE) {
    const batch = assignments.slice(i, i + UPSERT_BATCH_SIZE);

    // Build shared fields for each assignment (everything except color)
    const baseRows = batch.map((a) => ({
      user_id: userId,
      source,
      external_id: a.external_id,
      course_name: (a.course_name || "Unknown Course").slice(0, 200),
      title: (a.title || "Untitled").slice(0, 255),
      due_date: toLocalDateString(a.due_date, timezone),
      due_time: toLocalTimeString(a.due_date, timezone),
      source_url: a.source_url,
      points_possible: a.points_possible != null && a.points_possible >= 0 ? a.points_possible : null,
      is_submitted: a.is_submitted ?? false,
      late_due_date: a.late_due_date ? toLocalDateString(a.late_due_date, timezone) : null,
      description: a.description || "",
      updated_at: new Date().toISOString(),
      // Clear dismissed_at so previously deleted tasks reappear on resync.
      // If the assignment exists on the source platform, it should show in caltodo.
      dismissed_at: null,
    }));

    // Split into new (include color) vs existing (omit color to preserve user changes).
    // For existing rows, also strip due_date / due_time when the user has
    // manually edited them — sync must not clobber the user's own changes.
    const newRows = baseRows
      .filter((r) => !existingIds.has(r.external_id))
      .map((r) => ({ ...r, color }));
    const existingRows = baseRows
      .filter((r) => existingIds.has(r.external_id))
      .map((r) => {
        const dateLocked = dueDateLockedIds.has(r.external_id);
        const timeLocked = dueTimeLockedIds.has(r.external_id);
        if (!dateLocked && !timeLocked) return r;
        // Drop locked fields entirely so the upsert leaves them untouched.
        const { due_date, due_time, ...rest } = r;
        return {
          ...rest,
          ...(dateLocked ? {} : { due_date }),
          ...(timeLocked ? {} : { due_time }),
        };
      });

    let batchFailed = false;

    // Upsert new tasks (with default source color)
    if (newRows.length > 0) {
      const { error } = await supabase
        .from("tasks")
        .upsert(newRows, { onConflict: "user_id,source,external_id" });
      if (error) {
        batchFailed = true;
        logger.error("upsertAssignments new-task batch failed", {
          source, batchStart: i, error: error.message,
        });
      }
    }

    // Upsert existing tasks (without color — preserves user customizations).
    // Group rows by their column shape so each upsert call has a uniform
    // payload (Supabase upsert requires all rows to share the same columns).
    if (existingRows.length > 0) {
      const groups = new Map<string, typeof existingRows>();
      for (const row of existingRows) {
        const key = Object.keys(row).sort().join(",");
        const group = groups.get(key) ?? [];
        group.push(row);
        groups.set(key, group);
      }
      for (const group of groups.values()) {
        const { error } = await supabase
          .from("tasks")
          .upsert(group, { onConflict: "user_id,source,external_id" });
        if (error) {
          batchFailed = true;
          logger.error("upsertAssignments existing-task batch failed", {
            source,
            batchStart: i,
            groupSize: group.length,
            error: error.message,
          });
        }
      }
    }

    if (batchFailed) {
      failedBatches++;
    } else {
      totalUpserted += batch.length;
      upsertedExternalIds.push(...batch.map((a) => a.external_id));
    }
  }

  const errors: string[] = [];

  if (failedBatches > 0) {
    const totalBatches = Math.ceil(assignments.length / UPSERT_BATCH_SIZE);
    errors.push(`${failedBatches} of ${totalBatches} ${source} upsert batches failed`);
  }

  // Auto-complete submitted assignments that aren't yet marked complete.
  // Only targets tasks that were part of the current sync batch to avoid
  // affecting tasks from other syncs or manual entries.
  if (upsertedExternalIds.length > 0) {
    const { error: autoCompleteError } = await supabase
      .from("tasks")
      .update({ is_completed: true, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("source", source)
      .eq("is_submitted", true)
      .eq("is_completed", false)
      .in("external_id", upsertedExternalIds);

    if (autoCompleteError) {
      logger.error("upsertAssignments auto-complete failed", {
        source,
        error: autoCompleteError.message,
      });
    }
  }

  return { synced: totalUpserted, errors };
}

/**
 * Soft-deletes (sets dismissed_at) tasks that exist in our DB for one of
 * the courses we just synced but were NOT returned by the source platform
 * — i.e. the assignment was deleted on Canvas/Gradescope/etc.
 *
 * Scope is intentionally narrow: only dismiss tasks whose course_name
 * matches a course that appeared in this sync's response. We never dismiss
 * tasks from courses that weren't in the response, because their absence
 * just means the user didn't sync that course this time, not that the
 * assignments are gone. Tasks the user has already dismissed are left
 * alone, as are completed tasks (preserving history).
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - The user's ID
 * @param source - The integration source we just synced
 * @param syncedAssignments - Assignments returned by this sync (the ground truth)
 */
async function dismissMissingTasks(
  supabase: SupabaseClient,
  userId: string,
  source: "canvas" | "gradescope" | "pensieve" | "brightspace",
  syncedAssignments: NormalizedAssignment[]
): Promise<void> {
  // Nothing came back? Don't dismiss anything — could be a transient API
  // failure or an empty selection rather than a real "everything deleted".
  if (syncedAssignments.length === 0) return;

  // Best-effort: never let a dismissal failure abort the surrounding sync.
  // The next sync will retry; meanwhile the user has fresh upserts.
  try {
    const seenIds = new Set<string | null>(syncedAssignments.map((a) => a.external_id));
    const scopedCourses = new Set(syncedAssignments.map((a) => a.course_name));

    // Paginate past PostgREST's ~1000-row default so users with many active
    // tasks in one source still have all stale rows considered for dismissal.
    type DismissRow = { id: string; external_id: string | null; course_name: string | null };
    const existing: DismissRow[] = [];
    const DISMISS_PAGE = 1000;
    for (let from = 0; ; from += DISMISS_PAGE) {
      const { data: page, error } = await supabase
        .from("tasks")
        .select("id, external_id, course_name")
        .eq("user_id", userId)
        .eq("source", source)
        .eq("is_completed", false)
        .is("dismissed_at", null)
        .range(from, from + DISMISS_PAGE - 1);
      if (error) {
        logger.error("dismissMissingTasks: failed to fetch existing tasks", {
          userId,
          source,
          error: error.message,
        });
        return;
      }
      if (!page || page.length === 0) break;
      existing.push(...page);
      if (page.length < DISMISS_PAGE) break;
    }

    const toDismiss = (existing ?? [])
      .filter((row) => row.course_name != null && scopedCourses.has(row.course_name))
      .filter((row) => !seenIds.has(row.external_id))
      .map((row) => row.id);

    if (toDismiss.length === 0) return;

    const { error: updateError } = await supabase
      .from("tasks")
      .update({ dismissed_at: new Date().toISOString() })
      .in("id", toDismiss);

    if (updateError) {
      logger.error("dismissMissingTasks: dismiss update failed", {
        userId,
        source,
        count: toDismiss.length,
        error: updateError.message,
      });
      return;
    }

    logger.info("dismissMissingTasks: dismissed source-deleted tasks", {
      userId,
      source,
      count: toDismiss.length,
    });
  } catch (err) {
    logger.error("dismissMissingTasks: unexpected error", {
      userId,
      source,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
