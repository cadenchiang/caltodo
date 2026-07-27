import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  checkIntegrationHealth,
  formatHealthAlert,
  SILENCE_THRESHOLD_HOURS,
  MIN_ACTIVE_USERS,
} from "@/lib/integration-health-check";

const NOW = new Date("2026-07-27T12:00:00.000Z");

/** Hours before NOW, as an ISO string. */
function hoursAgo(h: number): string {
  return new Date(NOW.getTime() - h * 60 * 60 * 1000).toISOString();
}

/**
 * Stubs the two queries checkIntegrationHealth makes: a head count of
 * connected users and a top-1 ordered read of the success timestamp.
 */
function makeClient(
  connected: number,
  active: number,
  lastSuccess: string | null,
): SupabaseClient {
  return {
    from: () => {
      // countActive is the only query that adds .gte("last_synced_at", ...),
      // which is how the two head-counts are told apart.
      const builder = {
        isActiveQuery: false,
        select: () => builder,
        not: () => builder,
        gte: () => {
          builder.isActiveQuery = true;
          return builder;
        },
        order: () => builder,
        limit: () => builder,
        maybeSingle: () =>
          Promise.resolve({
            data: lastSuccess ? { last_gradescope_synced_at: lastSuccess } : null,
            error: null,
          }),
        then: (resolve: (v: unknown) => void) =>
          Promise.resolve({
            count: builder.isActiveQuery ? active : connected,
            error: null,
          }).then(resolve),
      };
      return builder;
    },
  } as unknown as SupabaseClient;
}

describe("checkIntegrationHealth", () => {
  it("is healthy when a sync succeeded recently", async () => {
    const [gradescope] = await checkIntegrationHealth(makeClient(200, 40, hoursAgo(2)), NOW);

    expect(gradescope.source).toBe("gradescope");
    expect(gradescope.connected).toBe(200);
    expect(gradescope.active).toBe(40);
    expect(gradescope.hoursSinceSuccess).toBeCloseTo(2, 5);
    expect(gradescope.unhealthy).toBe(false);
  });

  it("flags the outage that went unnoticed for five days", async () => {
    // The 2026-07-21 incident during term: users actively syncing, not one
    // Gradescope success among them.
    const [gradescope] = await checkIntegrationHealth(makeClient(200, 40, hoursAgo(120)), NOW);

    expect(gradescope.unhealthy).toBe(true);
    expect(gradescope.hoursSinceSuccess).toBeCloseTo(120, 5);
  });

  it("does not flag silence just under the threshold", async () => {
    const [gradescope] = await checkIntegrationHealth(
      makeClient(200, 40, hoursAgo(SILENCE_THRESHOLD_HOURS - 0.5)),
      NOW,
    );

    expect(gradescope.unhealthy).toBe(false);
  });

  it("flags silence at exactly the threshold", async () => {
    const [gradescope] = await checkIntegrationHealth(
      makeClient(200, 40, hoursAgo(SILENCE_THRESHOLD_HOURS)),
      NOW,
    );

    expect(gradescope.unhealthy).toBe(true);
  });

  it("stays quiet over summer, when hundreds are connected but nobody syncs", async () => {
    // Measured on prod 2026-07-27: 224 connected, 2 active all day. Gating on
    // connected users would have mailed a false alarm every morning.
    const [gradescope] = await checkIntegrationHealth(makeClient(224, 2, hoursAgo(141)), NOW);

    expect(gradescope.unhealthy).toBe(false);
  });

  it("fires as soon as enough users actually try", async () => {
    const [gradescope] = await checkIntegrationHealth(
      makeClient(224, MIN_ACTIVE_USERS, hoursAgo(141)),
      NOW,
    );

    expect(gradescope.unhealthy).toBe(true);
  });

  it("treats never-succeeded as unhealthy once users are actively syncing", async () => {
    const [gradescope] = await checkIntegrationHealth(makeClient(200, 40, null), NOW);

    expect(gradescope.lastSuccessAt).toBeNull();
    expect(gradescope.hoursSinceSuccess).toBeNull();
    expect(gradescope.unhealthy).toBe(true);
  });

  it("stays quiet for an integration nobody has connected", async () => {
    const [gradescope] = await checkIntegrationHealth(makeClient(0, 0, null), NOW);

    expect(gradescope.unhealthy).toBe(false);
  });
});

describe("formatHealthAlert", () => {
  it("names the integration, how many tried, and the silence", () => {
    const body = formatHealthAlert([
      {
        source: "gradescope",
        connected: 200,
        active: 12,
        lastSuccessAt: "2026-07-21T20:40:30.104Z",
        hoursSinceSuccess: 135.3,
        unhealthy: true,
      },
    ]);

    expect(body).toContain("gradescope");
    expect(body).toContain("12 of 200 connected users ran a sync");
    expect(body).toContain("135.3h");
    expect(body).toContain("2026-07-21T20:40:30.104Z");
  });

  it("reads sensibly for an integration that has never succeeded", () => {
    const body = formatHealthAlert([
      {
        source: "gradescope",
        connected: 42,
        active: 5,
        lastSuccessAt: null,
        hoursSinceSuccess: null,
        unhealthy: true,
      },
    ]);

    expect(body).toContain("never succeeded");
  });
});
