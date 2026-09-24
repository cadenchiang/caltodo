/**
 * Tests for Google One Tap's mount guard and post-sign-in bootstrap.
 *
 * Audit L18: One Tap mounted with auto_select for visitors who already had
 * a session (on /?landing=1), and its sign-in skipped the callback's
 * deferred-invite processing entirely.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const oneTap = fs.readFileSync(path.join(ROOT, "src/components/auth/GoogleOneTap.tsx"), "utf8");

describe("GoogleOneTap", () => {
  it("checks for a session before loading the Google script", () => {
    const effect = oneTap.slice(oneTap.indexOf("initializedRef.current = true;"), oneTap.indexOf("return () => {"));
    expect(effect).toContain(".auth.getSession()");
    expect(effect).toContain("if (cancelled || session) return;");
    expect(effect.indexOf("getSession()")).toBeLessThan(effect.indexOf('document.createElement("script")'));
  });

  it("does not prompt when the session check fails", () => {
    expect(oneTap).toContain('console.warn("[GoogleOneTap] session check failed, not prompting"');
  });

  it("processes deferred invites after signing in, as the callback does", () => {
    const handler = oneTap.slice(oneTap.indexOf("if (data?.user) {"), oneTap.indexOf("[router]"));
    expect(handler).toContain('await fetch("/api/auth/process-deferred", { method: "POST" })');
    expect(handler.indexOf("process-deferred")).toBeLessThan(handler.indexOf("router.push("));
  });

  it("sends new users to onboarding without the unread welcome flag", () => {
    // Nothing ever read ?welcome=1; the onboarding page decides what to show
    // from the credentials row, so neither entry point sets it any more.
    expect(oneTap).toContain('router.push("/app/onboarding")');
    expect(oneTap).not.toContain("welcome=1");
    const callback = fs.readFileSync(path.join(ROOT, "src/app/auth/callback/route.ts"), "utf8");
    expect(callback).not.toContain('searchParams.set("welcome"');
  });

  it("cancels an in-flight load on unmount", () => {
    expect(oneTap).toMatch(/return \(\) => \{\s*cancelled = true;/);
  });
});
