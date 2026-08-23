/**
 * The `list_calendar_events` MCP tool: reads upcoming Google Calendar events.
 *
 * @module mcp/tools/list-events
 */

import { listCalendarEvents, type CalendarEventSummary } from "@/lib/mcp/calendar";
import { stringArg, numberArg } from "@/lib/mcp/tool-args";
import type { McpTool } from "@/lib/mcp/tool-types";

/**
 * Renders events as a compact, chat-friendly list.
 *
 * @param items - Events to render
 * @returns One line per event, or a "no events" sentence when empty
 * @remarks Each line carries the event id and calendar id, since
 *          set_event_color needs both and the model can only pass along
 *          identifiers it has actually been shown.
 */
export function formatEvents(items: CalendarEventSummary[]): string {
  if (items.length === 0) return "No events in that range.";

  const lines = items.map((e) => {
    const when = e.start ? (e.allDay ? `${e.start} (all day)` : e.start) : "no start time";
    return `- ${e.title} — ${when} — color: ${e.colorName} (id: ${e.id}, calendar: ${e.calendarId})`;
  });

  return `${items.length} event${items.length === 1 ? "" : "s"}:\n${lines.join("\n")}`;
}

/** Lists Google Calendar events so their ids and colors are visible. */
export const listEventsTool: McpTool = {
  name: "list_calendar_events",
  title: "List calendar events",
  description:
    "List the user's upcoming Google Calendar events across the calendars they selected in " +
    "caltodo, with each event's current color. Call this before set_event_color to get the " +
    "event id and calendar id. Defaults to the next 7 days.",
  inputSchema: {
    type: "object",
    properties: {
      time_min: {
        type: "string",
        description: "ISO 8601 start of the range, e.g. '2026-08-23T00:00:00Z'. Defaults to now.",
      },
      time_max: {
        type: "string",
        description: "ISO 8601 end of the range. Defaults to 7 days after time_min.",
      },
      query: {
        type: "string",
        description: "Free-text search over event titles and descriptions, e.g. 'standup'.",
      },
      limit: {
        type: "number",
        description: "Maximum events to return, 1-50. Defaults to 20.",
      },
    },
    additionalProperties: false,
  },
  async execute(args, userId) {
    const events = await listCalendarEvents(userId, {
      timeMin: stringArg(args, "time_min"),
      timeMax: stringArg(args, "time_max"),
      query: stringArg(args, "query"),
      limit: numberArg(args, "limit"),
    });
    return formatEvents(events);
  },
};
