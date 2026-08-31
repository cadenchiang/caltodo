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
