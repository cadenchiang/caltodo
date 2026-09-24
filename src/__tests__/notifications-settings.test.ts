/**
 * Tests for the Notifications settings section and the push-reminders cron
 * cadence fix (audit 2.9).
 *
 * Push, reminder rules and the email digest existed with no UI; the cron ran
 * daily while the route assumed every 15 minutes, so reminders were missed.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { SETTINGS_SECTIONS, SETTINGS_GROUPS } from "@/lib/settingsConfig";
import {
  HOURS,
  formatHour,
  localHourToUtc,
  utcHourToLocal,
  wrapHour,
} from "@/lib/notifications/digest-hour";
import {
  isDigestDue,
  isDueInScanWindow,
  REMINDER_WINDOW_BEFORE_MIN,
  SCAN_WINDOW_MIN,
} from "@/lib/notifications/cron-helpers";
import { buildRuleInput } from "@/components/settings/notifications/NewRuleForm";
import { pushDescription } from "@/components/settings/notifications/PushToggle";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

describe("settings config", () => {
  it("adds a Notifications section under General so no group has one item", () => {
    const ids = SETTINGS_SECTIONS.map((s) => s.id);
    expect(ids).toContain("notifications");
    for (const group of SETTINGS_GROUPS) {
      expect(SETTINGS_SECTIONS.filter((s) => s.group === group).length).toBeGreaterThan(1);
    }
  });

  it("is rendered by SettingsContent", () => {
    const src = read("app/app/settings/SettingsContent.tsx");
    expect(src).toContain('case "notifications":');
    expect(src).toContain("<NotificationsSection />");
  });
});

describe("digest hour conversions", () => {
  it("wraps into 0..23", () => {
    expect(wrapHour(-1)).toBe(23);
    expect(wrapHour(24)).toBe(0);
    expect(wrapHour(27)).toBe(3);
  });

  it("round-trips UTC and local for a western offset (PDT, +420)", () => {
    expect(utcHourToLocal(15, 420)).toBe(8);
    expect(localHourToUtc(8, 420)).toBe(15);
    for (const h of HOURS) expect(localHourToUtc(utcHourToLocal(h, 420), 420)).toBe(h);
  });

  it("round-trips for an eastern offset (-120)", () => {
    expect(utcHourToLocal(23, -120)).toBe(1);
    expect(localHourToUtc(1, -120)).toBe(23);
  });

  it("formats a 12-hour clock", () => {
    expect(formatHour(0)).toBe("12 AM");
    expect(formatHour(7)).toBe("7 AM");
    expect(formatHour(12)).toBe("12 PM");
    expect(formatHour(15)).toBe("3 PM");
  });
});

describe("push-reminders cron windows", () => {
  const now = new Date("2026-09-23T09:00:00.000Z");

  it("covers a full day per run instead of a 15-minute slice", () => {
    expect(SCAN_WINDOW_MIN).toBe(24 * 60);
    const inSixHours = new Date(now.getTime() + 6 * 60 * 60_000);
    expect(isDueInScanWindow(inSixHours, now, 60)).toBe(true);
    const inTwoDays = new Date(now.getTime() + 48 * 60 * 60_000);
    expect(isDueInScanWindow(inTwoDays, now, 60)).toBe(false);
  });

  it("keeps a small lookback for jitter and respects the lead time", () => {
    const justBefore = new Date(now.getTime() + 60 * 60_000 - (REMINDER_WINDOW_BEFORE_MIN - 1) * 60_000);
    expect(isDueInScanWindow(justBefore, now, 60)).toBe(true);
    const tooEarly = new Date(now.getTime() + 60 * 60_000 - (REMINDER_WINDOW_BEFORE_MIN + 1) * 60_000);
    expect(isDueInScanWindow(tooEarly, now, 60)).toBe(false);
  });

  it("sends the daily digest on the daily run whatever its time of day", () => {
    expect(isDigestDue(9 * 60, 8 * 60)).toBe(true);
    expect(isDigestDue(9 * 60, 20 * 60)).toBe(true);
    expect(isDigestDue(0, 23 * 60 + 59)).toBe(true);
  });

  it("the route uses the helpers and keeps vercel.json daily", () => {
    const route = read("app/api/cron/push-reminders/route.ts");
    expect(route).toContain("isDueInScanWindow(at, now, minutesBefore)");
    expect(route).toContain("isDigestDue(localMin, scheduledMin)");
    expect(route).not.toContain("DIGEST_WINDOW_MIN");
    expect(route).not.toContain("Runs every 15 minutes");
    expect(route).toContain("failed to record digest dispatch");
    const vercel = JSON.parse(read("../vercel.json")) as { crons: Array<{ path: string; schedule: string }> };
    const cron = vercel.crons.find((c) => c.path === "/api/cron/push-reminders");
    expect(cron?.schedule).toBe("0 9 * * *");
  });
});

describe("NewRuleForm.buildRuleInput", () => {
  it("sends only the field the kind needs", () => {
    expect(buildRuleInput("before_deadline", 60, "08:00", "America/Los_Angeles")).toEqual({
      kind: "before_deadline",
      minutes_before: 60,
      timezone: "America/Los_Angeles",
    });
    expect(buildRuleInput("daily_digest", 60, "08:00", "UTC")).toEqual({
      kind: "daily_digest",
      time_of_day: "08:00",
      timezone: "UTC",
    });
  });
});

describe("PushToggle", () => {
  it("describes every device state and says the browser will ask", () => {
    expect(pushDescription(null)).toMatch(/Checking/);
    expect(pushDescription("not-subscribed")).toMatch(/ask for permission/);
    expect(pushDescription("subscribed")).toMatch(/receives reminders/);
    expect(pushDescription("denied")).toMatch(/Blocked/);
    expect(pushDescription("unsupported")).toMatch(/does not support/);
    expect(pushDescription("no-sw")).toMatch(/installed app/);
  });

  it("only requests permission through subscribeToPush from the toggle", () => {
    const toggle = read("components/settings/notifications/PushToggle.tsx");
    expect(toggle).toContain("subscribeToPush(key)");
    expect(toggle).not.toContain("Notification.requestPermission");
    for (const rel of [
      "components/settings/sections/NotificationsSection.tsx",
      "components/settings/notifications/ReminderRules.tsx",
      "components/settings/notifications/EmailDigestSettings.tsx",
    ]) {
      expect(read(rel)).not.toContain("requestPermission");
    }
  });
});

describe("notification components", () => {
  const files = [
    "components/settings/sections/NotificationsSection.tsx",
    "components/settings/notifications/PushToggle.tsx",
    "components/settings/notifications/EmailDigestSettings.tsx",
    "components/settings/notifications/ReminderRules.tsx",
    "components/settings/notifications/NewRuleForm.tsx",
    "components/settings/notifications/SettingsSwitch.tsx",
  ];

  it("are each under 300 lines", () => {
    for (const rel of files) expect(read(rel).split("\n").length, rel).toBeLessThan(300);
  });

  it("use the existing routes and columns, with the error variant on failures", () => {
    const rules = read("components/settings/notifications/ReminderRules.tsx");
    expect(rules).toContain('"/api/notifications/rules"');
    expect(rules).toContain('method: "PATCH"');
    expect(rules).toContain('method: "DELETE"');
    const digest = read("components/settings/notifications/EmailDigestSettings.tsx");
    expect(digest).toContain('"/api/credentials"');
    expect(digest).toContain("email_digest_enabled");
    expect(digest).toContain("email_digest_hour");
    for (const rel of files) {
      const failures = read(rel).match(/showToast\([^;]*Failed[^;]*\);/g) ?? [];
      for (const call of failures) expect(call, rel).toContain('variant: "error"');
    }
  });

  it("shows an error state with retry when rules fail to load", () => {
    const rules = read("components/settings/notifications/ReminderRules.tsx");
    expect(rules).toContain('title="Reminders could not load"');
    expect(rules).toContain("onClick={() => mutate()}");
  });

  it("uses a real switch role and SectionHeading", () => {
    expect(read("components/settings/notifications/SettingsSwitch.tsx")).toContain('role="switch"');
    expect(read("components/settings/sections/NotificationsSection.tsx")).toContain('<SectionHeading');
  });
});
