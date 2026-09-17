/**
 * Tests the OAuth return-target helpers.
 *
 * The target arrives from a query string and a cookie, both attacker
 * controllable, so the property that matters is that nothing outside the
 * allowlist can ever shape the redirect.
 */

import { describe, it, expect } from "vitest";
import { parseReturnTarget, buildReturnPath, describeOAuthError } from "@/lib/gcal/oauth-return";

describe("parseReturnTarget", () => {
  it("accepts onboarding", () => {
    expect(parseReturnTarget("onboarding")).toBe("onboarding");
  });

  it("defaults everything else to settings", () => {
    for (const v of [null, undefined, "", "settings", "https://evil.example", "//evil.example", "../admin", "ONBOARDING"]) {
      expect(parseReturnTarget(v)).toBe("settings");
    }
  });
});

describe("buildReturnPath", () => {
  it("keeps the existing settings redirects byte-for-byte", () => {
    expect(buildReturnPath(undefined, "connected")).toBe("/app/settings?gcal=connected");
    expect(buildReturnPath(null, "error", "denied")).toBe("/app/settings?gcal=error&reason=denied");
  });

  it("returns to onboarding when asked", () => {
    expect(buildReturnPath("onboarding", "connected")).toBe("/app/onboarding?gcal=connected");
    expect(buildReturnPath("onboarding", "error", "csrf")).toBe("/app/onboarding?gcal=error&reason=csrf");
  });

  it("never emits an off-site path", () => {
    expect(buildReturnPath("https://evil.example", "connected")).toBe("/app/settings?gcal=connected");
  });

  it("omits the reason on success", () => {
    expect(buildReturnPath("onboarding", "connected", "ignored")).toBe("/app/onboarding?gcal=connected");
  });
});

describe("describeOAuthError", () => {
  it("explains a known reason", () => {
    expect(describeOAuthError("denied")).toBe("Google Calendar access was denied.");
  });

  it("falls back for unknown or missing reasons", () => {
    expect(describeOAuthError("nope")).toBe("Failed to connect Google Calendar.");
    expect(describeOAuthError(null)).toBe("Failed to connect Google Calendar.");
  });
});
