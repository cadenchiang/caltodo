/**
 * Tests for the mobile redirect loop when Inbox and Calendar are both hidden.
 *
 * Audit H13: HiddenRouteRedirect asked pickLandingPath without saying it
 * was on mobile, got desktop-only Chat, and MobileRouteGuard sent the user
 * straight back. Settings let both landing-capable items be hidden.
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  canHideNavItem,
  pickLandingPath,
  LANDING_CAPABLE_HREFS,
  LAST_LANDING_ITEM_REASON,
} from "@/lib/landing-path";

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

describe("LANDING_CAPABLE_HREFS", () => {
  it("is Inbox and Calendar, never a desktop-only route", () => {
    expect(LANDING_CAPABLE_HREFS).toEqual(["/app/inbox", "/app/calendar"]);
  });
});

describe("canHideNavItem", () => {
  it("allows hiding one of the two while the other is visible", () => {
    expect(canHideNavItem("/app/inbox", new Set())).toEqual({ allowed: true });
    expect(canHideNavItem("/app/calendar", new Set())).toEqual({ allowed: true });
  });

  it("refuses to hide the last visible landing-capable item, with a reason", () => {
    expect(canHideNavItem("/app/calendar", new Set(["/app/inbox"]))).toEqual({
      allowed: false,
      reason: LAST_LANDING_ITEM_REASON,
    });
    expect(canHideNavItem("/app/inbox", new Set(["/app/calendar"]))).toEqual({
      allowed: false,
      reason: LAST_LANDING_ITEM_REASON,
    });
  });

  it("always allows hiding a desktop-only item", () => {
    expect(canHideNavItem("/app/discussions", new Set(["/app/inbox", "/app/calendar"]))).toEqual({ allowed: true });
    expect(canHideNavItem("/app/home", new Set(["/app/inbox"]))).toEqual({ allowed: true });
  });

  it("treats hiding an already-hidden item as a no-op", () => {
    expect(canHideNavItem("/app/inbox", new Set(["/app/inbox", "/app/calendar"]))).toEqual({ allowed: true });
  });
});

describe("pickLandingPath on mobile", () => {
  it("never returns a desktop-only route, even with everything hidden", () => {
    const everything = { hidden_nav_items: ["/app/home", "/app/inbox", "/app/calendar", "/app/discussions"] };
    const target = pickLandingPath(everything, { isMobile: true });
    expect(["/app/home", "/app/discussions"]).not.toContain(target);
    expect(target).toBe("/app/inbox");
  });

  it("with only Inbox and Calendar hidden falls back to Inbox rather than Chat", () => {
    expect(pickLandingPath({ hidden_nav_items: ["/app/inbox", "/app/calendar"] }, { isMobile: true })).toBe("/app/inbox");
    // Desktop still gets Chat, so the guard on the client must pass isMobile.
    expect(pickLandingPath({ hidden_nav_items: ["/app/inbox", "/app/calendar"] })).toBe("/app/discussions");
  });
});

describe("HiddenRouteRedirect", () => {
  const guard = read("src/components/layout/HiddenRouteRedirect.tsx");

  it("tells the picker whether the viewport is mobile", () => {
    expect(guard).toContain("window.matchMedia(MOBILE_QUERY).matches");
    expect(guard).toContain("pickLandingPath({ hidden_nav_items: [...hidden] }, { isMobile })");
  });

  it("uses the same breakpoint as MobileRouteGuard", () => {
    const mobileGuard = read("src/components/layout/MobileRouteGuard.tsx");
    const query = (src: string) => src.match(/const MOBILE_QUERY = "([^"]+)"/)?.[1];
    expect(query(guard)).toBe(query(mobileGuard));
  });

  it("stops when the target is the current page, ending any chain", () => {
    expect(guard).toContain("if (target === pathname) return;");
  });
});

describe("NavigationSection", () => {
  const section = read("src/components/settings/sections/NavigationSection.tsx");

  it("refuses to hide the last landing-capable item", () => {
    expect(section).toContain("canHideNavItem(item.href, hidden)");
    expect(section).toContain("disabled={locked}");
    expect(section).toContain("if (locked) return;");
  });

  it("explains why the checkbox is locked", () => {
    expect(section).toContain("{hideCheck.reason}");
  });
});
