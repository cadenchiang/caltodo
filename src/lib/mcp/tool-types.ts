/**
 * Shared types for MCP tool definitions.
 *
 * Kept separate from the registry so individual tool modules can import the
 * types without importing the registry that collects them.
 *
 * @module mcp/tool-types
 */

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
