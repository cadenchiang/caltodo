import { describe, it, expect } from "vitest";

/**
 * Tests the has_completed_onboarding computation logic used in
 * GET /api/credentials to determine if a user has completed onboarding.
 *
 * A user is considered onboarded if they have at least one of:
 * - canvas_token
 * - gradescope_password_encrypted (exposed as has_gradescope_password)
 * - pensieve_calendar_url
 */

/** Pure function mirroring the computation in the credentials API. */
function computeHasCompletedOnboarding(data: {
  canvas_token?: string | null;
  gradescope_password_encrypted?: string | null;
  pensieve_calendar_url?: string | null;
}): boolean {
  return !!(
    data.canvas_token ||
    data.gradescope_password_encrypted ||
    data.pensieve_calendar_url
  );
}

describe("computeHasCompletedOnboarding", () => {
  it("returns false when no integrations are configured", () => {
    expect(computeHasCompletedOnboarding({})).toBe(false);
    expect(
      computeHasCompletedOnboarding({
        canvas_token: null,
        gradescope_password_encrypted: null,
        pensieve_calendar_url: null,
      })
    ).toBe(false);
  });

  it("returns true when only canvas_token is set", () => {
    expect(
      computeHasCompletedOnboarding({ canvas_token: "some-token" })
    ).toBe(true);
  });

  it("returns true when only gradescope_password_encrypted is set", () => {
    expect(
      computeHasCompletedOnboarding({
        gradescope_password_encrypted: "encrypted-pw",
      })
    ).toBe(true);
  });

  it("returns true when only pensieve_calendar_url is set", () => {
    expect(
      computeHasCompletedOnboarding({
        pensieve_calendar_url: "https://example.com/cal.ics",
      })
    ).toBe(true);
  });

  it("returns true when all integrations are configured", () => {
    expect(
      computeHasCompletedOnboarding({
        canvas_token: "tok",
        gradescope_password_encrypted: "enc",
        pensieve_calendar_url: "https://example.com/cal.ics",
      })
    ).toBe(true);
  });

  it("returns false for empty strings (falsy)", () => {
    expect(
      computeHasCompletedOnboarding({
        canvas_token: "",
        gradescope_password_encrypted: "",
        pensieve_calendar_url: "",
      })
    ).toBe(false);
  });

  it("returns true when only one of three is truthy", () => {
    expect(
      computeHasCompletedOnboarding({
        canvas_token: null,
        gradescope_password_encrypted: null,
        pensieve_calendar_url: "https://cal.ics",
      })
    ).toBe(true);
  });
});
