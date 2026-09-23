/**
 * Tests for the server-side author key (audit C2) and the migration that
 * backs it: the same person is the same key within a room and a different
 * key elsewhere, the SQL formula matches Node's, author_id is not readable
 * by end users, and realtime is a broadcast of safe columns only.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createHmac } from "crypto";
import * as fs from "fs";
import * as path from "path";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { computeAuthorKey, getChatAuthorSecret, DEV_CHAT_AUTHOR_SECRET } from "@/lib/chat-author-key";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const original = { secret: process.env.CHAT_AUTHOR_SECRET, env: process.env.NODE_ENV };
beforeEach(() => {
  delete process.env.CHAT_AUTHOR_SECRET;
});
afterEach(() => {
  if (original.secret === undefined) delete process.env.CHAT_AUTHOR_SECRET;
  else process.env.CHAT_AUTHOR_SECRET = original.secret;
  vi.stubEnv("NODE_ENV", original.env ?? "test");
});

describe("computeAuthorKey", () => {
  it("is stable per (author, course) and differs across courses and authors", () => {
    process.env.CHAT_AUTHOR_SECRET = "s";
    expect(computeAuthorKey("u1", "c1")).toBe(computeAuthorKey("u1", "c1"));
    expect(computeAuthorKey("u1", "c1")).not.toBe(computeAuthorKey("u1", "c2"));
    expect(computeAuthorKey("u1", "c1")).not.toBe(computeAuthorKey("u2", "c1"));
  });

  it("is HMAC-SHA256 hex of author:course, the same formula the migration uses", () => {
    process.env.CHAT_AUTHOR_SECRET = "s";
    expect(computeAuthorKey("u1", "c1")).toBe(createHmac("sha256", "s").update("u1:c1").digest("hex"));
    const sql = read("supabase/migrations/20260923000005_chat_author_key_and_broadcast.sql");
    expect(sql).toContain("p_author_id::text || ':' || p_course_id::text");
    expect(sql).toContain("'sha256'");
    expect(sql).toContain(`'${DEV_CHAT_AUTHOR_SECRET}'`);
  });

  it("falls back to the development secret outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(getChatAuthorSecret()).toBe(DEV_CHAT_AUTHOR_SECRET);
  });

  it("refuses to run without a secret in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(() => getChatAuthorSecret()).toThrow("CHAT_AUTHOR_SECRET is not configured");
  });
});

describe("migration 20260923000005", () => {
  const sql = read("supabase/migrations/20260923000005_chat_author_key_and_broadcast.sql");

  it("revokes author_id from end users and grants only the safe columns", () => {
    expect(sql).toContain("revoke select on public.chat_messages from authenticated, anon;");
    const grant = sql.match(/grant select \(([^)]+)\)\s+on public\.chat_messages to authenticated;/);
    expect(grant).not.toBeNull();
    expect(grant![1]).not.toContain("author_id");
    expect(grant![1]).toContain("author_key");
    expect(grant![1]).toContain("client_nonce");
  });

  it("broadcasts safe columns on the private room topic and drops postgres_changes", () => {
    expect(sql).toContain("'chat:' || new.course_id::text");
    expect(sql).not.toMatch(/'author_id', new\.author_id/);
    expect(sql).toContain("alter publication supabase_realtime drop table public.chat_messages;");
    expect(sql).toContain("new.author_key := public.chat_author_key(new.author_id, new.course_id);");
  });
});

describe("no client path reads author_id", () => {
  it("client components and hooks never reference author_id", () => {
    const dirs = ["src/components/discussions", "src/hooks"];
    for (const dir of dirs) {
      for (const f of fs.readdirSync(path.join(ROOT, dir))) {
        const src = read(path.join(dir, f));
        expect(src, `${dir}/${f}`).not.toMatch(/\bauthor_id\b/);
      }
    }
    expect(read("src/components/ui/GlobalChatNotifier.tsx")).not.toMatch(/\bauthor_id\b/);
    expect(read("src/components/ui/GlobalChatNotifier.tsx")).not.toContain("postgres_changes");
  });

  it("the old unkeyed client-side obfuscation is gone", () => {
    expect(fs.existsSync(path.join(ROOT, "src/lib/author-obfuscate.ts"))).toBe(false);
  });
});
