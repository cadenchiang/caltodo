/**
 * Source-level tests for M16: the OAuth popup poll (now in
 * useGoogleCalendarConnect, split out of GoogleCalendarSettings) lives in a
 * ref, is cleared on unmount, and completion after unmount does not navigate.
 * (No React render harness in this project.)
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const src = readFileSync(join(process.cwd(), "src/hooks/useGoogleCalendarConnect.ts"), "utf8");

describe("useGoogleCalendarConnect popup poll", () => {
  it("stores the interval in a ref rather than a local const", () => {
    expect(src).toContain("const popupPollRef = useRef<ReturnType<typeof setInterval> | null>(null)");
    expect(src).toContain("popupPollRef.current = setInterval(");
    expect(src).not.toContain("const pollId = setInterval(");
  });

  it("clears the poll in the unmount cleanup", () => {
    const cleanup = src.slice(src.indexOf("mountedRef.current = false;"), src.indexOf("}, []);", src.indexOf("mountedRef.current = false;")));
    expect(cleanup).toContain("clearInterval(popupPollRef.current)");
  });

  it("only navigates back to Settings while still mounted", () => {
    expect(src).toContain('if (mountedRef.current) router.replace("/app/settings?section=integrations");');
    expect(src.match(/router\.replace\(/g)).toHaveLength(1);
  });
});

describe("post-connect setup (L12)", () => {
  it("no longer branches on a needsSync flag select-calendar never returns", () => {
    expect(src).not.toContain("needsSync");
    const setup = src.slice(src.indexOf("const autoSetupCalendar = useCallback"), src.indexOf("// Full-page redirect return"));
    expect(setup).not.toContain('fetch("/api/gcal/initial-sync"');
    expect(setup).toContain("Google Calendar connected! New tasks will sync automatically.");
  });
});
