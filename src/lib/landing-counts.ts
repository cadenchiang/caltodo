/**
 * Hourly-cached public counts shown on the marketing and login pages.
 * Both read through the admin client and return 0 on failure so a Supabase
 * blip never breaks a static page; callers hide the figure when it is 0.
 */
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Total user count for the "Trusted by N+" line.
 *
 * The admin listUsers() call is a server-to-server round-trip that used to
 * run on every landing request; caching it for an hour cuts that to one hit
 * per region per hour.
 *
 * @returns The user total, or 0 when the lookup fails
 */
export const getCachedUserCount = unstable_cache(
  async (): Promise<number> => {
    try {
      const admin = createAdminClient();
      const { data } = await admin.auth.admin.listUsers({ perPage: 1, page: 1 });
      return (data as { total?: number; users: unknown[] }).total ?? data.users.length;
    } catch (err) {
      console.error("[landing-counts] user count failed", err);
      return 0;
    }
  },
  ["landing-user-count"],
  { revalidate: 3600, tags: ["landing-user-count"] },
);

/**
 * Total assignments caltodo has synced, counted with head+exact so no rows
 * travel. The login panel and the hero eyebrow both show it.
 *
 * @returns The synced-assignment total, or 0 when the lookup fails
 */
export const getCachedAssignmentCount = unstable_cache(
  async (): Promise<number> => {
    try {
      const admin = createAdminClient();
      const { count } = await admin
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .not("source", "is", null)
        .is("dismissed_at", null);
      return count ?? 0;
    } catch (err) {
      console.error("[landing-counts] assignment count failed", err);
      return 0;
    }
  },
  ["landing-assignment-count"],
  { revalidate: 3600, tags: ["landing-assignment-count"] },
);
