import { describe, it, expect } from "vitest";
import { pickLandingPath } from "@/lib/landing-path";

describe("pickLandingPath — Pro user", () => {
  it("defaults to /app/home when nothing is hidden", () => {
    expect(pickLandingPath({}, true)).toBe("/app/home");
    expect(pickLandingPath({ hidden_nav_items: [] }, true)).toBe("/app/home");
  });

  it("falls through to next nav item when Home is hidden", () => {
    expect(pickLandingPath({ hidden_nav_items: ["/app/home"] }, true)).toBe("/app/inbox");
  });

  it("falls through past multiple hidden items", () => {
    expect(
      pickLandingPath({ hidden_nav_items: ["/app/home", "/app/inbox", "/app/calendar"] }, true),
    ).toBe("/app/notes");
  });

  it("returns /app/inbox fallback when every nav item is hidden", () => {
    expect(
      pickLandingPath(
        {
          hidden_nav_items: [
            "/app/home",
            "/app/inbox",
            "/app/calendar",
            "/app/notes",
            "/app/discussions",
          ],
        },
        true,
      ),
    ).toBe("/app/inbox");
  });

  it("ignores unknown / non-nav hrefs in hidden list", () => {
    expect(
      pickLandingPath({ hidden_nav_items: ["/app/something-else"] }, true),
    ).toBe("/app/home");
  });

  it("treats null/undefined metadata as nothing hidden", () => {
    expect(pickLandingPath(null, true)).toBe("/app/home");
    expect(pickLandingPath(undefined, true)).toBe("/app/home");
  });
});

describe("pickLandingPath — Free user (default)", () => {
  it("skips /app/home and lands on /app/inbox", () => {
    expect(pickLandingPath({})).toBe("/app/inbox");
    expect(pickLandingPath({ hidden_nav_items: [] })).toBe("/app/inbox");
  });

  it("skips /app/home even when not in hidden_nav_items", () => {
    // The Pro gate is enforced regardless of the nav-visibility preference.
    expect(pickLandingPath({ hidden_nav_items: ["/app/inbox"] })).toBe("/app/calendar");
  });

  it("explicit isPro=false matches default behavior", () => {
    expect(pickLandingPath({}, false)).toBe("/app/inbox");
  });

  it("returns fallback when everything (including home) is unreachable", () => {
    expect(
      pickLandingPath({
        hidden_nav_items: ["/app/inbox", "/app/calendar", "/app/notes", "/app/discussions"],
      }),
    ).toBe("/app/inbox");
  });

  it("ignores non-string entries inside hidden_nav_items", () => {
    expect(
      pickLandingPath({ hidden_nav_items: [123, null, "/app/inbox"] as unknown[] }),
    ).toBe("/app/calendar");
  });
});
