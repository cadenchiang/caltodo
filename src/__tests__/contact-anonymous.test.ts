/**
 * Tests that anonymous contact submissions can be stored.
 *
 * Audit L1: the route inserted user_id NULL for logged-out visitors into a
 * NOT NULL column, so they got a 500.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

describe("contact_messages.user_id", () => {
  it("is made nullable by a migration", () => {
    const migration = read("supabase/migrations/20260921000009_contact_messages_nullable_user.sql");
    expect(migration).toMatch(/alter table public\.contact_messages\s+alter column user_id drop not null;/);
  });

  it("is still inserted as null for anonymous visitors, with their email", () => {
    const route = read("src/app/api/contact/route.ts");
    expect(route).toContain("user_id: user?.id ?? null,");
    expect(route).toContain("email: email || user?.email || null,");
    expect(route).toContain('return NextResponse.json({ error: "Email is required" }, { status: 400 });');
  });
});
