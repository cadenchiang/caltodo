/**
 * Guards against analytics event names that are declared but never fired.
 *
 * Three separate holes shipped this way: sign_in_submitted, sign_up_submitted
 * and auth_error sat in the union unfired for the life of the project, and
 * five notification_* names described a notification center that was never
 * built. A dangling union member is invisible — it type-checks, it lints, and
 * it fails no test, so the funnel step it was meant to cover just silently
 * reads as zero.
 *
 * This test closes that loop: every name in AnalyticsEvent must be emitted
 * from somewhere in src/, and anything unreachable has to be either wired up
 * or deleted.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const ANALYTICS = "src/lib/analytics.ts";

/**
 * Extracts the event names declared in the AnalyticsEvent union.
 *
 * @returns Every string literal in the union, in declaration order.
 * @throws If the union cannot be located, which means this test is silently
 *         passing against nothing and must be repaired rather than ignored.
 */
function declaredEventNames(): string[] {
  const src = fs.readFileSync(path.join(ROOT, ANALYTICS), "utf8");
  const union = src.match(/type AnalyticsEvent =([\s\S]*?);\n/);
  if (!union) throw new Error("AnalyticsEvent union not found in " + ANALYTICS);
  return [...union[1].matchAll(/"([a-z0-9_$]+)"/gi)].map((m) => m[1]);
}

/**
 * Recursively collects every .ts/.tsx source file under src/, excluding the
 * declaration site itself and the test suite (a name referenced only by a test
 * is still dead in the product).
 *
 * @param dir - Directory to walk, absolute.
 * @returns Absolute paths of the files to search.
 */
function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__" || entry.name === "node_modules") continue;
      out.push(...sourceFiles(full));
    } else if (/\.tsx?$/.test(entry.name) && !full.endsWith(ANALYTICS)) {
      out.push(full);
    }
  }
  return out;
}

const names = declaredEventNames();
const corpus = sourceFiles(path.join(ROOT, "src"))
  .map((f) => fs.readFileSync(f, "utf8"))
  .join("\n");

describe("AnalyticsEvent union", () => {
  it("is non-empty and was actually parsed", () => {
    // Cheap insurance: a broken regex above would make every assertion vacuous.
    expect(names.length).toBeGreaterThan(20);
    expect(names).toContain("task_created");
  });

  it("declares no duplicates", () => {
    expect([...new Set(names)]).toHaveLength(names.length);
  });

  it.each(names)("%s is emitted somewhere in src/", (name) => {
    expect(corpus).toContain(`"${name}"`);
  });

  it("no longer declares the notification center that was never built", () => {
    for (const dead of [
      "notification_center_opened",
      "notification_clicked",
      "notifications_marked_read",
      "notifications_cleared",
      "notification_created",
    ]) {
      expect(names).not.toContain(dead);
    }
  });
});
