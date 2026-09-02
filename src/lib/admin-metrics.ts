/**
 * Pure metric helpers behind the admin dashboard.
 *
 * They live here rather than in the route files because a Next.js route
 * module may export only route handlers and route config: anything else is a
 * type error the build has to be told to ignore. Keeping them in a library
 * also lets the unit tests import them without pulling a request handler,
 * its Supabase clients, and its rate limiter along with them.
 *
 * Every function is pure and timezone-explicit: the dashboard reads in
 * Pacific time regardless of where the server or the admin is.
 *
 * @module admin-metrics
 */

/** Timezone used for bucketing timestamps into local days/hours. */
const TZ = "America/Los_Angeles";

/**
 * Converts a UTC ISO timestamp to a local YYYY-MM-DD string in Pacific time.
 *
 * @param iso - UTC ISO timestamp (e.g. from Supabase created_at)
 * @returns Local date string like "2026-02-23"
 */
export function toLocalDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });
}

/**
 * Converts a UTC ISO timestamp to the local hour (0-23) in Pacific time.
 *
 * @param iso - UTC ISO timestamp
 * @returns Hour number 0-23 in Pacific time
 */
export function toLocalHour(iso: string): number {
  return parseInt(
    new Date(iso).toLocaleString("en-US", { timeZone: TZ, hour: "numeric", hour12: false }),
    10
  );
}

/**
 * Returns today's date as YYYY-MM-DD in Pacific time.
 *
 * @returns Local date string for today
 */
function todayLocal(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

/**
 * Buckets an array of user objects by day (YYYY-MM-DD) in Pacific time.
 *
 * @param users - Array of objects with a created_at ISO timestamp
 * @param days - Number of days to look back from today
 * @returns Array of { date, count } sorted ascending by date
 */
export function bucketByDay(
  users: Array<{ created_at: string }>,
  days: number
): Array<{ date: string; count: number }> {
  const today = todayLocal();
  const buckets = new Map<string, number>();

  // Initialize all days with 0, working backwards from today in local time
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today + "T12:00:00");
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-CA", { timeZone: TZ });
    buckets.set(key, 0);
  }

  const cutoffDate = new Date(today + "T00:00:00");
  cutoffDate.setDate(cutoffDate.getDate() - days);

  for (const user of users) {
    const created = new Date(user.created_at);
    if (created < cutoffDate) continue;
    const key = toLocalDate(user.created_at);
    if (buckets.has(key)) {
      buckets.set(key, buckets.get(key)! + 1);
    }
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

/**
 * Buckets an array of user objects into 24 hourly slots for a specific date
 * in Pacific time.
 *
 * @param users - Array of objects with a created_at ISO timestamp
 * @param targetDate - The date to drill into (YYYY-MM-DD in Pacific time)
 * @returns Array of { hour, count } for hours 0-23
 */
export function bucketByHour(
  users: Array<{ created_at: string }>,
  targetDate: string
): Array<{ hour: number; count: number }> {
  const buckets = new Array(24).fill(0) as number[];

  for (const user of users) {
    const localDay = toLocalDate(user.created_at);
    if (localDay !== targetDate) continue;
    const hour = toLocalHour(user.created_at);
    buckets[hour]++;
  }

  return buckets.map((count, hour) => ({ hour, count }));
}

/**
 * Computes DAU, WAU, MAU from an array of login entries.
 *
 * @param logins - Array of { user_id, created_at } login events
 * @returns Object with dau, wau, mau counts and stickiness ratio
 */
export function computeRetentionMetrics(
  logins: Array<{ user_id: string; created_at: string }>
): { dau: number; wau: number; mau: number; stickiness: number } {
  const now = new Date();
  const dayAgo = new Date(now);
  dayAgo.setDate(dayAgo.getDate() - 1);
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const dauSet = new Set<string>();
  const wauSet = new Set<string>();
  const mauSet = new Set<string>();

  for (const login of logins) {
    const ts = new Date(login.created_at);
    if (ts >= dayAgo) dauSet.add(login.user_id);
    if (ts >= weekAgo) wauSet.add(login.user_id);
    if (ts >= monthAgo) mauSet.add(login.user_id);
  }

  const dau = dauSet.size;
  const wau = wauSet.size;
  const mau = mauSet.size;
  const stickiness = mau > 0 ? Math.round((dau / mau) * 100) : 0;

  return { dau, wau, mau, stickiness };
}

/**
 * Computes per-user login frequency from login entries.
 *
 * @param logins - Array of { user_id, created_at } login events
 * @param userMap - Map of user_id to email for display
 * @param limit - Max number of users to return (default 50)
 * @returns Array of { email, totalLogins, activeDays, lastLogin } sorted by totalLogins desc
 */
export function computeUserFrequency(
  logins: Array<{ user_id: string; created_at: string }>,
  userMap: Map<string, string>,
  limit = 50
): Array<{
  email: string;
  totalLogins: number;
  activeDays: number;
  lastLogin: string;
}> {
  const userStats = new Map<
    string,
    { totalLogins: number; days: Set<string>; lastLogin: string }
  >();

  for (const login of logins) {
    const existing = userStats.get(login.user_id);
    const dayKey = login.created_at.slice(0, 10);

    if (existing) {
      existing.totalLogins++;
      existing.days.add(dayKey);
      if (login.created_at > existing.lastLogin) {
        existing.lastLogin = login.created_at;
      }
    } else {
      userStats.set(login.user_id, {
        totalLogins: 1,
        days: new Set([dayKey]),
        lastLogin: login.created_at,
      });
    }
  }

  return Array.from(userStats.entries())
    .map(([userId, stats]) => ({
      email: userMap.get(userId) ?? userId.slice(0, 8) + "...",
      totalLogins: stats.totalLogins,
      activeDays: stats.days.size,
      lastLogin: stats.lastLogin,
    }))
    .sort((a, b) => b.totalLogins - a.totalLogins)
    .slice(0, limit);
}
