/**
 * The `complete_task` MCP tool: ticks a task off, or brings it back.
 *
 * @module mcp/tools/complete-task
 */

import { setTaskCompletion } from "@/lib/mcp/task-updates";
import { stringArg, boolArg } from "@/lib/mcp/tool-args";
import type { McpTool } from "@/lib/mcp/tool-types";

/** Marks a task complete or reopens it. */
export const completeTaskTool: McpTool = {
  name: "complete_task",
  title: "Complete task",
  description:
    "Mark a task or assignment as done, or reopen one that was marked done by mistake. " +
    "Call list_assignments first to get the id — never guess one.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The task's id, as shown by list_assignments.",
      },
      completed: {
        type: "boolean",
        description: "True to mark it done (the default), false to reopen it.",
      },
    },
    required: ["id"],
    additionalProperties: false,
  },
  async execute(args, userId) {
    const id = stringArg(args, "id");
    if (!id) throw new Error("complete_task requires the task's 'id'.");

    const completed = boolArg(args, "completed") ?? true;
    const task = await setTaskCompletion(userId, id, completed);

    return completed
      ? `Marked "${task.title}" done.`
      : `Reopened "${task.title}".`;
  },
};
