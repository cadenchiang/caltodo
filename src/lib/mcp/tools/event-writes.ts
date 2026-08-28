/**
 * Google Calendar write tools: create, update and delete events.
 *
 * Grouped in one module because they share the same argument shape and
 * validation; splitting them would repeat it three times.
 *
 * @module mcp/tools/event-writes
 */

import { createEvent, updateEvent, deleteEvent, type EventInput } from "@/lib/mcp/calendar-writes";
import { stringArg } from "@/lib/mcp/tool-args";
import type { McpTool, JsonSchema } from "@/lib/mcp/tool-types";

/** Shared descriptions for the time fields, which are easy to get wrong. */
const TIME_HELP =
  "RFC3339 timestamp with offset (2026-09-04T15:00:00-07:00) for a timed event, " +
  "or YYYY-MM-DD for an all-day one. Start and end must be the same kind.";

/** Properties common to create and update. */
const EVENT_PROPERTIES: JsonSchema["properties"] = {
  title: { type: "string", description: "Event title." },
  start: { type: "string", description: `When it starts. ${TIME_HELP}` },
  end: { type: "string", description: `When it ends. ${TIME_HELP}` },
  description: { type: "string", description: "Optional notes on the event." },
  location: { type: "string", description: "Optional location." },
  calendar_id: {
    type: "string",
    description:
      "Calendar to write to, as shown by list_calendar_events. " +
      "Defaults to the user's first selected calendar.",
  },
};

/**
 * Collects the event fields from raw tool arguments.
 *
 * @param args - Raw arguments from the client
 * @returns Only the fields the caller actually supplied
 */
function readEventInput(args: Record<string, unknown>): EventInput {
  const input: EventInput = {};
  const title = stringArg(args, "title");
  const start = stringArg(args, "start");
  const end = stringArg(args, "end");
  const description = stringArg(args, "description");
  const location = stringArg(args, "location");

  if (title !== undefined) input.title = title;
  if (start !== undefined) input.start = start;
  if (end !== undefined) input.end = end;
  if (description !== undefined) input.description = description;
  if (location !== undefined) input.location = location;
  return input;
}

/** Creates a calendar event. */
export const createEventTool: McpTool = {
  name: "create_calendar_event",
  title: "Create calendar event",
  description:
    "Add an event to the user's Google Calendar. Needs a title, a start and an end. " +
    "For something with no fixed time, pass dates rather than timestamps to make it all-day.",
  inputSchema: {
    type: "object",
    properties: EVENT_PROPERTIES,
    required: ["title", "start", "end"],
    additionalProperties: false,
  },
  async execute(args, userId) {
    const event = await createEvent(
      userId,
      readEventInput(args),
      stringArg(args, "calendar_id")
    );
    return `Created "${event.title}"${event.start ? ` on ${event.start}` : ""}. (id: ${event.id})`;
  },
};

/** Edits an existing calendar event. */
export const updateEventTool: McpTool = {
  name: "update_calendar_event",
  title: "Update calendar event",
  description:
    "Change an existing Google Calendar event's title, time, description or location. " +
    "Only the fields you pass are changed. Call list_calendar_events first to get the " +
    "event id and calendar id. Use set_event_color for colour changes.",
  inputSchema: {
    type: "object",
    properties: {
      event_id: { type: "string", description: "The event's id, from list_calendar_events." },
      ...EVENT_PROPERTIES,
    },
    required: ["event_id"],
    additionalProperties: false,
  },
  async execute(args, userId) {
    const eventId = stringArg(args, "event_id");
    if (!eventId) throw new Error("update_calendar_event requires 'event_id'.");

    const event = await updateEvent(
      userId,
      eventId,
      readEventInput(args),
      stringArg(args, "calendar_id")
    );
    return `Updated "${event.title}"${event.start ? ` (now ${event.start})` : ""}.`;
  },
};

/** Deletes a calendar event. */
export const deleteEventTool: McpTool = {
  name: "delete_calendar_event",
  title: "Delete calendar event",
  description:
    "Delete an event from the user's Google Calendar. This cannot be undone from caltodo; " +
    "the event goes to the calendar's trash. Confirm with the user before calling it, and " +
    "call list_calendar_events first to get the id.",
  inputSchema: {
    type: "object",
    properties: {
      event_id: { type: "string", description: "The event's id, from list_calendar_events." },
      calendar_id: {
        type: "string",
        description: "Calendar holding the event. Defaults to the first selected calendar.",
      },
    },
    required: ["event_id"],
    additionalProperties: false,
  },
  async execute(args, userId) {
    const eventId = stringArg(args, "event_id");
    if (!eventId) throw new Error("delete_calendar_event requires 'event_id'.");

    await deleteEvent(userId, eventId, stringArg(args, "calendar_id"));
    return "Event deleted.";
  },
};
