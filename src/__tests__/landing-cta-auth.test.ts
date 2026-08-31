/**
 * Guards the landing pages' signed-in call to action.
 *
 * The hero shipped with a `loggedIn` prop that the page never passed, so the
 * button read "Get started" even for a signed-in visitor who had arrived from
 * the app via the sidebar logo, and sent them to a signup form. The check is
 * now a shared hook, and these assert both callers use it rather than
 * reintroducing their own copy.
 *
 * Rendering hooks needs a DOM and this suite runs under node, so the
 * properties are read from the source, as with the hero counter tests.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");

const hook = read("src/hooks/useIsLoggedIn.ts");
const hero = read("src/components/landing/Hero.tsx");
const nav = read("src/components/landing/LandingNav.tsx");

describe("useIsLoggedIn", () => {
  it("defaults to signed out so the static markup is what renders first", () => {
    expect(hook).toContain("useState<boolean>(override ?? false)");
  });

  it("skips the lookup when the caller already knows", () => {
    expect(hook).toContain("if (override !== undefined) return;");
    expect(hook).toContain("return override ?? loggedIn;");
  });

  it("cancels on unmount rather than setting state afterwards", () => {
    expect(hook).toContain("let cancelled = false");
    expect(hook).toMatch(/if \(!cancelled\) setLoggedIn/);
    expect(hook).toMatch(/return \(\) => \{\s*cancelled = true;\s*\};/);
  });

  it("survives a failed session lookup", () => {
    // Offline or misconfigured must leave the signed-out state, not throw.
    expect(hook).toMatch(/\.catch\(\(\) => \{/);
  });

  it("reads the cached session instead of a network round trip", () => {
    expect(hook).toContain("auth.getSession()");
    expect(hook).not.toContain("auth.getUser()");
  });
});

describe("Hero call to action", () => {
  it("resolves the session itself", () => {
    expect(hero).toContain('import { useIsLoggedIn } from "@/hooks/useIsLoggedIn"');
    expect(hero).toContain("const loggedIn = useIsLoggedIn(loggedInProp);");
  });

  it("no longer depends on a prop the page does not pass", () => {
    // The landing page renders <Hero initialUserCount=... /> with no loggedIn,
    // which is exactly why the label was stuck on the signed-out branch.
    const page = read("src/app/(landing)/page.tsx");
    expect(page).toContain("<Hero");
    expect(page).not.toMatch(/<Hero[^>]*loggedIn/);
  });

  it("offers the app, not a signup form, to someone signed in", () => {
    expect(hero).toContain('href={loggedIn ? "/app/inbox" : "/login?signup=true"}');
    expect(hero).toContain('{loggedIn ? "Open app" : "Get started"}');
  });
});

describe("LandingNav", () => {
  it("uses the shared hook rather than its own session call", () => {
    expect(nav).toContain("const loggedIn = useIsLoggedIn(loggedInProp);");
    expect(nav).not.toContain("auth.getSession");
    expect(nav).not.toContain('from "@/lib/supabase/client"');
  });
});
