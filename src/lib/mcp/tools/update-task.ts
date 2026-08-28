/**
 * The `update_task` MCP tool: edits an existing task.
 *
 * @module mcp/tools/update-task
 */

import { updateTask } from "@/lib/mcp/task-updates";
import { stringArg } from "@/lib/mcp/tool-args";
import type { McpTool } from "@/lib/mcp/tool-types";

/**
 * Reads a field that can be explicitly cleared.
 *
 * @param args - Raw argument object
 * @param key - Argument name
 * @returns The trimmed value, null when the caller passed null or "none",
 *          or undefined when the field was not mentioned at all
 * @remarks The three-way result matters: undefined leaves the field alone,
 *          null clears it.
 */
function clearableArg(
  args: Record<string, unknown>,
  key: string
): string | null | undefined {
  if (!(key in args)) return undefined;
  const raw = args[key];
  if (raw === null || raw === "" || raw === "none") return null;
  return typeof raw === "string" ? raw : undefined;
}

/** Edits a task's title, notes, due date/time or course. */
export const updateTaskTool: McpTool = {
  name: "update_task",
  title: "Update task",
  description:
    "Change an existing task's title, notes, due date, due time or course. " +
    "Only the fields you pass are changed. Call list_assignments first to get the id. " +
    "Use complete_task to tick something off, not this.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "The task's id, as shown by list_assignments." },
      title: { type: "string", description: "New title." },
      description: { type: "string", description: "New notes." },
      due_date: {
        type: "string",
        description: "New due date as YYYY-MM-DD, or null to remove the due date.",
      },
      due_time: {
        type: "string",
        description: "New due time as HH:MM in 24-hour form, or null to remove the time.",
      },
      course: { type: "string", description: "New course name, or null to clear it." },
    },
    required: ["id"],
    additionalProperties: false,
  },
  async execute(args, userId) {
    const id = stringArg(args, "id");
    if (!id) throw new Error("update_task requires the task's 'id'.");

    const task = await updateTask(userId, id, {
      title: stringArg(args, "title"),
      description: "description" in args ? String(args.description ?? "") : undefined,
      dueDate: clearableArg(args, "due_date"),
      dueTime: clearableArg(args, "due_time"),
      course: clearableArg(args, "course"),
    });

    const due = task.due_date
      ? ` due ${task.due_date}${task.due_time ? ` ${task.due_time}` : ""}`
      : "";
    return `Updated "${task.title}"${due}.`;
  },
};
