/**
 * Tests for sign-in/sign-up funnel tracking.
 *
 * These three events were declared in the analytics union and fired from
 * nowhere for the life of the project, which left the largest drop in the
 * product — landing to account — completely unmeasured. The wiring block at
 * the bottom is what keeps them from silently going dead again: a dangling
 * union member fails no build and no test on its own.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fs from "fs";
import * as path from "path";

const tracked: Array<{ name: string; props?: Record<string, unknown> }> = [];
vi.mock("@/lib/analytics", () => ({
  trackEvent: (name: string, props?: Record<string, unknown>) => {
    tracked.push({ name, props });
  },
}));

import {
  authModeForParams,
  trackAuthSubmitted,
  trackAuthError,
} from "@/lib/auth-analytics";

beforeEach(() => {
  tracked.length = 0;
});

describe("authModeForParams", () => {
  it("reads sign-up from the exact flag /login uses", () => {
    expect(authModeForParams(new URLSearchParams("signup=true"))).toBe("sign_up");
  });

  it("treats a bare /login as sign-in", () => {
    expect(authModeForParams(new URLSearchParams(""))).toBe("sign_in");
  });

  it("does not treat other truthy-looking values as sign-up", () => {
    // LoginForm compares against the literal "true"; the event must agree, or
    // the funnel would split people away from the screen they actually saw.
    for (const q of ["signup=TRUE", "signup=1", "signup=yes", "signup="]) {
      expect(authModeForParams(new URLSearchParams(q))).toBe("sign_in");
    }
  });

  it("survives the null useSearchParams() returns during static rendering", () => {
    expect(authModeForParams(null)).toBe("sign_in");
  });

  it("ignores unrelated parameters", () => {
    expect(authModeForParams(new URLSearchParams("error=access_denied&next=/app"))).toBe("sign_in");
    expect(authModeForParams(new URLSearchParams("signup=true&error=x"))).toBe("sign_up");
  });
});

describe("trackAuthSubmitted", () => {
  it("emits sign_up_submitted for the sign-up side", () => {
    trackAuthSubmitted("sign_up", "google");
    expect(tracked).toEqual([
      { name: "sign_up_submitted", props: { provider: "google" } },
    ]);
  });

  it("emits sign_in_submitted for the sign-in side", () => {
    trackAuthSubmitted("sign_in", "google");
    expect(tracked).toEqual([
      { name: "sign_in_submitted", props: { provider: "google" } },
    ]);
  });

  it("records the provider so a second one would not split the step", () => {
    trackAuthSubmitted("sign_in", "apple");
    expect(tracked[0].props).toEqual({ provider: "apple" });
  });
});

describe("trackAuthError", () => {
  it("records stage, mode and reason on one event name", () => {
    trackAuthError("oauth_start", "sign_up", "popup_closed_by_user");
    expect(tracked).toEqual([
      {
        name: "auth_error",
        props: {
          stage: "oauth_start",
          mode: "sign_up",
          message: "popup_closed_by_user",
        },
      },
    ]);
  });

  it("distinguishes a bounce-back from a handoff that never started", () => {
    trackAuthError("callback", "sign_in", "access_denied");
    expect(tracked[0].props).toMatchObject({ stage: "callback", mode: "sign_in" });
  });

  it("truncates an error body instead of emitting an unbounded property", () => {
    trackAuthError("oauth_start", "sign_in", "x".repeat(5000));
    const message = tracked[0].props?.message as string;
    expect(message).toHaveLength(200);
  });

  it("keeps the property present for an empty message", () => {
    // A constant event shape matters more than omitting a blank field.
    trackAuthError("callback", "sign_in", "");
    expect(tracked[0].props).toHaveProperty("message", "");
  });
});

describe("wiring", () => {
  const ROOT = path.resolve(__dirname, "../..");
  const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");
  const analytics = read("src/lib/analytics.ts");
  const hook = read("src/hooks/useGoogleSignIn.ts");
  const form = read("src/components/auth/LoginForm.tsx");

  it("keeps all three event names registered for type-checking", () => {
    expect(analytics).toContain('| "sign_in_submitted"');
    expect(analytics).toContain('| "sign_up_submitted"');
    expect(analytics).toContain('| "auth_error"');
  });

  it("emits the funnel step from the one place OAuth actually starts", () => {
    expect(hook).toContain('trackAuthSubmitted(mode, "google")');
  });

  it("emits it before the provider call, so a thrown handoff still counts", () => {
    const submitted = hook.indexOf("trackAuthSubmitted");
    const call = hook.indexOf("signInWithOAuth");
    expect(submitted).toBeGreaterThan(-1);
    expect(submitted).toBeLessThan(call);
  });

  it("reports a failure on both the desktop popup and mobile redirect paths", () => {
    // Two separate oauthError branches; missing either one under-reports.
    const errors = hook.match(/trackAuthError\("oauth_start", mode,/g) ?? [];
    expect(errors).toHaveLength(2);
  });

  it("reports the ?error= bounce-back from Google", () => {
    expect(form).toContain('trackAuthError("callback", mode, errorParam)');
  });

  it("derives the sign-up heading from the same mode it reports", () => {
    // Guards against the heading and the event drifting apart.
    expect(form).toContain("const mode = authModeForParams(searchParams)");
    expect(form).toContain('const isSignup = mode === "sign_up"');
    expect(form).toContain("useGoogleSignIn(mode)");
  });
});
