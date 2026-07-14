import { describe, it, expect } from "vitest";
import { pickLandingPath } from "@/lib/landing-path";

describe("pickLandingPath", () => {
  it("defaults to /app/home when nothing is hidden", () => {
    expect(pickLandingPath({})).toBe("/app/home");
    expect(pickLandingPath({ hidden_nav_items: [] })).toBe("/app/home");
  });

  it("falls through to next nav item when Home is hidden", () => {
    expect(pickLandingPath({ hidden_nav_items: ["/app/home"] })).toBe("/app/inbox");
  });

  it("falls through past multiple hidden items", () => {
    expect(
      pickLandingPath({ hidden_nav_items: ["/app/home", "/app/inbox", "/app/calendar"] }),
    ).toBe("/app/pomodoro");
  });

  it("returns /app/inbox fallback when every nav item is hidden", () => {
    expect(
      pickLandingPath({
        hidden_nav_items: [
          "/app/home",
          "/app/inbox",
          "/app/calendar",
          "/app/pomodoro",
          "/app/discussions",
        ],
      }),
    ).toBe("/app/inbox");
  });

  it("ignores unknown / non-nav hrefs in hidden list", () => {
    expect(pickLandingPath({ hidden_nav_items: ["/app/something-else"] })).toBe("/app/home");
  });

  it("treats null/undefined metadata as nothing hidden", () => {
    expect(pickLandingPath(null)).toBe("/app/home");
    expect(pickLandingPath(undefined)).toBe("/app/home");
  });

  it("ignores non-string entries inside hidden_nav_items", () => {
    expect(
      pickLandingPath({ hidden_nav_items: [123, null, "/app/home"] as unknown[] }),
    ).toBe("/app/inbox");
  });
});
