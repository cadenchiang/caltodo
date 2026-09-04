/**
 * Access levels for MCP API keys, and which tools each one may call.
 *
 * A key is either 'full' (every tool) or 'read' (the three list tools and
 * nothing else). The split exists because a key pasted into an assistant that
 * only needs to read the week's deadlines could otherwise delete them.
 *
 * The read set is named explicitly rather than inferred from tool names, so a
 * tool called `list_and_archive` could never be granted to a read-only key by
 * accident. `assertScopesCoverEveryTool` in the test suite fails if a tool is
 * added to the registry without being classified here.
 *
 * @module mcp/scopes
 */

import { logger } from "@/lib/logger";

/** Access level stored on a key. Matches the CHECK constraint on the column. */
export type McpScope = "full" | "read";

/** Every valid scope, for validating input at the API boundary. */
export const MCP_SCOPES: readonly McpScope[] = ["full", "read"] as const;

/** The scope a key gets when none is specified, and what existing keys have. */
export const DEFAULT_SCOPE: McpScope = "full";

/**
 * Tools a read-only key may call.
 *
 * Every one of these only selects; none writes to the database, triggers a
 * sync, or calls out to Canvas, Gradescope or Google Calendar with a mutation.
 */
export const READ_ONLY_TOOLS: ReadonlySet<string> = new Set([
  "list_assignments",
  "list_courses",
  "list_calendar_events",
]);

/** Short label for each scope, for the settings UI and for log messages. */
export const SCOPE_LABELS: Record<McpScope, string> = {
  full: "Full access",
  read: "Read only",
};

/**
 * Narrows an unknown value to a scope.
 *
 * @param value - Candidate scope, typically from a request body
 * @returns True when the value is one of the known scopes
 */
export function isMcpScope(value: unknown): value is McpScope {
  return typeof value === "string" && (MCP_SCOPES as readonly string[]).includes(value);
}

/**
 * Coerces a stored or supplied value into a scope.
 *
 * @param value - Candidate scope, e.g. a column read back from the database
 * @returns The scope when recognised, otherwise the default
 * @remarks Falls back to 'full' rather than throwing so a row written by an
 *          older build still authenticates. An unrecognised value is logged,
 *          since it means the column and this module have drifted.
 */
export function coerceScope(value: unknown): McpScope {
  if (isMcpScope(value)) return value;
  if (value !== null && value !== undefined) {
    logger.warn("mcp.scopes: unrecognised scope on a key", {
      cause: `stored scope ${JSON.stringify(value)} is not one of ${MCP_SCOPES.join(", ")}`,
      impact: `key treated as ${DEFAULT_SCOPE}`,
    });
  }
  return DEFAULT_SCOPE;
}

/**
 * Decides whether a key may call a given tool.
 *
 * @param scope - The key's access level
 * @param toolName - Name from a `tools/call` request
 * @returns True when the call is permitted
 * @remarks A full-access key may call anything, including tools added later.
 *          A read-only key may call only the named read set, so any new tool
 *          is denied to it until it is deliberately added there.
 */
export function scopeAllowsTool(scope: McpScope, toolName: string): boolean {
  if (scope === "full") return true;
  return READ_ONLY_TOOLS.has(toolName);
}

/**
 * Filters a list of tools down to the ones a key may call.
 *
 * @param scope - The key's access level
 * @param tools - Tools to filter, each carrying a `name`
 * @returns Only the permitted tools, in the original order
 * @remarks Used by `tools/list` so a read-only key is never told about tools
 *          it would be refused, rather than being offered them and failing at
 *          call time.
 */
export function toolsForScope<T extends { name: string }>(
  scope: McpScope,
  tools: readonly T[]
): T[] {
  if (scope === "full") return [...tools];
  return tools.filter((tool) => READ_ONLY_TOOLS.has(tool.name));
}
