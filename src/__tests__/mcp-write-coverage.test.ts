/**
 * Tests what an MCP client can actually do with a caltodo account.
 *
 * The server was never read-only - task and event CRUD have been there from
 * the start - but two gaps made it behave as if it were. It could only see
 * Canvas and Gradescope, so a student on any other platform got an empty
 * answer rather than a gap; and it could set a tag on creation but never
 * change one afterwards. These pin the coverage rather than any one tool.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { MCP_TOOLS, findTool } from "@/lib/mcp/tools";
import { ASSIGNMENT_SOURCES } from "@/lib/mcp/assignments";
import { buildEditPatch } from "@/lib/mcp/task-updates";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

describe("the server can write, not just read", () => {
  const names = MCP_TOOLS.map((t) => t.name);

  it("covers the whole life of a task", () => {
    for (const tool of ["create_task", "update_task", "complete_task", "delete_task"]) {
      expect(names).toContain(tool);
    }
  });

  it("covers the whole life of a calendar event", () => {
    for (const tool of [
      "create_calendar_event",
      "update_calendar_event",
      "delete_calendar_event",
      "set_event_color",
    ]) {
      expect(names).toContain(tool);
    }
  });

  it("lets a client pull fresh work rather than only read what is cached", () => {
    expect(names).toContain("sync_assignments");
  });

  it("gives every tool a schema a client can call it from", () => {
    for (const tool of MCP_TOOLS) {
      expect(tool.inputSchema.type).toBe("object");
      expect(typeof tool.description).toBe("string");
      expect(tool.description.length).toBeGreaterThan(20);
    }
  });
});

describe("it can see every platform, not two of them", () => {
  it("exposes each source a task can carry", () => {
    // Canvas and Gradescope alone meant an assistant asking what was due saw
    // nothing for a student on Brightspace, Blackboard, Pensive, Classroom or
    // a syllabus import - and nothing said so.
    for (const source of [
      "canvas",
      "gradescope",
      "pensieve",
      "brightspace",
      "blackboard",
      "classroom",
      "syllabus",
    ]) {
      expect(ASSIGNMENT_SOURCES as readonly string[]).toContain(source);
    }
  });

  it("matches the sources the Task type allows", () => {
    const types = read("src/lib/types.ts");
    const line = types.split("\n").find((l) => l.includes('source: "canvas"'))!;
    for (const source of ASSIGNMENT_SOURCES) {
      expect(line).toContain(`"${source}"`);
    }
  });

  it("syncs every platform the engine knows", () => {
    const assignments = read("src/lib/mcp/assignments.ts");
    for (const platform of ["pensieve", "brightspace", "blackboard", "classroom"]) {
      expect(assignments).toContain(`"${platform}",`);
    }
  });
});

describe("tags can be changed, not only set", () => {
  it("is accepted by the update tool", () => {
    const tool = findTool("update_task")!;
    expect(Object.keys(tool.inputSchema.properties ?? {})).toContain("tags");
  });

  it("replaces the list rather than merging it", () => {
    // An assistant asked to remove a tag has no other way to do it.
    expect(buildEditPatch({ tags: ["a", "b"] })).toEqual({ tags: ["a", "b"] });
    expect(buildEditPatch({ tags: [] })).toEqual({ tags: [] });
  });

  it("leaves tags alone when the field is not passed", () => {
    expect(buildEditPatch({ title: "x" })).not.toHaveProperty("tags");
  });

  it("trims, drops blanks and de-duplicates case-insensitively", () => {
    expect(buildEditPatch({ tags: ["  Reading ", "reading", "", "  ", "Lab"] })).toEqual({
      tags: ["Reading", "Lab"],
    });
  });
});

describe("classes are discoverable", () => {
  it("has a tool for them", () => {
    // Every other tool takes a course as free text, so without this the only
    // way to file a task under the right class was to guess its spelling -
    // and a near miss creates a second course rather than failing.
    expect(MCP_TOOLS.map((t) => t.name)).toContain("list_courses");
  });

  it("tells the caller to check before filing work under a class", () => {
    const tool = findTool("list_courses")!;
    expect(tool.description).toContain("create_task");
  });

  it("derives them from tasks, not from one integration's selection", () => {
    // Selected-course columns are per account and say nothing about a class
    // that came from a syllabus or was typed by hand.
    const source = read("src/lib/mcp/tools/list-courses.ts");
    expect(source).toContain('.from("tasks")');
    expect(source).toContain('.eq("user_id", userId)');
  });
});

describe("the settings copy matches what the server does", () => {
  it("does not enumerate a fixed capability set", () => {
    // The panel used to spell out every tool the server exposed, which went
    // stale each time one was added and understated it in between. What a key
    // can do is now a per-key choice, so the card states the connection and
    // the dialog states the access.
    const settings = read("src/components/settings/McpSettings.tsx");
    expect(settings).not.toContain("create, edit, complete and delete tasks");
    expect(settings).toContain("Connect Poke, Claude, or any MCP client");
  });

  it("offers both access levels where the key is created", () => {
    const dialog = read("src/components/settings/McpKeyDialog.tsx");
    expect(dialog).toContain('scope: "full"');
    expect(dialog).toContain('scope: "read"');
    // Worded as what the assistant can do, not as which tools it may call.
    expect(dialog).toContain("Read, add, edit and delete");
    expect(dialog).toContain("Look, but never change anything");
  });

  it("opens the name field empty rather than pre-filled", () => {
    // Pre-filling "Poke" dated the dialog to when that was the only client,
    // and a name typed over a default is more likely to be the real one. The
    // placeholder still shows what a blank name falls back to.
    const dialog = read("src/components/settings/McpKeyDialog.tsx");
    expect(dialog).toContain('const [label, setLabel] = useState("");');
    expect(dialog).toContain('placeholder="Poke"');
  });

  it("shows on each key what that key can do", () => {
    const list = read("src/components/settings/McpKeyList.tsx");
    expect(list).toContain("SCOPE_LABELS[key.scope]");
  });
});
