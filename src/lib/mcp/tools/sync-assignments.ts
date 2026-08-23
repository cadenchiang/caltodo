/**
 * The `sync_assignments` MCP tool: pulls fresh data from Canvas and Gradescope.
 *
 * @module mcp/tools/sync-assignments
 */

import { syncAssignments } from "@/lib/mcp/assignments";
import { stringArg } from "@/lib/mcp/tool-args";
import type { McpTool } from "@/lib/mcp/tool-types";

/** Refreshes assignments from the connected platforms. */
export const syncAssignmentsTool: McpTool = {
  name: "sync_assignments",
  title: "Sync assignments",
  description:
    "Refresh assignments from Canvas and Gradescope into caltodo. " +
    "Only needed when the user asks for the very latest data; list_assignments " +
    "already reads recently synced assignments.",
  inputSchema: {
    type: "object",
    properties: {
      timezone: {
        type: "string",
        description: "IANA timezone for due-date conversion. Defaults to America/Los_Angeles.",
      },
    },
    additionalProperties: false,
  },
  async execute(args, userId) {
    const result = await syncAssignments(userId, stringArg(args, "timezone"));
    const errors = [...result.canvas.errors, ...result.gradescope.errors];
    const summary = `Synced ${result.canvas.synced} Canvas and ${result.gradescope.synced} Gradescope assignments.`;
    return errors.length > 0 ? `${summary} Errors: ${errors.join("; ")}` : summary;
  },
};
