import { describe, it, expect } from "vitest";

/**
 * Regex for validating a Pensieve calendar URL.
 * Must match: https://api.pensieve.co/api/calendar/<id>.ics
 */
const PENSIEVE_URL_REGEX = /^https:\/\/api\.pensieve\.co\/api\/calendar\/[^/]+\.ics$/;

describe("Pensieve URL validation", () => {
  it("accepts a valid Pensieve calendar URL", () => {
    expect(
      PENSIEVE_URL_REGEX.test(
        "https://api.pensieve.co/api/calendar/abc123def456.ics"
      )
    ).toBe(true);
  });

  it("accepts a URL with UUID-style id", () => {
    expect(
      PENSIEVE_URL_REGEX.test(
        "https://api.pensieve.co/api/calendar/550e8400-e29b-41d4-a716-446655440000.ics"
      )
    ).toBe(true);
  });

  it("rejects a URL missing .ics suffix", () => {
    expect(
      PENSIEVE_URL_REGEX.test(
        "https://api.pensieve.co/api/calendar/abc123def456"
      )
    ).toBe(false);
  });

  it("rejects a URL with wrong domain", () => {
    expect(
      PENSIEVE_URL_REGEX.test(
        "https://evil.com/api/calendar/abc123.ics"
      )
    ).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(PENSIEVE_URL_REGEX.test("")).toBe(false);
  });

  it("rejects a URL with trailing slash", () => {
    expect(
      PENSIEVE_URL_REGEX.test(
        "https://api.pensieve.co/api/calendar/abc123.ics/"
      )
    ).toBe(false);
  });

  it("rejects a URL with extra path segments", () => {
    expect(
      PENSIEVE_URL_REGEX.test(
        "https://api.pensieve.co/api/calendar/abc/extra.ics"
      )
    ).toBe(false);
  });
});
