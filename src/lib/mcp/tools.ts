/**
 * MCP tool definitions exposed to Poke.
 *
 * Each tool has a JSON Schema input contract and an executor that returns the
 * text payload Poke reads back to the user. Tools are read-only over caltodo
 * data, apart from `sync_assignments`, which refreshes from Canvas/Gradescope.
 *
 * @module mcp/tools
 */

import {
  listAssignments,
  syncAssignments,
  type AssignmentSource,
  type AssignmentStatus,
} from "@/lib/mcp/assignments";
import { logger } from "@/lib/logger";

/** JSON Schema describing a tool's arguments, as sent in `tools/list`. */
export interface JsonSchema {
  type: "object";
  properties: Record<string, unknown>;
  required?: string[];
  additionalProperties: boolean;
}

/** A tool as advertised to, and invoked by, an MCP client. */
export interface McpTool {
  name: string;
  title: string;
  description: string;
  inputSchema: JsonSchema;
  /**
   * Runs the tool.
   *
   * @param args - Raw arguments from the client (unvalidated)
   * @param userId - caltodo user the request is authenticated as
   * @returns Text to return to the client
   */
  execute: (args: Record<string, unknown>, userId: string) => Promise<string>;
}

/**
 * Reads a string argument, returning undefined when absent or the wrong type.
 *
 * @param args - Raw argument object
 * @param key - Argument name
 * @returns Trimmed string, or undefined when missing, blank, or not a string
 */
function stringArg(args: Record<string, unknown>, key: string): string | undefined {
  const value = args[key];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Reads a numeric argument, tolerating numeric strings from loose clients.
 *
 * @param args - Raw argument object
 * @param key - Argument name
 * @returns Finite number, or undefined when missing or unparseable
 */
function numberArg(args: Record<string, unknown>, key: string): number | undefined {
  const value = args[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

/**
 * Reads a boolean argument, tolerating the strings "true" and "false".
 *
 * @param args - Raw argument object
 * @param key - Argument name
 * @returns Boolean value, or undefined when missing or unparseable
 */
function boolArg(args: Record<string, unknown>, key: string): boolean | undefined {
  const value = args[key];
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

/** Valid `source` argument values. */
const SOURCES = new Set<string>(["canvas", "gradescope"]);
/** Valid `status` argument values. */
const STATUSES = new Set<string>(["upcoming", "overdue", "today", "all"]);

/**
 * Renders assignments as a compact, chat-friendly text list.
 *
 * @param items - Assignments to render
 * @returns One line per assignment, or a "no assignments" sentence when empty
 */
function formatAssignments(
  items: Awaited<ReturnType<typeof listAssignments>>
): string {
  if (items.length === 0) return "No assignments match that filter.";

  const lines = items.map((a) => {
    const due = a.due_date
      ? `due ${a.due_date}${a.due_time ? ` ${a.due_time}` : ""}`
      : "no due date";
    const course = a.course ? ` [${a.course}]` : "";
    const points = a.points_possible != null ? ` (${a.points_possible} pts)` : "";
    const done = a.is_completed ? " (completed)" : "";
    return `- ${a.title}${course} — ${due}${points}${done} [${a.source}]${a.url ? ` ${a.url}` : ""}`;
  });

  return `${items.length} assignment${items.length === 1 ? "" : "s"}:\n${lines.join("\n")}`;
}

/** The `list_assignments` tool: reads synced Canvas/Gradescope assignments. */
const listAssignmentsTool: McpTool = {
  name: "list_assignments",
  title: "List assignments",
  description:
    "List the user's Canvas and Gradescope assignments already synced into caltodo. " +
    "Use this to answer questions about homework, due dates, and what is overdue. " +
    "Defaults to incomplete assignments due in the next 14 days.",
  inputSchema: {
    type: "object",
    properties: {
      source: {
        type: "string",
        enum: ["canvas", "gradescope"],
        description: "Only return assignments from this platform. Omit for both.",
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
        description: "Include assignments already marked complete. Defaults to false.",
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
        description: "Maximum assignments to return, 1-100. Defaults to 50.",
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
      throw new Error(`Invalid source "${source}". Expected "canvas" or "gradescope".`);
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

/** The `sync_assignments` tool: pulls fresh data from Canvas and Gradescope. */
const syncAssignmentsTool: McpTool = {
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
    const summary =
      `Synced ${result.canvas.synced} Canvas and ${result.gradescope.synced} Gradescope assignments.`;
    return errors.length > 0 ? `${summary} Errors: ${errors.join("; ")}` : summary;
  },
};

/** All tools exposed over MCP, keyed by tool name. */
export const MCP_TOOLS: McpTool[] = [listAssignmentsTool, syncAssignmentsTool];

/**
 * Looks up a tool by name.
 *
 * @param name - Tool name from a `tools/call` request
 * @returns The tool, or undefined when no tool has that name
 */
export function findTool(name: string): McpTool | undefined {
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
