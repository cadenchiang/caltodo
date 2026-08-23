/**
 * Tests for MCP tool argument coercion.
 * Clients vary in schema strictness, so these helpers must accept both the
 * typed form and the stringified form without ever throwing.
 */

import { describe, it, expect } from "vitest";
import { stringArg, numberArg, boolArg, stringArrayArg } from "@/lib/mcp/tool-args";

describe("stringArg", () => {
  it("returns a trimmed string", () => {
    expect(stringArg({ a: "  hi  " }, "a")).toBe("hi");
  });

  it("returns undefined for a missing, blank, or non-string value", () => {
    expect(stringArg({}, "a")).toBeUndefined();
    expect(stringArg({ a: "   " }, "a")).toBeUndefined();
    expect(stringArg({ a: 5 }, "a")).toBeUndefined();
    expect(stringArg({ a: null }, "a")).toBeUndefined();
  });
});

describe("numberArg", () => {
  it("returns a finite number", () => {
    expect(numberArg({ a: 7 }, "a")).toBe(7);
    expect(numberArg({ a: 0 }, "a")).toBe(0);
    expect(numberArg({ a: -2.5 }, "a")).toBe(-2.5);
  });

  it("parses a numeric string", () => {
    expect(numberArg({ a: "7" }, "a")).toBe(7);
  });

  it("returns undefined for a missing or unparseable value", () => {
    expect(numberArg({}, "a")).toBeUndefined();
    expect(numberArg({ a: "abc" }, "a")).toBeUndefined();
    expect(numberArg({ a: "" }, "a")).toBeUndefined();
    expect(numberArg({ a: Number.NaN }, "a")).toBeUndefined();
    expect(numberArg({ a: Number.POSITIVE_INFINITY }, "a")).toBeUndefined();
  });
});

describe("boolArg", () => {
  it("returns a boolean as-is", () => {
    expect(boolArg({ a: true }, "a")).toBe(true);
    expect(boolArg({ a: false }, "a")).toBe(false);
  });

  it("parses the strings 'true' and 'false'", () => {
    expect(boolArg({ a: "true" }, "a")).toBe(true);
    expect(boolArg({ a: "false" }, "a")).toBe(false);
  });

  it("returns undefined for anything else", () => {
    expect(boolArg({}, "a")).toBeUndefined();
    expect(boolArg({ a: "yes" }, "a")).toBeUndefined();
    expect(boolArg({ a: 1 }, "a")).toBeUndefined();
  });
});

describe("stringArrayArg", () => {
  it("trims and keeps non-empty array entries", () => {
    expect(stringArrayArg({ a: [" one ", "two", "  "] }, "a")).toEqual(["one", "two"]);
  });

  it("drops non-string array entries", () => {
    expect(stringArrayArg({ a: ["one", 2, null] }, "a")).toEqual(["one"]);
  });

  it("splits a comma-separated string", () => {
    expect(stringArrayArg({ a: "one, two ,three" }, "a")).toEqual(["one", "two", "three"]);
  });

  it("treats a single value as a one-item list", () => {
    expect(stringArrayArg({ a: "one" }, "a")).toEqual(["one"]);
  });

  it("returns undefined when absent or empty after filtering", () => {
    expect(stringArrayArg({}, "a")).toBeUndefined();
    expect(stringArrayArg({ a: [] }, "a")).toBeUndefined();
    expect(stringArrayArg({ a: ["  "] }, "a")).toBeUndefined();
    expect(stringArrayArg({ a: " , " }, "a")).toBeUndefined();
    expect(stringArrayArg({ a: 5 }, "a")).toBeUndefined();
  });
});
