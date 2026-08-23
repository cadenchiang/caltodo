/**
 * Argument coercion helpers for MCP tools.
 *
 * Clients vary in how strictly they follow a tool's JSON Schema, so numbers and
 * booleans commonly arrive as strings. These helpers accept both forms and
 * return undefined for anything missing or unusable, letting each tool apply
 * its own default.
 *
 * @module mcp/tool-args
 */

/**
 * Reads a string argument.
 *
 * @param args - Raw argument object
 * @param key - Argument name
 * @returns Trimmed string, or undefined when missing, blank, or not a string
 */
export function stringArg(args: Record<string, unknown>, key: string): string | undefined {
  const value = args[key];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Reads a numeric argument, tolerating numeric strings.
 *
 * @param args - Raw argument object
 * @param key - Argument name
 * @returns Finite number, or undefined when missing or unparseable
 */
export function numberArg(args: Record<string, unknown>, key: string): number | undefined {
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
export function boolArg(args: Record<string, unknown>, key: string): boolean | undefined {
  const value = args[key];
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

/**
 * Reads a string-array argument, tolerating a single string or a comma list.
 *
 * @param args - Raw argument object
 * @param key - Argument name
 * @returns Array of non-empty trimmed strings, or undefined when absent
 */
export function stringArrayArg(
  args: Record<string, unknown>,
  key: string
): string[] | undefined {
  const value = args[key];
  if (Array.isArray(value)) {
    const items = value
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
    return items.length > 0 ? items : undefined;
  }
  if (typeof value === "string") {
    const items = value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
    return items.length > 0 ? items : undefined;
  }
  return undefined;
}
