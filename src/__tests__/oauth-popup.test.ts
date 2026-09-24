/**
 * Tests for the desktop Google sign-in popup poll.
 *
 * Audit H5: the poll treated any landing on /login as success, waited 3s
 * for a session that never came, then sent the opener to the marketing
 * homepage. The error banner only ever worked on the mobile redirect path.
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { classifyPopupUrl, UNKNOWN_CALLBACK_ERROR } from "@/lib/oauth-popup";

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const ORIGIN = "https://caltodo.me";

describe("classifyPopupUrl", () => {
  it("is pending while the popup is on another origin", () => {
    expect(classifyPopupUrl("https://accounts.google.com/o/oauth2/auth", ORIGIN)).toEqual({ kind: "pending" });
    expect(classifyPopupUrl("about:blank", ORIGIN)).toEqual({ kind: "pending" });
    expect(classifyPopupUrl("not a url", ORIGIN)).toEqual({ kind: "pending" });
  });

  it("is pending on our origin until the callback has redirected", () => {
    expect(classifyPopupUrl(`${ORIGIN}/auth/callback?code=abc`, ORIGIN)).toEqual({ kind: "pending" });
  });

  it("treats /login with the callback's error param as a failure", () => {
    expect(classifyPopupUrl(`${ORIGIN}/login?error=exchange_failed`, ORIGIN)).toEqual({
      kind: "error",
      reason: "exchange_failed",
    });
  });

  it("prefers Google's error_description when present", () => {
    expect(classifyPopupUrl(`${ORIGIN}/login?error=access_denied&error_description=User%20denied`, ORIGIN)).toEqual({
      kind: "error",
      reason: "User denied",
    });
  });

  it("treats a bare /login as a failure too, since only the callback's failure branch goes there", () => {
    expect(classifyPopupUrl(`${ORIGIN}/login`, ORIGIN)).toEqual({ kind: "error", reason: UNKNOWN_CALLBACK_ERROR });
  });

  it("sends new users to onboarding and everyone else through /", () => {
    expect(classifyPopupUrl(`${ORIGIN}/app/onboarding`, ORIGIN)).toEqual({
      kind: "success",
      destination: "/app/onboarding",
    });
    expect(classifyPopupUrl(`${ORIGIN}/app/inbox`, ORIGIN)).toEqual({ kind: "success", destination: "/" });
    expect(classifyPopupUrl(`${ORIGIN}/app/calendar`, ORIGIN)).toEqual({ kind: "success", destination: "/" });
  });
});

describe("useGoogleSignIn popup poll", () => {
  const hook = read("src/hooks/useGoogleSignIn.ts");

  it("decides through classifyPopupUrl rather than substring checks", () => {
    expect(hook).toContain("classifyPopupUrl(popup.location.href, window.location.origin)");
    expect(hook).not.toContain('popupUrl.includes("/login")');
  });

  it("on error closes the popup, shows the banner, and does not navigate", () => {
    const errorBranch = hook.slice(hook.indexOf('if (outcome.kind === "error") {'), hook.indexOf("const destination = outcome.destination"));
    expect(errorBranch).toContain("popup.close();");
    expect(errorBranch).toContain('trackAuthError("callback", mode, outcome.reason)');
    expect(errorBranch).toContain("setError(POPUP_ERROR_MESSAGE)");
    expect(errorBranch).not.toContain("window.location.href");
  });

  it("never navigates into the app without a session", () => {
    const timeoutBranch = hook.slice(hook.indexOf("if (Date.now() - start > SESSION_WAIT_MS) {"), hook.indexOf("}, 100);"));
    expect(timeoutBranch).not.toContain("window.location.href");
    expect(timeoutBranch).toContain("setError(POPUP_ERROR_MESSAGE)");
    expect(hook).not.toContain("Fall back: go anyway");
  });
});

describe("the auth callback's failure branch", () => {
  const route = read("src/app/auth/callback/route.ts");

  it("names the failure on the /login redirect so the poll and banner can see it", () => {
    expect(route).toContain('redirectTo.searchParams.set("error", reason)');
    expect(route).toContain('code ? "exchange_failed" : "missing_code"');
  });

  it("keeps Google's own error param when there is one", () => {
    expect(route).toContain("if (!providerError) redirectTo.searchParams.set");
  });

  it("logs the failure with its cause", () => {
    expect(route).toContain('logger.warn("auth/callback: sign-in failed, redirecting to /login"');
  });
});
