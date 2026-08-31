/**
 * Tests for analytics route classification.
 *
 * The surface tag is what lets retention exclude anonymous marketing traffic
 * now that those events are captured rather than dropped. A wrong answer here
 * silently contaminates every person-level metric.
 */

import { describe, it, expect } from "vitest";
import { surfaceForPath, currentSurface } from "@/lib/analytics-surface";

describe("surfaceForPath", () => {
  it("classifies the authenticated product as app", () => {
    expect(surfaceForPath("/app")).toBe("app");
    expect(surfaceForPath("/app/home")).toBe("app");
    expect(surfaceForPath("/app/onboarding")).toBe("app");
    expect(surfaceForPath("/app/settings/integrations")).toBe("app");
  });

  it("classifies public pages as marketing", () => {
    expect(surfaceForPath("/")).toBe("marketing");
    expect(surfaceForPath("/login")).toBe("marketing");
    expect(surfaceForPath("/guides")).toBe("marketing");
    expect(surfaceForPath("/guides/sync-canvas-to-google-calendar")).toBe("marketing");
    expect(surfaceForPath("/for/uc-berkeley")).toBe("marketing");
  });

  it("does not claim routes that merely start with the letters app", () => {
    // The previous implementation used a bare startsWith("/app") test.
    expect(surfaceForPath("/apple-pie")).toBe("marketing");
    expect(surfaceForPath("/appointments")).toBe("marketing");
  });

  it("treats missing or empty input as marketing", () => {
    expect(surfaceForPath("")).toBe("marketing");
  });
});

describe("currentSurface", () => {
  it("falls back to marketing when window is unavailable", () => {
    // Runs under the node environment, so `window` is not defined here.
    expect(currentSurface()).toBe("marketing");
  });
});
