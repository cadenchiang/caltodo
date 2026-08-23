/**
 * The `create_task` MCP tool: adds a task to the user's caltodo inbox.
 *
 * @module mcp/tools/create-task
 */

import { createTask } from "@/lib/mcp/mutations";
import { stringArg, stringArrayArg } from "@/lib/mcp/tool-args";
import type { McpTool } from "@/lib/mcp/tool-types";

/** Creates a manual task, the same kind the user types into the inbox. */
export const createTaskTool: McpTool = {
  name: "create_task",
  title: "Create task",
  description:
    "Add a new task to the user's caltodo inbox — a reading, an errand, anything they " +
    "want tracked alongside their synced coursework. Use this for things the user says " +
    "they need to do. Synced Canvas and Gradescope assignments arrive on their own and " +
    "should not be recreated here.",
  inputSchema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "What the task is, e.g. 'Read chapter 4' — required.",
      },
      description: {
        type: "string",
        description: "Optional longer notes about the task.",
      },
      due_date: {
        type: "string",
        description: "Due date as YYYY-MM-DD. Omit for a task with no deadline.",
      },
      due_time: {
        type: "string",
        description:
          "Due time as HH:MM in 24-hour form, e.g. '17:30'. Only stored alongside a due_date.",
      },
      course: {
        type: "string",
        description: "Course or project this belongs to, e.g. 'UGBA 103'.",
      },
      tags: {
        type: "array",
        items: { type: "string" },
        description: "Optional tags to file the task under.",
      },
    },
    required: ["title"],
    additionalProperties: false,
  },
  async execute(args, userId) {
    const title = stringArg(args, "title");
    if (!title) throw new Error("create_task requires a non-empty 'title'.");

    const created = await createTask(userId, {
      title,
      description: stringArg(args, "description"),
      dueDate: stringArg(args, "due_date") ?? null,
      dueTime: stringArg(args, "due_time") ?? null,
      course: stringArg(args, "course") ?? null,
      tags: stringArrayArg(args, "tags"),
    });

    const due = created.due_date
      ? ` due ${created.due_date}${created.due_time ? ` ${created.due_time}` : ""}`
      : "";
    const course = created.course_name ? ` under ${created.course_name}` : "";
    return `Created "${created.title}"${course}${due}. (id: ${created.id})`;
  },
};
