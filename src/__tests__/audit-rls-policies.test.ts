/**
 * Pins the RLS policies added for the 2026-09-21 audit (L2, L8).
 *
 * The migrations are plain SQL that vitest cannot execute; these assert the
 * files exist, target the right table and command, and scope every clause
 * to the owning user, so a later edit cannot quietly widen them.
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "supabase/migrations");
const read = (name: string) => fs.readFileSync(path.join(DIR, name), "utf8");
const squash = (sql: string) => sql.replace(/--[^\n]*/g, "").replace(/\s+/g, " ").toLowerCase();

describe("push_subscriptions UPDATE policy (L2)", () => {
  const sql = squash(read("20260921000006_push_subscriptions_update_policy.sql"));

  it("adds an UPDATE policy on push_subscriptions", () => {
    expect(sql).toContain("on public.push_subscriptions for update");
  });

  it("scopes both the existing row and the new row to the owner", () => {
    expect(sql).toContain("using (auth.uid() = user_id)");
    expect(sql).toContain("with check (auth.uid() = user_id)");
  });

  it("is re-runnable", () => {
    expect(sql).toContain('drop policy if exists "users update own push subscriptions"');
  });
});

describe("board_layouts DELETE policy (L8)", () => {
  const sql = squash(read("20260921000007_board_layouts_delete_policy.sql"));

  it("adds a DELETE policy on board_layouts scoped to the owner", () => {
    expect(sql).toContain("on public.board_layouts for delete using (auth.uid() = user_id)");
  });

  it("is re-runnable", () => {
    expect(sql).toContain('drop policy if exists "users can delete own board layout"');
  });
});

describe("the original tables really lacked these policies", () => {
  it("push_subscriptions had no UPDATE policy before", () => {
    const sql = squash(read("20260415100000_push_subscriptions.sql"));
    expect(sql).not.toContain("on public.push_subscriptions for update");
  });

  it("board_layouts had no DELETE policy before", () => {
    const sql = squash(read("20260301000001_create_board_layouts.sql"));
    expect(sql).not.toContain("for delete");
  });
});
