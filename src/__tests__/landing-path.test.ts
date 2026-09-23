import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { pickLandingPath, isMobileRequest } from "@/lib/landing-path";

describe("pickLandingPath", () => {
  it("defaults to /app/inbox when nothing is hidden", () => {
    expect(pickLandingPath({})).toBe("/app/inbox");
    expect(pickLandingPath({ hidden_nav_items: [] })).toBe("/app/inbox");
  });

  it("falls through to next nav item when Home is hidden", () => {
    expect(pickLandingPath({ hidden_nav_items: ["/app/home"] })).toBe("/app/inbox");
  });

  it("falls through past multiple hidden items", () => {
    expect(
      pickLandingPath({ hidden_nav_items: ["/app/home", "/app/inbox", "/app/calendar"] }),
    ).toBe("/app/discussions");
  });

  it("returns /app/inbox fallback when every nav item is hidden", () => {
    expect(
      pickLandingPath({
        hidden_nav_items: [
          "/app/home",
          "/app/inbox",
          "/app/calendar",
          "/app/discussions",
        ],
      }),
    ).toBe("/app/inbox");
  });

  it("ignores unknown / non-nav hrefs in hidden list", () => {
    expect(pickLandingPath({ hidden_nav_items: ["/app/something-else"] })).toBe("/app/inbox");
  });

  it("treats null/undefined metadata as nothing hidden", () => {
    expect(pickLandingPath(null)).toBe("/app/inbox");
    expect(pickLandingPath(undefined)).toBe("/app/inbox");
  });

  it("ignores non-string entries inside hidden_nav_items", () => {
    expect(
      pickLandingPath({ hidden_nav_items: [123, null, "/app/home"] as unknown[] }),
    ).toBe("/app/inbox");
  });

  describe("isMobile", () => {
    it("skips the desktop-only board and lands on Inbox", () => {
      expect(pickLandingPath({}, { isMobile: true })).toBe("/app/inbox");
    });

    it("skips Chat too when the earlier items are hidden", () => {
      expect(
        pickLandingPath(
          { hidden_nav_items: ["/app/inbox", "/app/calendar"] },
          { isMobile: true },
        ),
      ).toBe("/app/inbox");
    });

    it("still honors hidden items among the mobile-eligible routes", () => {
      expect(
        pickLandingPath({ hidden_nav_items: ["/app/inbox"] }, { isMobile: true }),
      ).toBe("/app/calendar");
    });

    it("is a no-op on desktop", () => {
      expect(pickLandingPath({}, { isMobile: false })).toBe("/app/inbox");
    });
  });
});

describe("isMobileRequest", () => {
  /** Builds a Headers object from a plain record. */
  function headers(init: Record<string, string>): Headers {
    return new Headers(init);
  }

  it("trusts the sec-ch-ua-mobile client hint", () => {
    expect(isMobileRequest(headers({ "sec-ch-ua-mobile": "?1" }))).toBe(true);
    expect(isMobileRequest(headers({ "sec-ch-ua-mobile": "?0" }))).toBe(false);
  });

  it("falls back to the user agent for iPhone Safari", () => {
    expect(
      isMobileRequest(
        headers({
          "user-agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
        }),
      ),
    ).toBe(true);
  });

  it("matches Android phones but not Android tablets", () => {
    expect(
      isMobileRequest(headers({ "user-agent": "Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Safari/537.36" })),
    ).toBe(true);
    expect(
      isMobileRequest(headers({ "user-agent": "Mozilla/5.0 (Linux; Android 14; SM-X700) Safari/537.36" })),
    ).toBe(false);
  });

  it("treats desktop and iPad user agents as non-mobile", () => {
    expect(
      isMobileRequest(headers({ "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15" })),
    ).toBe(false);
    expect(
      isMobileRequest(headers({ "user-agent": "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) Safari/604.1" })),
    ).toBe(false);
  });

  it("returns false when no signal is present", () => {
    expect(isMobileRequest(headers({}))).toBe(false);
  });
});

describe("withdrawn home route", () => {
  it("never lands anyone on the board while it is withdrawn", () => {
    // Existing accounts carry hidden_nav_items from when Home was a real nav
    // entry, including accounts that never hid it. None of those may resolve
    // to /app/home.
    const metadatas: unknown[] = [
      {},
      null,
      undefined,
      { hidden_nav_items: [] },
      { hidden_nav_items: ["/app/home"] },
      { hidden_nav_items: ["/app/inbox"] },
      { hidden_nav_items: ["/app/calendar"] },
      { hidden_nav_items: ["/app/inbox", "/app/calendar"] },
    ];
    for (const meta of metadatas) {
      for (const isMobile of [true, false]) {
        expect(pickLandingPath(meta, { isMobile })).not.toBe("/app/home");
      }
    }
  });

  it("keeps the route out of the sidebar", () => {
    const constants = readFileSync(
      resolve(__dirname, "../lib/constants.ts"),
      "utf8"
    );
    const navBlock = constants.slice(
      constants.indexOf("export const NAV_ITEMS"),
      constants.indexOf("];", constants.indexOf("export const NAV_ITEMS"))
    );
    expect(navBlock).not.toContain("/app/home");
  });

  it("redirects the page rather than deleting it", () => {
    // The board must keep building so it can be brought back.
    const page = readFileSync(
      resolve(__dirname, "../app/app/home/page.tsx"),
      "utf8"
    );
    expect(page).toContain('redirect("/app/inbox")');
    expect(existsSync(resolve(__dirname, "../app/app/home/HomeBoard.tsx"))).toBe(true);
  });
});
