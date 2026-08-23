/**
 * Assignment queries backing the MCP tools.
 *
 * Reads Canvas / Gradescope assignments that the caltodo sync engine has
 * already written into the `tasks` table, and can trigger a fresh sync.
 * Uses the Supabase service-role client because MCP requests carry no user
 * session; every query is explicitly scoped to a single `user_id`.
 *
 * @module mcp/assignments
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { runSync } from "@/lib/sync-engine";
import type { SyncResult } from "@/lib/types";
import { logger } from "@/lib/logger";

/** Sources exposed through MCP. Manual and syllabus tasks are excluded. */
export const ASSIGNMENT_SOURCES = ["canvas", "gradescope"] as const;

export type AssignmentSource = (typeof ASSIGNMENT_SOURCES)[number];

/** Which slice of assignments to return, relative to today in the caller's timezone. */
export type AssignmentStatus = "upcoming" | "overdue" | "today" | "all";

/** Filters accepted by {@link listAssignments}. */
export interface ListAssignmentsFilters {
  /** Restrict to one platform. Omit for both. */
  source?: AssignmentSource;
  /** Time window relative to today. Defaults to "upcoming". */
  status?: AssignmentStatus;
  /** Include assignments already marked complete. Defaults to false. */
  includeCompleted?: boolean;
  /** For status "upcoming", how many days ahead to include. Defaults to 14. */
  daysAhead?: number;
  /** Case-insensitive substring match on the course name. */
  course?: string;
  /** Maximum rows to return (1-100). Defaults to 50. */
  limit?: number;
  /** IANA timezone used to resolve "today". Defaults to America/Los_Angeles. */
  timezone?: string;
}

/** One assignment as returned to Poke. */
export interface AssignmentSummary {
  id: string;
  title: string;
  course: string | null;
  source: string | null;
  due_date: string | null;
  due_time: string | null;
  is_completed: boolean;
  is_submitted: boolean;
  points_possible: number | null;
  url: string | null;
}

/** Columns selected from `tasks`; kept narrow so responses stay small. */
const SELECT_COLUMNS =
  "id, title, course_name, source, due_date, due_time, is_completed, is_submitted, points_possible, source_url";

/** Shape of a row returned by {@link SELECT_COLUMNS}. */
interface TaskRow {
  id: string;
  title: string;
  course_name: string | null;
  source: string | null;
  due_date: string | null;
  due_time: string | null;
  is_completed: boolean | null;
  is_submitted: boolean | null;
  points_possible: number | null;
  source_url: string | null;
}

const DEFAULT_TIMEZONE = "America/Los_Angeles";
const DEFAULT_DAYS_AHEAD = 14;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/**
 * Returns today's date as YYYY-MM-DD in the given timezone.
 *
 * @param timezone - IANA timezone name
 * @param now - Instant to convert, defaults to the current time (injectable for tests)
 * @returns Local calendar date in YYYY-MM-DD form
 * @remarks Falls back to {@link DEFAULT_TIMEZONE} when the timezone is not a
 *          valid IANA name, so a bad tool argument cannot throw.
 */
export function todayInTimezone(timezone: string, now: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(now);
  } catch {
    logger.warn("mcp.assignments: invalid timezone", {
      cause: `unrecognized IANA timezone "${timezone}"`,
      impact: `fell back to ${DEFAULT_TIMEZONE}`,
    });
    return new Intl.DateTimeFormat("en-CA", { timeZone: DEFAULT_TIMEZONE }).format(now);
  }
}

/**
 * Adds a whole number of days to a YYYY-MM-DD date string.
 *
 * @param date - Calendar date in YYYY-MM-DD form
 * @param days - Days to add (may be negative)
 * @returns The shifted date in YYYY-MM-DD form
 * @remarks Arithmetic is done in UTC so it is unaffected by DST.
 */
export function addDays(date: string, days: number): string {
  const shifted = new Date(`${date}T00:00:00Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted.toISOString().slice(0, 10);
}

/**
 * Clamps a requested row limit into the supported range.
 *
 * @param limit - Requested limit, possibly undefined or out of range
 * @returns An integer between 1 and {@link MAX_LIMIT}
 */
export function clampLimit(limit: number | undefined): number {
  if (typeof limit !== "number" || !Number.isFinite(limit)) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.max(1, Math.floor(limit)));
}

/**
 * Maps a `tasks` row onto the assignment shape returned to Poke.
 *
 * @param row - Row selected with {@link SELECT_COLUMNS}
 * @returns Assignment summary with nullable booleans normalized to false
 */
function toSummary(row: TaskRow): AssignmentSummary {
  return {
    id: row.id,
    title: row.title,
    course: row.course_name,
    source: row.source,
    due_date: row.due_date,
    due_time: row.due_time,
    is_completed: row.is_completed === true,
    is_submitted: row.is_submitted === true,
    points_possible: row.points_possible,
    url: row.source_url,
  };
}

/**
 * Lists Canvas / Gradescope assignments for one user.
 *
 * @param userId - caltodo user id to scope the query to
 * @param filters - Source, time window, completion, course and limit filters
 * @param client - Supabase client, defaults to a service-role admin client (injectable for tests)
 * @returns Matching assignments ordered by due date (nulls last), then title
 * @throws Error when the Supabase query fails, with the underlying message attached
 * @remarks Dismissed (soft-deleted) tasks are always excluded. Status "upcoming"
 *          also includes assignments with no due date, since those stay actionable.
 */
export async function listAssignments(
  userId: string,
  filters: ListAssignmentsFilters = {},
  client: SupabaseClient = createAdminClient()
): Promise<AssignmentSummary[]> {
  const {
    source,
    status = "upcoming",
    includeCompleted = false,
    daysAhead = DEFAULT_DAYS_AHEAD,
    course,
    timezone = DEFAULT_TIMEZONE,
  } = filters;

  const limit = clampLimit(filters.limit);
  const today = todayInTimezone(timezone);

  let query = client
    .from("tasks")
    .select(SELECT_COLUMNS)
    .eq("user_id", userId)
    .is("dismissed_at", null);

  query = source
    ? query.eq("source", source)
    : query.in("source", ASSIGNMENT_SOURCES as unknown as string[]);

  if (!includeCompleted) query = query.eq("is_completed", false);
  if (course) query = query.ilike("course_name", `%${course}%`);

  if (status === "today") {
    query = query.eq("due_date", today);
  } else if (status === "overdue") {
    query = query.lt("due_date", today);
  } else if (status === "upcoming") {
    const horizon = addDays(today, Math.max(0, Math.floor(daysAhead)));
    query = query.or(`and(due_date.gte.${today},due_date.lte.${horizon}),due_date.is.null`);
  }

  const { data, error } = await query
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("title", { ascending: true })
    .limit(limit);

  if (error) {
    logger.error("mcp.assignments: query failed", {
      cause: error.message,
      userId,
      filters: { source, status, includeCompleted, daysAhead, course, limit },
      impact: "list_assignments tool returned an error to Poke",
    });
    throw new Error(`Failed to load assignments: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as TaskRow[];
  logger.info("mcp.assignments: query succeeded", {
    userId,
    status,
    source: source ?? "all",
    returned: rows.length,
  });

  return rows.map(toSummary);
}

/**
 * Triggers a Canvas + Gradescope sync so subsequent listings are fresh.
 *
 * @param userId - caltodo user id whose stored integration credentials are used
 * @param timezone - IANA timezone for due-date conversion
 * @param client - Supabase client, defaults to a service-role admin client (injectable for tests)
 * @returns Per-source counts and errors from the sync engine
 * @throws Error when the sync engine throws outright; per-source failures are
 *         reported in the result instead, so one platform failing still returns data
 * @remarks Gradescope has its own cooldown inside the sync engine; this call does
 *          not force past it, to avoid hammering Gradescope from chat messages.
 */
export async function syncAssignments(
  userId: string,
  timezone: string = DEFAULT_TIMEZONE,
  client: SupabaseClient = createAdminClient()
): Promise<SyncResult> {
  logger.info("mcp.assignments: sync started", { userId, timezone });

  const result = await runSync(client, userId, timezone, undefined, false, [
    "canvas",
    "gradescope",
  ]);

  logger.info("mcp.assignments: sync finished", {
    userId,
    canvas: result.canvas.synced,
    gradescope: result.gradescope.synced,
    errors: [...result.canvas.errors, ...result.gradescope.errors],
  });

  return result;
}
