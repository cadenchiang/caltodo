import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { claimGradescopeCooldown } from "@/lib/gradescope-cooldown";

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
  read?: { data?: { last_gradescope_synced_at: string | null } | null; error?: { message: string } };
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
        read: { data: { last_gradescope_synced_at: "2026-07-27T11:00:00.000Z" } },
      });
      const result = await claimGradescopeCooldown(client, USER, COOLDOWN_MS);

      expect(result).toEqual({ claimed: true, degraded: true });
      expect(calls.write).toBe(1);
    });

    it("still honors the cooldown, which is the part that protects the account", async () => {
      const { client, calls } = makeClient({
        ...bothAtomicPathsBroken,
        // 10 minutes ago: inside the 30-minute window.
        read: { data: { last_gradescope_synced_at: "2026-07-27T11:50:00.000Z" } },
      });
      const result = await claimGradescopeCooldown(client, USER, COOLDOWN_MS);

      expect(result).toEqual({ claimed: false, degraded: true });
      expect(calls.write).toBe(0);
    });

    it("claims when no sync has ever run", async () => {
      const { client } = makeClient({
        ...bothAtomicPathsBroken,
        read: { data: { last_gradescope_synced_at: null } },
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
        read: { data: { last_gradescope_synced_at: null } },
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
