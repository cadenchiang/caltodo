/**
 * The `list_assignments` MCP tool: reads assignments and manual tasks.
 *
 * @module mcp/tools/list-assignments
 */

import {
  listAssignments,
  type AssignmentSource,
  type AssignmentStatus,
  type AssignmentSummary,
} from "@/lib/mcp/assignments";
import { stringArg, numberArg, boolArg } from "@/lib/mcp/tool-args";
import type { McpTool } from "@/lib/mcp/tool-types";

/** Valid `source` argument values. */
const SOURCES = new Set<string>(["canvas", "gradescope", "manual"]);

/** Valid `status` argument values. */
const STATUSES = new Set<string>(["upcoming", "overdue", "today", "all"]);

/**
 * Renders assignments as a compact, chat-friendly text list.
 *
 * @param items - Assignments to render
 * @returns One line per assignment, or a "no assignments" sentence when empty
 * @remarks Each line leads with the task id, since delete_task needs it and the
 *          model can only pass along an id it has actually been shown.
 */
export function formatAssignments(items: AssignmentSummary[]): string {
  if (items.length === 0) return "No assignments match that filter.";

  const lines = items.map((a) => {
    const due = a.due_date
      ? `due ${a.due_date}${a.due_time ? ` ${a.due_time}` : ""}`
      : "no due date";
    const course = a.course ? ` [${a.course}]` : "";
    const points = a.points_possible != null ? ` (${a.points_possible} pts)` : "";
    const done = a.is_completed ? " (completed)" : "";
    const source = a.source ?? "manual";
    return `- ${a.title}${course} — ${due}${points}${done} [${source}] (id: ${a.id})${
      a.url ? ` ${a.url}` : ""
    }`;
  });

  return `${items.length} assignment${items.length === 1 ? "" : "s"}:\n${lines.join("\n")}`;
}

/** Reads Canvas/Gradescope assignments plus manually created tasks. */
export const listAssignmentsTool: McpTool = {
  name: "list_assignments",
  title: "List assignments",
  description:
    "List the user's Canvas and Gradescope assignments plus any tasks they created by hand. " +
    "Use this to answer questions about homework, due dates, and what is overdue, and to find " +
    "the id of a task before deleting it. Defaults to incomplete items due in the next 14 days.",
  inputSchema: {
    type: "object",
    properties: {
      source: {
        type: "string",
        enum: ["canvas", "gradescope", "manual"],
        description:
          "Only return items from this source. 'manual' means tasks the user created " +
          "rather than synced ones. Omit for all three.",
      },
      status: {
        type: "string",
        enum: ["upcoming", "overdue", "today", "all"],
        description:
          "Time window: 'upcoming' (default, within days_ahead, plus undated), " +
          "'overdue' (due before today), 'today', or 'all'.",
      },
      include_completed: {
        type: "boolean",
        description: "Include items already marked complete. Defaults to false.",
      },
      days_ahead: {
        type: "number",
        description: "How many days ahead 'upcoming' reaches. Defaults to 14.",
      },
      course: {
        type: "string",
        description: "Case-insensitive substring filter on course name, e.g. 'UGBA 101A'.",
      },
      limit: {
        type: "number",
        description: "Maximum items to return, 1-100. Defaults to 50.",
      },
      timezone: {
        type: "string",
        description: "IANA timezone used to resolve 'today'. Defaults to America/Los_Angeles.",
      },
    },
    additionalProperties: false,
  },
  async execute(args, userId) {
    const source = stringArg(args, "source");
    const status = stringArg(args, "status");

    if (source && !SOURCES.has(source)) {
      throw new Error(
        `Invalid source "${source}". Expected "canvas", "gradescope", or "manual".`
      );
    }
    if (status && !STATUSES.has(status)) {
      throw new Error(
        `Invalid status "${status}". Expected "upcoming", "overdue", "today", or "all".`
      );
    }

    const items = await listAssignments(userId, {
      source: source as AssignmentSource | undefined,
      status: status as AssignmentStatus | undefined,
      includeCompleted: boolArg(args, "include_completed"),
      daysAhead: numberArg(args, "days_ahead"),
      course: stringArg(args, "course"),
      limit: numberArg(args, "limit"),
      timezone: stringArg(args, "timezone"),
    });

    return formatAssignments(items);
  },
};
