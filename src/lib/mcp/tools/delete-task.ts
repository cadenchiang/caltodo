/**
 * The `delete_task` MCP tool: removes a task from the user's caltodo inbox.
 *
 * @module mcp/tools/delete-task
 */

import { deleteTask } from "@/lib/mcp/mutations";
import { stringArg } from "@/lib/mcp/tool-args";
import type { McpTool } from "@/lib/mcp/tool-types";

/** Deletes one task, matching the behavior of deleting it inside the app. */
export const deleteTaskTool: McpTool = {
  name: "delete_task",
  title: "Delete task",
  description:
    "Delete one task from caltodo by its id. Call list_assignments first to find the id — " +
    "never guess one. Deleting a synced Canvas or Gradescope assignment hides it for good " +
    "so the next sync does not bring it back, exactly as deleting it in the app does.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The task's id, as shown by list_assignments.",
      },
    },
    required: ["id"],
    additionalProperties: false,
  },
  async execute(args, userId) {
    const id = stringArg(args, "id");
    if (!id) throw new Error("delete_task requires the task's 'id'.");

    const { title, soft } = await deleteTask(userId, id);
    return soft
      ? `Deleted the synced assignment "${title}". It will stay hidden through future syncs.`
      : `Deleted "${title}".`;
  },
};
