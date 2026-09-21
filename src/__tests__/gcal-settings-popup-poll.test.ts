/**
 * Source-level tests for M16: the OAuth popup poll in GoogleCalendarSettings
 * lives in a ref, is cleared on unmount, and completion after unmount does
 * not navigate. (No React render harness in this project.)
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const src = readFileSync(join(process.cwd(), "src/components/settings/GoogleCalendarSettings.tsx"), "utf8");

describe("GoogleCalendarSettings popup poll", () => {
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
