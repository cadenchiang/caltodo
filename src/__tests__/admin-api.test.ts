import { describe, it, expect } from "vitest";
import {
  bucketByDay,
  bucketByHour,
  toLocalDate,
  toLocalHour,
  computeRetentionMetrics,
  computeUserFrequency,
} from "@/lib/admin-metrics";

describe("toLocalDate", () => {
  it("should convert UTC timestamp to Pacific date", () => {
    // 2026-02-23T08:00:00Z = Feb 23 midnight PST = still Feb 23
    const result = toLocalDate("2026-02-23T08:00:00Z");
    expect(result).toBe("2026-02-23");
  });

  it("should shift late UTC times back a day for Pacific", () => {
    // 2026-02-24T03:00:00Z = Feb 23 7pm PST → should be Feb 23
    const result = toLocalDate("2026-02-24T03:00:00Z");
    expect(result).toBe("2026-02-23");
  });
});

describe("toLocalHour", () => {
  it("should convert UTC hour to Pacific hour", () => {
    // 2026-02-23T20:00:00Z = 12pm PST (UTC-8 in Feb)
    const result = toLocalHour("2026-02-23T20:00:00Z");
    expect(result).toBe(12);
  });
});

describe("bucketByDay", () => {
  it("should create buckets for the specified number of days", () => {
    const result = bucketByDay([], 7);
    expect(result).toHaveLength(7);
    for (const bucket of result) {
      expect(bucket.count).toBe(0);
    }
  });

  it("should count users in the correct day bucket using Pacific time", () => {
    // Use a midday Pacific time so there's no ambiguity
    const todayPacific = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Los_Angeles",
    });
    // 18:00 UTC = 10am PST — safely same day in both zones
    const users = [
      { created_at: `${todayPacific}T18:00:00Z` },
      { created_at: `${todayPacific}T19:00:00Z` },
    ];

    const result = bucketByDay(users, 7);
    const todayBucket = result.find((b) => b.date === todayPacific);
    expect(todayBucket).toBeDefined();
    expect(todayBucket!.count).toBe(2);
  });

  it("should return buckets sorted ascending by date", () => {
    const result = bucketByDay([], 7);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].date > result[i - 1].date).toBe(true);
    }
  });

  it("should exclude users older than the window", () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 60);
    const users = [{ created_at: oldDate.toISOString() }];

    const result = bucketByDay(users, 30);
    const total = result.reduce((sum, b) => sum + b.count, 0);
    expect(total).toBe(0);
  });
});

describe("bucketByHour", () => {
  it("should create 24 hourly buckets", () => {
    const result = bucketByHour([], "2026-02-23");
    expect(result).toHaveLength(24);
    for (const bucket of result) {
      expect(bucket.count).toBe(0);
    }
  });

  it("should count users in the correct Pacific hour", () => {
    // 2026-02-23T18:30:00Z = 10:30am PST, 2026-02-23T18:45:00Z = 10:45am PST
    // 2026-02-23T22:00:00Z = 2pm PST
    const users = [
      { created_at: "2026-02-23T18:30:00Z" },
      { created_at: "2026-02-23T18:45:00Z" },
      { created_at: "2026-02-23T22:00:00Z" },
    ];

    const result = bucketByHour(users, "2026-02-23");
    expect(result[10].count).toBe(2); // 10am PST
    expect(result[14].count).toBe(1); // 2pm PST
    expect(result[0].count).toBe(0);
  });

  it("should ignore users from other dates", () => {
    // These are midday UTC so they stay on their respective Pacific dates
    const users = [
      { created_at: "2026-02-22T20:00:00Z" },
      { created_at: "2026-02-24T20:00:00Z" },
    ];

    const result = bucketByHour(users, "2026-02-23");
    const total = result.reduce((sum, b) => sum + b.count, 0);
    expect(total).toBe(0);
  });
});

describe("computeRetentionMetrics", () => {
  it("should return zeros for empty logins", () => {
    const result = computeRetentionMetrics([]);
    expect(result).toEqual({ dau: 0, wau: 0, mau: 0, stickiness: 0 });
  });

  it("should count unique users per time window", () => {
    const now = new Date();
    const recentLogin = new Date(now);
    recentLogin.setMinutes(recentLogin.getMinutes() - 30);

    const logins = [
      { user_id: "user-1", created_at: recentLogin.toISOString() },
      { user_id: "user-1", created_at: recentLogin.toISOString() },
      { user_id: "user-2", created_at: recentLogin.toISOString() },
    ];

    const result = computeRetentionMetrics(logins);
    expect(result.dau).toBe(2); // 2 unique users
    expect(result.wau).toBe(2);
    expect(result.mau).toBe(2);
  });

  it("should compute stickiness as DAU/MAU percentage", () => {
    const now = new Date();
    const recent = new Date(now);
    recent.setMinutes(recent.getMinutes() - 30);

    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const logins = [
      { user_id: "user-1", created_at: recent.toISOString() },
      { user_id: "user-2", created_at: twoWeeksAgo.toISOString() },
    ];

    const result = computeRetentionMetrics(logins);
    expect(result.dau).toBe(1);
    expect(result.mau).toBe(2);
    expect(result.stickiness).toBe(50); // 1/2 * 100
  });
});

describe("computeUserFrequency", () => {
  it("should return empty array for no logins", () => {
    const result = computeUserFrequency([], new Map());
    expect(result).toEqual([]);
  });

  it("should aggregate login stats per user", () => {
    const userMap = new Map([
      ["user-1", "alice@example.com"],
      ["user-2", "bob@example.com"],
    ]);

    const logins = [
      { user_id: "user-1", created_at: "2026-02-23T10:00:00Z" },
      { user_id: "user-1", created_at: "2026-02-23T14:00:00Z" },
      { user_id: "user-1", created_at: "2026-02-22T10:00:00Z" },
      { user_id: "user-2", created_at: "2026-02-23T10:00:00Z" },
    ];

    const result = computeUserFrequency(logins, userMap);
    expect(result).toHaveLength(2);

    // user-1 should be first (3 logins)
    expect(result[0].email).toBe("alice@example.com");
    expect(result[0].totalLogins).toBe(3);
    expect(result[0].activeDays).toBe(2);

    // user-2 should be second (1 login)
    expect(result[1].email).toBe("bob@example.com");
    expect(result[1].totalLogins).toBe(1);
    expect(result[1].activeDays).toBe(1);
  });

  it("should respect the limit parameter", () => {
    const userMap = new Map<string, string>();
    const logins: Array<{ user_id: string; created_at: string }> = [];

    for (let i = 0; i < 10; i++) {
      const id = `user-${i}`;
      userMap.set(id, `user${i}@example.com`);
      logins.push({ user_id: id, created_at: "2026-02-23T10:00:00Z" });
    }

    const result = computeUserFrequency(logins, userMap, 3);
    expect(result).toHaveLength(3);
  });

  it("should use truncated user_id when email is missing from map", () => {
    const logins = [
      { user_id: "abcdefghij-1234", created_at: "2026-02-23T10:00:00Z" },
    ];

    const result = computeUserFrequency(logins, new Map());
    expect(result[0].email).toBe("abcdefgh...");
  });
});
