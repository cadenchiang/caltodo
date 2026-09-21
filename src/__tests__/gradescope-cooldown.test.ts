import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  claimGradescopeCooldown,
  releaseGradescopeCooldown,
  CLAIM_COLUMN,
  SUCCESS_COLUMN,
} from "@/lib/gradescope-cooldown";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const COOLDOWN_MS = 30 * 60 * 1000;
const USER = "user-1";

/** A PostgREST-shaped error, as supabase-js surfaces it. */
const DB_ERROR = {
  message: "column integration_credentials.last_gradescope_synced_at does not exist",
};

interface Behavior {
  /** Result of the claim_gradescope_sync RPC, or "throw" / "error". */
  rpc?: { data?: boolean; error?: { message: string }; throws?: boolean };
  /** Result of the conditional UPDATE ... .select(). */
  conditional?: { data?: unknown[]; error?: { message: string } };
  /** Result of the plain read used by the last-resort path. */
  read?: { data?: { gradescope_claim_at: string | null } | null; error?: { message: string } };
  /** Result of the plain write used by the last-resort path. */
  write?: { error?: { message: string } };
}

/** Records which mechanisms were exercised, for ordering assertions. */
interface Calls {
  rpc: number;
  conditional: number;
  read: number;
  write: number;
}

/**
 * Builds a Supabase client stub whose query builders resolve to the outcomes
 * described by `behavior`. The two `from()` chains are told apart by whether
 * `.select()` or `.update()` is reached first.
 */
function makeClient(behavior: Behavior): { client: SupabaseClient; calls: Calls } {
  const calls: Calls = { rpc: 0, conditional: 0, read: 0, write: 0 };

  const client = {
    rpc: () => {
      calls.rpc++;
      const r = behavior.rpc ?? { error: { message: "not deployed" } };
      const settled = r.throws
        ? Promise.reject(new Error("network down"))
        : Promise.resolve({ data: r.data ?? null, error: r.error ?? null });
      // supabase-js returns a thenable builder; the module attaches its own
      // rejection handler, so a bare promise is a faithful stand-in.
      return settled;
    },
    from: () => {
      const builder = {
        // --- read path -------------------------------------------------
        select: () => builder,
        maybeSingle: () => {
          calls.read++;
          const r = behavior.read ?? { data: null };
          return Promise.resolve({ data: r.data ?? null, error: r.error ?? null });
        },
        // --- write paths -----------------------------------------------
        update: () => {
          builder.isUpdate = true;
          return builder;
        },
        eq: () => builder,
        or: () => {
          builder.isConditional = true;
          return builder;
        },
        isUpdate: false,
        isConditional: false,
        // A conditional claim ends in .select("user_id"); the plain write does
        // not, so it is awaited directly.
        then: (resolve: (v: unknown) => void) => {
          calls.write++;
          const r = behavior.write ?? {};
          return Promise.resolve({ data: null, error: r.error ?? null }).then(resolve);
        },
      } as unknown as Record<string, unknown> & {
        isUpdate: boolean;
        isConditional: boolean;
      };

      // Distinguish the conditional claim (update → eq → or → select) from the
      // read (select → eq → maybeSingle) by rebinding select once update ran.
      const originalSelect = builder.select as () => unknown;
      builder.select = () => {
        if (builder.isUpdate) {
          calls.conditional++;
          const r = behavior.conditional ?? { error: { message: "conditional failed" } };
          return Promise.resolve({ data: r.data ?? null, error: r.error ?? null });
        }
        return originalSelect();
      };

      return builder;
    },
  } as unknown as SupabaseClient;

  return { client, calls };
}

describe("claimGradescopeCooldown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-27T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("RPC path", () => {
    it("claims the window when the function returns true", async () => {
      const { client, calls } = makeClient({ rpc: { data: true } });
      const result = await claimGradescopeCooldown(client, USER, COOLDOWN_MS);

      expect(result).toEqual({ claimed: true, degraded: false });
      expect(calls.rpc).toBe(1);
      expect(calls.conditional).toBe(0);
    });

    it("reports no claim, not an error, when the window is already held", async () => {
      const { client, calls } = makeClient({ rpc: { data: false } });
      const result = await claimGradescopeCooldown(client, USER, COOLDOWN_MS);

      expect(result).toEqual({ claimed: false, degraded: false });
      expect(calls.conditional).toBe(0);
    });

    it("does not fall through when the RPC answers", async () => {
      const { client, calls } = makeClient({ rpc: { data: false } });
      await claimGradescopeCooldown(client, USER, COOLDOWN_MS);

      expect(calls.read).toBe(0);
      expect(calls.write).toBe(0);
    });
  });

  describe("conditional-UPDATE fallback", () => {
    it("is used when the function is not deployed", async () => {
      const { client, calls } = makeClient({
        rpc: { error: { message: "function does not exist" } },
        conditional: { data: [{ user_id: USER }] },
      });
      const result = await claimGradescopeCooldown(client, USER, COOLDOWN_MS);

      expect(result).toEqual({ claimed: true, degraded: false });
      expect(calls.rpc).toBe(1);
      expect(calls.conditional).toBe(1);
    });

    it("treats an empty result as the window being held elsewhere", async () => {
      const { client } = makeClient({
        rpc: { error: { message: "function does not exist" } },
        conditional: { data: [] },
      });

      expect(await claimGradescopeCooldown(client, USER, COOLDOWN_MS)).toEqual({
        claimed: false,
        degraded: false,
      });
    });

    it("is reached when the RPC rejects outright", async () => {
      const { client, calls } = makeClient({
        rpc: { throws: true },
        conditional: { data: [{ user_id: USER }] },
      });

      expect((await claimGradescopeCooldown(client, USER, COOLDOWN_MS)).claimed).toBe(true);
      expect(calls.conditional).toBe(1);
    });

    it("is reached when the client has no .rpc at all", async () => {
      // An older supabase-js, or any client stub without the method: the
      // mechanism is unavailable, which must not read as a sync failure.
      const { client } = makeClient({ conditional: { data: [{ user_id: USER }] } });
      delete (client as unknown as Record<string, unknown>).rpc;

      expect(await claimGradescopeCooldown(client, USER, COOLDOWN_MS)).toEqual({
        claimed: true,
        degraded: false,
      });
    });
  });

  describe("last-resort read-then-write", () => {
    // This is the regression the whole module exists for: the exact production
    // error that took Gradescope sync down for every user for five days.
    const bothAtomicPathsBroken = {
      rpc: { error: { message: "function does not exist" } },
      conditional: { error: DB_ERROR },
    };

    it("keeps syncing when both atomic paths fail and the cooldown has elapsed", async () => {
      const { client, calls } = makeClient({
        ...bothAtomicPathsBroken,
        read: { data: { gradescope_claim_at: "2026-07-27T11:00:00.000Z" } },
      });
      const result = await claimGradescopeCooldown(client, USER, COOLDOWN_MS);

      expect(result).toEqual({ claimed: true, degraded: true });
      expect(calls.write).toBe(1);
    });

    it("still honors the cooldown, which is the part that protects the account", async () => {
      const { client, calls } = makeClient({
        ...bothAtomicPathsBroken,
        // 10 minutes ago: inside the 30-minute window.
        read: { data: { gradescope_claim_at: "2026-07-27T11:50:00.000Z" } },
      });
      const result = await claimGradescopeCooldown(client, USER, COOLDOWN_MS);

      expect(result).toEqual({ claimed: false, degraded: true });
      expect(calls.write).toBe(0);
    });

    it("claims when no sync has ever run", async () => {
      const { client } = makeClient({
        ...bothAtomicPathsBroken,
        read: { data: { gradescope_claim_at: null } },
      });

      expect(await claimGradescopeCooldown(client, USER, COOLDOWN_MS)).toEqual({
        claimed: true,
        degraded: true,
      });
    });

    it("claims when the credentials row has no stored timestamp at all", async () => {
      const { client } = makeClient({ ...bothAtomicPathsBroken, read: { data: null } });

      expect(await claimGradescopeCooldown(client, USER, COOLDOWN_MS)).toEqual({
        claimed: true,
        degraded: true,
      });
    });

    it("gives up only when even the plain read fails", async () => {
      const { client } = makeClient({ ...bothAtomicPathsBroken, read: { error: DB_ERROR } });
      const result = await claimGradescopeCooldown(client, USER, COOLDOWN_MS);

      expect(result.claimed).toBe(false);
      expect(result.error).toContain("does not exist");
    });

    it("does not log in when the timestamp write fails", async () => {
      const { client } = makeClient({
        ...bothAtomicPathsBroken,
        read: { data: { gradescope_claim_at: null } },
        write: { error: DB_ERROR },
      });
      const result = await claimGradescopeCooldown(client, USER, COOLDOWN_MS);

      // Never claim without recording the attempt: an unrecorded login would
      // let the next sync log in immediately and hammer Gradescope.
      expect(result.claimed).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  it("converts the cooldown to whole seconds for the RPC", async () => {
    const rpcSpy = vi.fn().mockResolvedValue({ data: true, error: null });
    const client = { rpc: rpcSpy } as unknown as SupabaseClient;

    await claimGradescopeCooldown(client, USER, COOLDOWN_MS);

    expect(rpcSpy).toHaveBeenCalledWith("claim_gradescope_sync", {
      p_user_id: USER,
      p_cooldown_seconds: 1800,
    });
  });
});

describe("claim and success columns", () => {
  // Audit H9 / M8: the claim used to advance last_gradescope_synced_at
  // before the login, so a failed login held the cooldown and the fleet
  // health check read attempts as successes.
  it("keeps the claim off the success column", () => {
    expect(CLAIM_COLUMN).toBe("gradescope_claim_at");
    expect(SUCCESS_COLUMN).toBe("last_gradescope_synced_at");
  });

  it("the conditional fallback writes and filters on the claim column only", async () => {
    const or = vi.fn();
    const builder = {
      update: vi.fn(),
      eq: vi.fn(),
      or,
      select: vi.fn().mockResolvedValue({ data: [{ user_id: USER }], error: null }),
    };
    builder.update.mockReturnValue(builder);
    builder.eq.mockReturnValue(builder);
    or.mockReturnValue(builder);
    const client = {
      rpc: vi.fn().mockResolvedValue({ data: null, error: { message: "not deployed" } }),
      from: () => builder,
    } as unknown as SupabaseClient;

    await claimGradescopeCooldown(client, USER, COOLDOWN_MS);

    expect(builder.update).toHaveBeenCalledWith({ gradescope_claim_at: expect.any(String) });
    expect(or.mock.calls[0][0]).toContain("gradescope_claim_at.is.null");
    expect(or.mock.calls[0][0]).not.toContain("last_gradescope_synced_at");
  });

  it("the last-resort path reads and writes the claim column", async () => {
    const { client } = makeClient({
      rpc: { error: { message: "not deployed" } },
      conditional: { error: DB_ERROR },
      read: { data: { gradescope_claim_at: null } },
    });
    const selectSpy = vi.fn();
    const updateSpy = vi.fn();
    const originalFrom = client.from.bind(client);
    (client as unknown as { from: () => unknown }).from = () => {
      const builder = originalFrom("integration_credentials") as unknown as Record<string, unknown>;
      const select = builder.select as (...args: unknown[]) => unknown;
      const update = builder.update as (...args: unknown[]) => unknown;
      builder.select = (...args: unknown[]) => {
        selectSpy(...args);
        return select(...args);
      };
      builder.update = (...args: unknown[]) => {
        updateSpy(...args);
        return update(...args);
      };
      return builder;
    };

    const result = await claimGradescopeCooldown(client, USER, COOLDOWN_MS);

    expect(result).toEqual({ claimed: true, degraded: true });
    expect(selectSpy).toHaveBeenCalledWith("gradescope_claim_at");
    expect(updateSpy).toHaveBeenLastCalledWith({ gradescope_claim_at: expect.any(String) });
  });
});

describe("releaseGradescopeCooldown", () => {
  it("clears the claim column for the user and reports success", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    const client = { from: vi.fn().mockReturnValue({ update }) } as unknown as SupabaseClient;

    expect(await releaseGradescopeCooldown(client, USER)).toBe(true);
    expect(update).toHaveBeenCalledWith({ gradescope_claim_at: null });
    expect(eq).toHaveBeenCalledWith("user_id", USER);
  });

  it("reports a failed release without throwing", async () => {
    const eq = vi.fn().mockResolvedValue({ error: DB_ERROR });
    const client = {
      from: vi.fn().mockReturnValue({ update: vi.fn().mockReturnValue({ eq }) }),
    } as unknown as SupabaseClient;

    expect(await releaseGradescopeCooldown(client, USER)).toBe(false);
  });
});
