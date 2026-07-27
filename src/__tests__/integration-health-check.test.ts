import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  checkIntegrationHealth,
  formatHealthAlert,
  SILENCE_THRESHOLD_HOURS,
  MIN_CONNECTED_USERS,
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
function makeClient(connected: number, lastSuccess: string | null): SupabaseClient {
  return {
    from: () => {
      const builder = {
        isCount: false,
        select: (_cols: string, opts?: { head?: boolean }) => {
          if (opts?.head) builder.isCount = true;
          return builder;
        },
        not: () => builder,
        order: () => builder,
        limit: () => builder,
        maybeSingle: () =>
          Promise.resolve({
            data: lastSuccess ? { last_gradescope_synced_at: lastSuccess } : null,
            error: null,
          }),
        then: (resolve: (v: unknown) => void) =>
          Promise.resolve({ count: connected, error: null }).then(resolve),
      };
      return builder;
    },
  } as unknown as SupabaseClient;
}

describe("checkIntegrationHealth", () => {
  it("is healthy when a sync succeeded recently", async () => {
    const [gradescope] = await checkIntegrationHealth(makeClient(200, hoursAgo(2)), NOW);

    expect(gradescope.source).toBe("gradescope");
    expect(gradescope.connected).toBe(200);
    expect(gradescope.hoursSinceSuccess).toBeCloseTo(2, 5);
    expect(gradescope.unhealthy).toBe(false);
  });

  it("flags the outage that went unnoticed for five days", async () => {
    // The real shape of the 2026-07-21 incident: plenty of connected users,
    // no successful sync anywhere since.
    const [gradescope] = await checkIntegrationHealth(makeClient(200, hoursAgo(120)), NOW);

    expect(gradescope.unhealthy).toBe(true);
    expect(gradescope.hoursSinceSuccess).toBeCloseTo(120, 5);
  });

  it("does not flag silence just under the threshold", async () => {
    const [gradescope] = await checkIntegrationHealth(
      makeClient(200, hoursAgo(SILENCE_THRESHOLD_HOURS - 0.5)),
      NOW,
    );

    expect(gradescope.unhealthy).toBe(false);
  });

  it("flags silence at exactly the threshold", async () => {
    const [gradescope] = await checkIntegrationHealth(
      makeClient(200, hoursAgo(SILENCE_THRESHOLD_HOURS)),
      NOW,
    );

    expect(gradescope.unhealthy).toBe(true);
  });

  it("stays quiet when too few users have connected to draw a conclusion", async () => {
    const [gradescope] = await checkIntegrationHealth(
      makeClient(MIN_CONNECTED_USERS - 1, hoursAgo(500)),
      NOW,
    );

    expect(gradescope.unhealthy).toBe(false);
  });

  it("treats never-succeeded as unhealthy once enough users have connected", async () => {
    const [gradescope] = await checkIntegrationHealth(makeClient(200, null), NOW);

    expect(gradescope.lastSuccessAt).toBeNull();
    expect(gradescope.hoursSinceSuccess).toBeNull();
    expect(gradescope.unhealthy).toBe(true);
  });

  it("stays quiet for an integration nobody has connected", async () => {
    const [gradescope] = await checkIntegrationHealth(makeClient(0, null), NOW);

    expect(gradescope.unhealthy).toBe(false);
  });
});

describe("formatHealthAlert", () => {
  it("names the integration, the population, and the silence", () => {
    const body = formatHealthAlert([
      {
        source: "gradescope",
        connected: 200,
        lastSuccessAt: "2026-07-21T20:40:30.104Z",
        hoursSinceSuccess: 135.3,
        unhealthy: true,
      },
    ]);

    expect(body).toContain("gradescope");
    expect(body).toContain("200 users connected");
    expect(body).toContain("135.3h");
    expect(body).toContain("2026-07-21T20:40:30.104Z");
  });

  it("reads sensibly for an integration that has never succeeded", () => {
    const body = formatHealthAlert([
      {
        source: "gradescope",
        connected: 42,
        lastSuccessAt: null,
        hoursSinceSuccess: null,
        unhealthy: true,
      },
    ]);

    expect(body).toContain("never succeeded");
  });
});
