/**
 * Tests for the live dot beside the hero's synced-assignments count.
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { COUNT_SETTLED_MS, ROLL_START_MS, ROLL_TIMING } from "@/components/landing/synced-count-timing";

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

describe("the live dot", () => {
  const hero = read("src/components/landing/Hero.tsx");

  it("arrives once the count has settled, not with it", () => {
    expect(COUNT_SETTLED_MS).toBe(ROLL_START_MS + ROLL_TIMING.duration);
    expect(hero).toContain("style={{ animationDelay: `${COUNT_SETTLED_MS}ms` }}");
    // fill-mode: both on .animate-fade-up is what hides it until then.
    expect(read("src/app/globals.css")).toMatch(/\.animate-fade-up \{[^}]*animation-fill-mode: both/);
  });

  it("is solid: no pulse, no halo", () => {
    const dot = hero.slice(hero.indexOf("A live indicator"), hero.indexOf("<SyncedCount"));
    expect(dot).toContain("bg-emerald-500");
    expect(dot).not.toContain("animate-[pulse");
    expect(dot).not.toContain("shadow-[");
  });

  it("shares its timing with the count itself", () => {
    expect(read("src/components/landing/SyncedCount.tsx")).toContain('from "./synced-count-timing"');
  });
});
