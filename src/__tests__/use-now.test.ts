/**
 * Tests for useNow, the hook that turns "the current time" into state so
 * render stays pure.
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

describe("useNow", () => {
  const hook = read("src/hooks/useNow.ts");

  it("holds the time in state and refreshes it on an interval", () => {
    expect(hook).toContain("useState(() => new Date())");
    expect(hook).toContain("setInterval(() => setNow(new Date()), intervalMs)");
    expect(hook).toContain("clearInterval(id)");
  });

  it("can be told not to tick", () => {
    expect(hook).toContain("if (intervalMs <= 0) return;");
  });

  it("replaces every Date.now() that used to run during render", () => {
    // Each of these read the clock mid-render, which the purity rule flags
    // and which can make server and client markup disagree.
    for (const f of [
      "src/components/calendar/CalendarGCalItem.tsx",
      "src/components/calendar/TimeGridEvent.tsx",
      "src/components/tasks/TaskList.tsx",
      "src/components/home/widgets/gcal-displays/AgendaDisplay.tsx",
      "src/components/home/widgets/gcal-displays/CardsDisplay.tsx",
      "src/components/home/widgets/gcal-displays/CompactDisplay.tsx",
      "src/components/home/widgets/gcal-displays/ListDisplay.tsx",
      "src/components/home/widgets/gcal-displays/TimelineDisplay.tsx",
    ]) {
      const src = read(f);
      expect(src, f).toContain("useNow()");
      expect(src, f).not.toContain("const now = new Date();");
      expect(src, f).not.toContain("const now = Date.now();");
    }
  });
});
