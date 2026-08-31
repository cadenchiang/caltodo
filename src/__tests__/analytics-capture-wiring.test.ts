/**
 * Tests for PostHog capture wiring.
 *
 * Two defects made the marketing funnel invisible: `before_send` returned null
 * for every route outside /app, and <PostHogPageView> was only mounted in the
 * authenticated layout. Both are easy to reintroduce, and neither fails loudly.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const provider = read("src/components/PostHogProvider.tsx");
const rootLayout = read("src/app/layout.tsx");
const appLayout = read("src/app/app/layout.tsx");

describe("PostHog capture scope", () => {
  it("no longer drops events by route", () => {
    expect(provider).not.toContain("isAuthenticatedRoute");
  });

  it("tags every event with its surface instead", () => {
    expect(provider).toContain("currentSurface()");
    expect(provider).toMatch(/surface:\s*currentSurface\(\)/);
  });

  it("still drops benign exceptions, the one legitimate filter", () => {
    expect(provider).toMatch(
      /event\.event === "\$exception" && isIgnoredException\(event\.properties\)[\s\S]{0,40}return null;/
    );
  });

  it("keeps anonymous visitors from creating person profiles", () => {
    // This is what protects retention now that marketing events are captured.
    expect(provider).toContain('person_profiles: "identified_only"');
  });
});

/**
 * PostHog lazy-loads one bundle per optional feature. A trace of /app/inbox
 * showed surveys.js (100KB, 424ms) and dead-clicks-autocapture.js loading
 * while the task list was still waiting on its own data. Neither feature is
 * used, so both are off — but the flags are one-liners that a future SDK
 * upgrade or copy-paste could quietly drop.
 */
describe("PostHog optional bundles", () => {
  it("does not load the surveys bundle", () => {
    expect(provider).toMatch(/disable_surveys:\s*true/);
  });

  it("does not load the dead-clicks bundle", () => {
    expect(provider).toMatch(/capture_dead_clicks:\s*false/);
  });

  it("keeps exception autocapture, which before_send depends on", () => {
    expect(provider).not.toMatch(/capture_exceptions:\s*false/);
    expect(provider).not.toMatch(/disable_exception_autocapture:\s*true/);
  });

  it("keeps performance capture so web vitals stay observable", () => {
    expect(provider).not.toMatch(/capture_performance:\s*false/);
  });
});

describe("pageview mounting", () => {
  it("mounts the pageview tracker exactly once, app-wide", () => {
    const mounts = [rootLayout, appLayout]
      .flatMap((f) => f.match(/<PostHogPageView\s*\/>/g) ?? []);
    expect(mounts).toHaveLength(1);
  });

  it("mounts it at the root so marketing pages are covered", () => {
    expect(rootLayout).toContain("<PostHogPageView />");
    expect(appLayout).not.toContain("PostHogPageView");
  });

  it("mounts it inside the provider, or the hook has no client", () => {
    const open = rootLayout.indexOf("<PostHogProvider>");
    const mount = rootLayout.indexOf("<PostHogPageView />");
    const close = rootLayout.indexOf("</PostHogProvider>");
    expect(open).toBeGreaterThan(-1);
    expect(mount).toBeGreaterThan(open);
    expect(close).toBeGreaterThan(mount);
  });

  it("keeps identification in the authenticated layout, where the session is", () => {
    expect(appLayout).toContain("<PostHogIdentify");
  });
});
