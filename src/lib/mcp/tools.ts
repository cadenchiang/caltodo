/**
 * MCP tool registry.
 *
 * Collects the individual tool modules and dispatches calls to them. Each tool
 * lives in its own file under mcp/tools/; this module only assembles them and
 * normalizes failures.
 *
 * @module mcp/tools
 */

import { listAssignmentsTool } from "@/lib/mcp/tools/list-assignments";
import { syncAssignmentsTool } from "@/lib/mcp/tools/sync-assignments";
import { createTaskTool } from "@/lib/mcp/tools/create-task";
import { deleteTaskTool } from "@/lib/mcp/tools/delete-task";
import { logger } from "@/lib/logger";

export type { JsonSchema, McpTool } from "@/lib/mcp/tool-types";

/** All tools exposed over MCP. */
export const MCP_TOOLS = [
  listAssignmentsTool,
  createTaskTool,
  deleteTaskTool,
  syncAssignmentsTool,
];

/**
 * Looks up a tool by name.
 *
 * @param name - Tool name from a `tools/call` request
 * @returns The tool, or undefined when no tool has that name
 */
export function findTool(name: string) {
  return MCP_TOOLS.find((tool) => tool.name === name);
}

/**
 * Executes a tool by name and normalizes failures into a text result.
 *
 * @param name - Tool name from a `tools/call` request
 * @param args - Raw arguments from the client
 * @param userId - caltodo user the request is authenticated as
 * @returns Result text plus whether it represents an error
 * @remarks Tool failures are returned as `isError` results rather than JSON-RPC
 *          errors, per the MCP spec, so the model can see and recover from them.
 *          An unknown tool name is also reported this way.
 */
export async function callTool(
  name: string,
  args: Record<string, unknown>,
  userId: string
): Promise<{ text: string; isError: boolean }> {
  const tool = findTool(name);
  if (!tool) {
    logger.warn("mcp.tools: unknown tool requested", {
      cause: `no tool named "${name}"`,
      known: MCP_TOOLS.map((t) => t.name),
      impact: "returned isError result to Poke",
    });
    return { text: `Unknown tool "${name}".`, isError: true };
  }

  try {
    const text = await tool.execute(args, userId);
    logger.info("mcp.tools: tool succeeded", { tool: name, userId });
    return { text, isError: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("mcp.tools: tool failed", {
      cause: message,
      tool: name,
      userId,
      impact: "returned isError result to Poke",
    });
    return { text: message, isError: true };
  }
}
