/**
 * Tests for MCP API key scopes.
 *
 * A key is either full access or read only, and the read set is a hand-written
 * list rather than something inferred from tool names. That is safer but it can
 * drift, so the first suite here fails when a tool is added to the registry
 * without being classified.
 *
 * The rest guard the enforcement itself: that a read-only key is refused a
 * write tool before the tool runs, that it is never advertised one, and that
 * an unreadable stored value falls back to the safe-for-existing-keys default
 * rather than throwing.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const mockList = vi.fn();
const mockSync = vi.fn();
vi.mock("@/lib/mcp/assignments", () => ({
  listAssignments: (...args: unknown[]) => mockList(...args),
  syncAssignments: (...args: unknown[]) => mockSync(...args),
}));

const mockCreate = vi.fn();
const mockDelete = vi.fn();
vi.mock("@/lib/mcp/mutations", () => ({
  createTask: (...args: unknown[]) => mockCreate(...args),
  deleteTask: (...args: unknown[]) => mockDelete(...args),
}));

const mockListEvents = vi.fn();
const mockSetColor = vi.fn();
vi.mock("@/lib/mcp/calendar", () => ({
  listCalendarEvents: (...args: unknown[]) => mockListEvents(...args),
  setEventColor: (...args: unknown[]) => mockSetColor(...args),
}));

import {
  MCP_SCOPES,
  DEFAULT_SCOPE,
  READ_ONLY_TOOLS,
  SCOPE_LABELS,
  isMcpScope,
  coerceScope,
  scopeAllowsTool,
  toolsForScope,
} from "@/lib/mcp/scopes";
import { MCP_TOOLS, callTool } from "@/lib/mcp/tools";

const USER_ID = "user-abc-123";
const ROOT = path.resolve(__dirname, "../..");

/** Tool names the registry actually exposes. */
const TOOL_NAMES = MCP_TOOLS.map((t) => t.name);

/** Everything that is not in the read set is, by definition, a write. */
const WRITE_TOOLS = TOOL_NAMES.filter((n) => !READ_ONLY_TOOLS.has(n));

describe("scope classification", () => {
  it("classifies every tool in the registry", () => {
    // The read set is written by hand, so a tool added to the registry is a
    // write until someone says otherwise. This asserts the split is total:
    // every tool is in exactly one of the two buckets.
    expect(READ_ONLY_TOOLS.size + WRITE_TOOLS.length).toBe(TOOL_NAMES.length);
  });

  it("names only tools that exist", () => {
    // A typo in the read set would silently grant nothing, or worse, keep
    // granting a tool that has since been renamed.
    for (const name of READ_ONLY_TOOLS) {
      expect(TOOL_NAMES).toContain(name);
    }
  });

  it("keeps the three list tools readable and everything else not", () => {
    expect([...READ_ONLY_TOOLS].sort()).toEqual([
      "list_assignments",
      "list_calendar_events",
      "list_courses",
    ]);
    expect(WRITE_TOOLS.sort()).toEqual([
      "complete_task",
      "create_calendar_event",
      "create_task",
      "delete_calendar_event",
      "delete_task",
      "set_event_color",
      "sync_assignments",
      "update_calendar_event",
      "update_task",
    ]);
  });

  it("defaults to full access, so keys issued before scopes are unchanged", () => {
    expect(DEFAULT_SCOPE).toBe("full");
    expect(MCP_SCOPES).toEqual(["full", "read"]);
    expect(SCOPE_LABELS.full).toBe("Full access");
    expect(SCOPE_LABELS.read).toBe("Read only");
  });
});

describe("isMcpScope / coerceScope", () => {
  it("accepts the known scopes and nothing else", () => {
    expect(isMcpScope("full")).toBe(true);
    expect(isMcpScope("read")).toBe(true);
    expect(isMcpScope("write")).toBe(false);
    expect(isMcpScope("")).toBe(false);
    expect(isMcpScope(null)).toBe(false);
    expect(isMcpScope(1)).toBe(false);
  });

  it("falls back to the default for a null column", () => {
    // A row written before the column existed reads back as null, and must
    // keep working rather than throwing on every request.
    expect(coerceScope(null)).toBe("full");
    expect(coerceScope(undefined)).toBe("full");
  });

  it("falls back to the default for an unrecognised value", () => {
    expect(coerceScope("admin")).toBe("full");
  });
});

describe("scopeAllowsTool", () => {
  it("lets a full key call every tool in the registry", () => {
    for (const name of TOOL_NAMES) {
      expect(scopeAllowsTool("full", name)).toBe(true);
    }
  });

  it("lets a read key call only the read tools", () => {
    for (const name of READ_ONLY_TOOLS) {
      expect(scopeAllowsTool("read", name)).toBe(true);
    }
    for (const name of WRITE_TOOLS) {
      expect(scopeAllowsTool("read", name)).toBe(false);
    }
  });

  it("denies a read key a tool it has never heard of", () => {
    // A tool added later is denied to read-only keys until it is deliberately
    // classified, rather than being allowed by omission.
    expect(scopeAllowsTool("read", "list_and_delete_everything")).toBe(false);
    expect(scopeAllowsTool("full", "list_and_delete_everything")).toBe(true);
  });
});

describe("toolsForScope", () => {
  it("returns every tool for a full key", () => {
    expect(toolsForScope("full", MCP_TOOLS)).toHaveLength(MCP_TOOLS.length);
  });

  it("returns only the read tools for a read key", () => {
    const names = toolsForScope("read", MCP_TOOLS).map((t) => t.name);
    expect(names.sort()).toEqual([
      "list_assignments",
      "list_calendar_events",
      "list_courses",
    ]);
  });

  it("does not hand back the caller's own array", () => {
    // The registry is module-level state; a caller sorting the result must not
    // reorder it for everyone else.
    expect(toolsForScope("full", MCP_TOOLS)).not.toBe(MCP_TOOLS);
  });
});

describe("callTool enforcement", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refuses a write tool on a read-only key", async () => {
    const result = await callTool("delete_task", { id: "t1" }, USER_ID, "read");
    expect(result.isError).toBe(true);
    expect(result.text).toContain("Read only");
  });

  it("does not run the tool it refused", async () => {
    // The check has to happen before execute, or a "denied" delete would still
    // have deleted.
    await callTool("delete_task", { id: "t1" }, USER_ID, "read");
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("refuses sync, which writes even though it reads like a fetch", async () => {
    await callTool("sync_assignments", {}, USER_ID, "read");
    expect(mockSync).not.toHaveBeenCalled();
  });

  it("still runs a read tool on a read-only key", async () => {
    mockList.mockResolvedValue([]);
    const result = await callTool("list_assignments", {}, USER_ID, "read");
    expect(result.isError).toBe(false);
    expect(mockList).toHaveBeenCalled();
  });

  it("runs a write tool on a full key", async () => {
    mockDelete.mockResolvedValue({ title: "Problem Set 3", soft: false });
    await callTool("delete_task", { id: "t1" }, USER_ID, "full");
    expect(mockDelete).toHaveBeenCalled();
  });

  it("reports an unknown tool as unknown, whatever the scope", async () => {
    const result = await callTool("no_such_tool", {}, USER_ID, "read");
    expect(result.isError).toBe(true);
    expect(result.text).toContain("Unknown tool");
  });
});

describe("scope migration", () => {
  const sql = fs.readFileSync(
    path.join(ROOT, "supabase/migrations/20260902000001_mcp_key_scopes.sql"),
    "utf8"
  );

  it("defaults existing keys to full access", () => {
    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'full'/);
  });

  it("constrains the column to the scopes the code knows", () => {
    expect(sql).toMatch(/CHECK \(scope IN \('full', 'read'\)\)/);
  });

  it("adds the UPDATE policy the rename path needs", () => {
    // Without it renameApiKey's UPDATE matched zero rows under RLS and the
    // route reported "That API key does not exist" for a key the user owned.
    expect(sql).toContain('FOR UPDATE');
    expect(sql).toMatch(/USING \(auth\.uid\(\) = user_id\)/);
    expect(sql).toMatch(/WITH CHECK \(auth\.uid\(\) = user_id\)/);
  });
});

describe("full access is actually full", () => {
  it("permits every tool the server exposes", () => {
    // The point of the scope split is that `read` is narrow, not that `full`
    // is a second, milder restriction. A key the user chose full access for
    // has to be able to do everything the app's own UI can drive: add an
    // assignment, sync, edit, delete, and manage the calendar.
    const denied = MCP_TOOLS.filter((t) => !scopeAllowsTool("full", t.name)).map((t) => t.name);
    expect(denied).toEqual([]);
  });

  it("permits a tool added later without being listed anywhere", () => {
    // scopeAllowsTool short-circuits on `full`, so a new tool is allowed the
    // moment it is registered. Pinning this stops anyone "tightening" full
    // access into an allowlist that silently drops new tools.
    expect(scopeAllowsTool("full", "a_tool_that_does_not_exist_yet")).toBe(true);
  });

  it("offers every tool to a full key in tools/list", () => {
    expect(toolsForScope("full", MCP_TOOLS).map((t) => t.name)).toEqual(
      MCP_TOOLS.map((t) => t.name)
    );
  });

  it("lets a full key both create work and pull it in", () => {
    // The two the user asked about by name.
    for (const tool of ["create_task", "sync_assignments"]) {
      expect(MCP_TOOLS.map((t) => t.name)).toContain(tool);
      expect(scopeAllowsTool("full", tool)).toBe(true);
    }
  });
});
