/**
 * The `set_event_color` MCP tool: recolors one Google Calendar event.
 *
 * @module mcp/tools/set-event-color
 */

import { setEventColor } from "@/lib/mcp/calendar";
import { resolveColorId, GCAL_COLOR_NAMES } from "@/lib/mcp/gcal-colors";
import { stringArg } from "@/lib/mcp/tool-args";
import type { McpTool } from "@/lib/mcp/tool-types";

/** Changes the color Google Calendar shows an event in. */
export const setEventColorTool: McpTool = {
  name: "set_event_color",
  title: "Set event color",
  description:
    "Change the color of one Google Calendar event, or reset it with 'default'. Call " +
    "list_calendar_events first to get the event id and calendar id — never guess them. " +
    "Only the color changes; the event's time, title, guests and description are left untouched.",
  inputSchema: {
    type: "object",
    properties: {
      event_id: {
        type: "string",
        description: "The event's id, as shown by list_calendar_events.",
      },
      color: {
        type: "string",
        description:
          `The new color. Accepts a Google Calendar color name (${Object.values(GCAL_COLOR_NAMES).join(", ")}), ` +
          `a plain color like "blue" or "red", an id 1-11, or "default" to clear the ` +
          `event's color so it inherits its calendar's.`,
      },
      calendar_id: {
        type: "string",
        description:
          "Calendar holding the event, as shown by list_calendar_events. " +
          "Defaults to the user's first selected calendar.",
      },
    },
    required: ["event_id", "color"],
    additionalProperties: false,
  },
  async execute(args, userId) {
    const eventId = stringArg(args, "event_id");
    if (!eventId) throw new Error("set_event_color requires 'event_id'.");

    const color = stringArg(args, "color");
    if (!color) throw new Error("set_event_color requires 'color'.");

    // Resolve before calling Google so a bad color name never costs a request.
    const colorId = resolveColorId(color);

    const { title, colorName } = await setEventColor(
      userId,
      eventId,
      colorId,
      stringArg(args, "calendar_id")
    );

    return `Changed "${title}" to ${colorName}.`;
  },
};
