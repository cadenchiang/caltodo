/**
 * The `list_courses` MCP tool: the user's classes and how many tasks each has.
 *
 * An assistant could read tasks and write them, but had no way to ask what
 * classes existed. Every other tool takes a `course` as a free-text string, so
 * without this the only way to file something under the right class was to
 * guess the exact spelling, and a near miss creates a second course rather
 * than failing.
 *
 * @module mcp/tools/list-courses
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { boolArg } from "@/lib/mcp/tool-args";
import { logger } from "@/lib/logger";
import type { McpTool } from "@/lib/mcp/tool-types";

/** One class, with the counts that say whether it is still live. */
interface CourseSummary {
  name: string;
  total: number;
  open: number;
  overdue: number;
}

/**
 * Summarises the user's classes from the tasks filed under them.
 *
 * @param userId - caltodo user id to scope the query to.
 * @param includeCompleted - Count finished tasks in the totals.
 * @param client - Supabase client; defaults to the admin client.
 * @returns One entry per course name, busiest first.
 * @remarks Derived from tasks rather than from the selected-courses columns
 *          because those are per integration account and say nothing about a
 *          course that arrived from a syllabus or was typed by hand. The
 *          query is scoped to a single user_id: MCP requests carry no session.
 */
export async function listCourses(
  userId: string,
  includeCompleted: boolean,
  client = createAdminClient()
): Promise<CourseSummary[]> {
  const { data, error } = await client
    .from("tasks")
    .select("course_name, is_completed, due_date")
    .eq("user_id", userId)
    .not("course_name", "is", null);

  if (error) {
    logger.error("mcp.listCourses: query failed", { userId, error: error.message });
    throw new Error("Failed to read courses.");
  }

  const today = new Date().toISOString().slice(0, 10);
  const byName = new Map<string, CourseSummary>();

  for (const row of data ?? []) {
    const name = (row.course_name as string | null)?.trim();
    if (!name) continue;
    const completed = row.is_completed as boolean;
    if (completed && !includeCompleted) continue;

    const entry = byName.get(name) ?? { name, total: 0, open: 0, overdue: 0 };
    entry.total += 1;
    if (!completed) {
      entry.open += 1;
      const due = row.due_date as string | null;
      if (due && due < today) entry.overdue += 1;
    }
    byName.set(name, entry);
  }

  return Array.from(byName.values()).sort(
    (a, b) => b.open - a.open || a.name.localeCompare(b.name)
  );
}

/** Lists the classes the user has work filed under. */
export const listCoursesTool: McpTool = {
  name: "list_courses",
  title: "List courses",
  description:
    "List the user's classes, with how much work each one has open and overdue. " +
    "Call this before create_task or update_task when filing something under a class, " +
    "so the course name matches one that already exists rather than creating a new one.",
  inputSchema: {
    type: "object",
    properties: {
      include_completed: {
        type: "boolean",
        description: "Count finished tasks too. Defaults to false.",
      },
    },
    additionalProperties: false,
  },
  async execute(args, userId) {
    const courses = await listCourses(userId, boolArg(args, "include_completed") ?? false);

    if (courses.length === 0) {
      return "No classes yet. Tasks get a class from a synced platform, or from the 'course' field when you create one.";
    }

    const lines = courses.map((c) => {
      const overdue = c.overdue > 0 ? `, ${c.overdue} overdue` : "";
      return `- ${c.name}: ${c.open} open${overdue} (${c.total} total)`;
    });
    return `${courses.length} class${courses.length === 1 ? "" : "es"}:\n${lines.join("\n")}`;
  },
};
