/**
 * Tests the Google calendar selection behind the card's add control.
 *
 * `google_calendar_id` is one text column holding two shapes - a bare id for a
 * single calendar, a JSON array for several - and a reader that mishandles
 * either syncs the wrong calendar silently rather than failing, so the parsing
 * is pinned here. The rest covers the promise the control makes: that adding
 * a calendar is a thing this integration can actually do.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  DEFAULT_CALENDAR_ID,
  MAX_SELECTED_CALENDARS,
  parseCalendarIds,
  serialiseCalendarIds,
} from "@/lib/gcal-calendar-ids";
import { INTEGRATION_PROVIDERS } from "@/lib/integration-providers";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

describe("parseCalendarIds", () => {
  it("reads a bare id, the pre-multi-calendar shape", () => {
    expect(parseCalendarIds("me@example.com")).toEqual(["me@example.com"]);
  });

  it("reads a JSON array", () => {
    expect(parseCalendarIds('["a","b"]')).toEqual(["a", "b"]);
  });

  it("defaults when nothing is stored", () => {
    expect(parseCalendarIds(null)).toEqual([DEFAULT_CALENDAR_ID]);
    expect(parseCalendarIds("")).toEqual([DEFAULT_CALENDAR_ID]);
  });

  it("falls back rather than throwing on a malformed value", () => {
    // Syncing the primary calendar beats breaking the integration.
    expect(parseCalendarIds("[not json")).toEqual([DEFAULT_CALENDAR_ID]);
    expect(parseCalendarIds("[]")).toEqual([DEFAULT_CALENDAR_ID]);
  });

  it("drops entries that are not usable ids", () => {
    expect(parseCalendarIds('["a", 3, null, "  ", "b"]')).toEqual(["a", "b"]);
  });
});

describe("serialiseCalendarIds", () => {
  it("keeps a single selection as a bare id", () => {
    // So anything written before multi-calendar support can still read it.
    expect(serialiseCalendarIds(["a"])).toBe("a");
  });

  it("writes several as a JSON array", () => {
    expect(serialiseCalendarIds(["a", "b"])).toBe('["a","b"]');
  });

  it("round-trips both shapes", () => {
    for (const ids of [["a"], ["a", "b", "c"]]) {
      expect(parseCalendarIds(serialiseCalendarIds(ids))).toEqual(ids);
    }
  });

  it("never writes an empty selection", () => {
    expect(serialiseCalendarIds([])).toBe(DEFAULT_CALENDAR_ID);
    expect(serialiseCalendarIds(["  "])).toBe(DEFAULT_CALENDAR_ID);
  });

  it("caps at what the API accepts", () => {
    const many = Array.from({ length: 20 }, (_, i) => `cal-${i}`);
    expect(JSON.parse(serialiseCalendarIds(many))).toHaveLength(MAX_SELECTED_CALENDARS);
  });
});

describe("what Google Calendar's add control offers", () => {
  const list = read("src/components/settings/GoogleCalendarList.tsx");
  const card = read("src/components/settings/GoogleCalendarSettings.tsx");

  it("adds a calendar, not an account", () => {
    // A second Google account has nowhere to live: the tokens are singular
    // credential columns and gcal is not an accounts-table provider, so
    // re-running the OAuth flow would overwrite the account rather than add
    // beside it.
    expect(INTEGRATION_PROVIDERS as readonly string[]).not.toContain("gcal");
    expect(list).toContain("Add another calendar");
    expect(list).not.toContain("Add another account");
  });

  it("uses the same pill as the class chips", () => {
    expect(list).toContain("CLASS_PILL");
    expect(list).toContain('from "./AccountClasses"');
  });

  it("posts the selection to the endpoint that accepts a list", () => {
    expect(list).toContain('"/api/gcal/select-calendar"');
    expect(list).toContain("calendarIds: ids.slice(0, MAX_SELECTED_CALENDARS)");
  });

  it("refuses to leave nothing syncing", () => {
    expect(list).toContain("Keep at least one calendar.");
    expect(list).toContain("loaded!.selectedIds.length === 1");
  });

  it("hides the add control once the API's limit is reached", () => {
    expect(list).toContain("MAX_SELECTED_CALENDARS");
    expect(list).toContain("{!atLimit && (");
  });

  it("does not call Google just because the card was expanded", () => {
    // The list loads when the add control is used, not on expand.
    expect(list).toContain("if (loaded) {");
    expect(list).toContain("if (await load()) setPicking(true);");
  });

  it("refreshes the card's credentials after a change", () => {
    expect(list).toContain("onSaved()");
    expect(card).toContain("<GoogleCalendarList onSaved={refresh} />");
  });
});
