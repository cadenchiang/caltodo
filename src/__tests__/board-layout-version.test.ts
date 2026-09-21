/**
 * Tests for the board layout save version (M10).
 * The version is the server row's updated_at as of the last read; saves
 * carry it and the server refuses a stale one.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  getKnownLayoutVersion,
  setKnownLayoutVersion,
  isSameLayoutVersion,
  withLayoutVersion,
  splitLayoutVersion,
  BASE_UPDATED_AT_FIELD,
} from "@/lib/board-layout-version";

beforeEach(() => {
  setKnownLayoutVersion(null);
});

describe("known version", () => {
  it("starts unknown and remembers what it is told", () => {
    expect(getKnownLayoutVersion()).toBeNull();
    setKnownLayoutVersion("2026-09-21T10:00:00.000Z");
    expect(getKnownLayoutVersion()).toBe("2026-09-21T10:00:00.000Z");
  });
});

describe("isSameLayoutVersion", () => {
  it("matches the same instant in different spellings", () => {
    expect(isSameLayoutVersion("2026-09-21T10:00:00.000Z", "2026-09-21T10:00:00+00:00")).toBe(true);
  });

  it("distinguishes different instants", () => {
    expect(isSameLayoutVersion("2026-09-21T10:00:00.000Z", "2026-09-21T10:00:00.001Z")).toBe(false);
  });

  it("never matches a missing or unparseable version", () => {
    expect(isSameLayoutVersion(null, "2026-09-21T10:00:00.000Z")).toBe(false);
    expect(isSameLayoutVersion("2026-09-21T10:00:00.000Z", undefined)).toBe(false);
    expect(isSameLayoutVersion("nope", "2026-09-21T10:00:00.000Z")).toBe(false);
    expect(isSameLayoutVersion(null, null)).toBe(false);
  });
});

describe("withLayoutVersion / splitLayoutVersion", () => {
  it("attaches the known version to a save body", () => {
    setKnownLayoutVersion("v1");
    expect(withLayoutVersion({ widgets: [] })).toEqual({ widgets: [], [BASE_UPDATED_AT_FIELD]: "v1" });
  });

  it("attaches null before any read", () => {
    expect(withLayoutVersion({ widgets: [] })[BASE_UPDATED_AT_FIELD]).toBeNull();
  });

  it("does not mutate the layout it is given", () => {
    const data = { widgets: [] };
    withLayoutVersion(data);
    expect(data).toEqual({ widgets: [] });
  });

  it("strips the version from the body and hands it back separately", () => {
    const { layout, baseUpdatedAt } = splitLayoutVersion({ widgets: [], layouts: {}, baseUpdatedAt: "v1" });
    expect(layout).toEqual({ widgets: [], layouts: {} });
    expect(baseUpdatedAt).toBe("v1");
  });

  it("treats a missing or non-string version as none", () => {
    expect(splitLayoutVersion({ widgets: [] }).baseUpdatedAt).toBeNull();
    expect(splitLayoutVersion({ widgets: [], baseUpdatedAt: 42 }).baseUpdatedAt).toBeNull();
  });
});
