/**
 * Guards sidebar link prefetching.
 *
 * A DevTools trace of /app/inbox showed the sidebar prefetching
 * /app/inbox?_rsc= twice while the page's own Supabase task query was still
 * in flight — router payload for a navigation that cannot happen, competing
 * for bandwidth with the content the user is actually waiting for.
 *
 * Inactive items must keep prefetching: that is what makes tab switching
 * feel instant. Only the active item is skipped.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SRC = resolve(__dirname, "..");

/**
 * Read a source file with comments stripped.
 *
 * The prefetch decision is explained in a `//` comment that quotes the old
 * `prefetch={true}` value, so a naive read would match the very pattern
 * these tests assert is gone.
 *
 * @param rel - Path relative to src/.
 * @returns File contents with block and line comments removed.
 */
function readCode(rel: string): string {
  return readFileSync(resolve(SRC, rel), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1");
}

const navItem = readCode("components/layout/SidebarNavItem.tsx");

describe("SidebarNavItem prefetch", () => {
  it("does not unconditionally prefetch", () => {
    expect(navItem).not.toMatch(/prefetch=\{true\}/);
  });

  it("skips prefetch for the active route", () => {
    expect(navItem).toMatch(/prefetch=\{!isActive\}/);
  });

  /**
   * `isActive` already accounts for the calendar-under-inbox case, so the
   * prefetch skip inherits that. If the derivation moves, this breaks and
   * the prefetch expression needs re-checking with it.
   */
  it("derives isActive before the link renders", () => {
    const activeIdx = navItem.indexOf("const isActive =");
    const prefetchIdx = navItem.indexOf("prefetch={!isActive}");
    expect(activeIdx).toBeGreaterThan(-1);
    expect(prefetchIdx).toBeGreaterThan(activeIdx);
  });
});

describe("Sidebar marketing link", () => {
  const sidebar = readCode("components/layout/Sidebar.tsx");

  /** Pre-existing fix: the landing page is a large payload no app user needs. */
  it("still does not prefetch the marketing page", () => {
    expect(sidebar).toMatch(/href="\/\?landing=1"\s+prefetch=\{false\}/);
  });
});
