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

    // Report every platform that actually brought something back, rather than
    // naming two of them. The old summary said "Synced 0 Canvas and 0
    // Gradescope assignments" to a student on Brightspace whose sync had in
    // fact just worked.
    // Read defensively. Code and schema deploy independently here, and a
    // build that names a platform the running engine does not yet report
    // would otherwise turn a successful sync into a crash in its summary.
    const platforms: Array<[string, { synced?: number; errors?: string[] } | undefined]> = [
      ["Canvas", result.canvas],
      ["Gradescope", result.gradescope],
      ["Pensive", result.pensieve],
      ["Brightspace", result.brightspace],
      ["Blackboard", result.blackboard],
      ["Google Classroom", result.classroom],
    ];

    const counted = platforms.map(
      ([name, r]) => [name, r?.synced ?? 0, r?.errors ?? []] as const
    );
    const synced = counted.filter(([, n]) => n > 0);
    const total = counted.reduce((n, [, count]) => n + count, 0);
    const errors = counted.flatMap(([, , errs]) => errs);

    const summary =
      synced.length > 0
        ? `Synced ${total} assignment${total === 1 ? "" : "s"}: ` +
          synced.map(([name, n]) => `${n} from ${name}`).join(", ") + "."
        : "Synced. No new assignments from any connected platform.";

    return errors.length > 0 ? `${summary} Errors: ${errors.join("; ")}` : summary;
  },
};
