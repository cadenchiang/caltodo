/**
 * Tests for useMediaQuery and the settings page mounting one section tree.
 *
 * Audit M25: SettingsContent mounted every section twice (a mobile tree and
 * a desktop tree, one CSS-hidden), doubling fetches and racing two
 * GoogleCalendarSettings instances for one module-level sync slot.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { useMediaQuery, useIsMobile, MOBILE_MEDIA_QUERY } from "@/hooks/useMediaQuery";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

/** Renders the hook on the server and returns what it reported. */
function renderOnServer(hook: () => boolean): string {
  function Probe() {
    return createElement("span", null, String(hook()));
  }
  return renderToString(createElement(Probe));
}

describe("useMediaQuery", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports the server default when there is no window", () => {
    expect(renderOnServer(() => useMediaQuery("(max-width: 767px)", false))).toContain("false");
    expect(renderOnServer(() => useMediaQuery("(max-width: 767px)", true))).toContain("true");
  });

  it("defaults the mobile check to desktop on the server", () => {
    expect(renderOnServer(() => useIsMobile())).toContain("false");
  });

  it("uses Tailwind's md breakpoint for the mobile query", () => {
    expect(MOBILE_MEDIA_QUERY).toBe("(max-width: 767px)");
    expect(read("src/components/layout/MobileRouteGuard.tsx")).toContain(`"${MOBILE_MEDIA_QUERY}"`);
  });

  it("tolerates a window without matchMedia", () => {
    vi.stubGlobal("window", {});
    expect(renderOnServer(() => useMediaQuery("(max-width: 767px)", false))).toContain("false");
  });
});

describe("SettingsContent", () => {
  const content = read("src/app/app/settings/SettingsContent.tsx");

  it("chooses the layout with the media query hook", () => {
    expect(content).toContain('import { useIsMobile } from "@/hooks/useMediaQuery";');
    expect(content).toContain("const isMobile = useIsMobile();");
  });

  it("mounts exactly one section tree", () => {
    expect(content).toMatch(/\{isMobile && \(\s*<div className="md:hidden flex flex-col h-full">/);
    expect(content).toMatch(/\{!isMobile && \(\s*<div className="hidden md:flex flex-col h-full">/);
    expect(content.match(/<StickyMountedSections /g)?.length).toBe(2);
  });

  it("keeps the CSS breakpoints for the hydration frame", () => {
    expect(content).toContain('className="md:hidden flex flex-col h-full"');
    expect(content).toContain('className="hidden md:flex flex-col h-full"');
  });
});
