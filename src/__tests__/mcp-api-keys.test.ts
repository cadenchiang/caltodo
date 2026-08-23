/**
 * Tests for MCP API key generation, hashing, storage and lookup.
 * Mocks the Supabase query builder to assert user scoping and that no
 * plaintext or hash ever reaches the browser-facing record.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import {
  generateApiKey,
  hashApiKey,
  keyDisplayPrefix,
  createApiKey,
  listApiKeys,
  revokeApiKey,
  findKeyOwner,
  touchApiKey,
  KEY_PREFIX,
} from "@/lib/mcp/api-keys";
import type { SupabaseClient } from "@supabase/supabase-js";

const USER_ID = "user-abc-123";

describe("generateApiKey", () => {
  it("uses the caltodo prefix followed by 64 hex characters", () => {
    const key = generateApiKey();
    expect(key.startsWith(KEY_PREFIX)).toBe(true);
    expect(key.slice(KEY_PREFIX.length)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("never repeats a key", () => {
    const keys = new Set(Array.from({ length: 200 }, () => generateApiKey()));
    expect(keys.size).toBe(200);
  });
});

describe("hashApiKey", () => {
  it("produces a stable hex SHA-256 digest", () => {
    const hash = hashApiKey("sk-caltodo-abc");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hashApiKey("sk-caltodo-abc")).toBe(hash);
  });

  it("produces different digests for different keys", () => {
    expect(hashApiKey("a")).not.toBe(hashApiKey("b"));
  });

  it("does not contain the plaintext", () => {
    const key = generateApiKey();
    expect(hashApiKey(key)).not.toContain(key.slice(KEY_PREFIX.length));
  });
});

describe("keyDisplayPrefix", () => {
  it("keeps the prefix plus eight characters", () => {
    const key = `${KEY_PREFIX}0123456789abcdef`;
    expect(keyDisplayPrefix(key)).toBe(`${KEY_PREFIX}01234567`);
  });

  it("reveals only a small fraction of a real key", () => {
    const key = generateApiKey();
    expect(keyDisplayPrefix(key).length).toBeLessThan(key.length / 2);
  });
});

/** Records builder calls so assertions can inspect the composed statement. */
interface Spy {
  calls: Array<{ method: string; args: unknown[] }>;
  client: SupabaseClient;
}

/**
 * Builds a chainable Supabase mock.
 *
 * @param terminals - Results for the terminal methods the code awaits
 */
function makeClient(terminals: {
  single?: { data: unknown; error: unknown };
  maybeSingle?: { data: unknown; error: unknown };
  select?: { data: unknown; error: unknown };
  order?: { data: unknown; error: unknown };
  update?: { error: unknown };
}): Spy {
  const calls: Array<{ method: string; args: unknown[] }> = [];
  const builder: Record<string, unknown> = {};

  const chain = (method: string) =>
    function (this: unknown, ...args: unknown[]) {
      calls.push({ method, args });
      return this;
    };

  for (const m of ["insert", "eq", "delete"]) builder[m] = chain(m);

  // select() is both chainable and (after delete) awaitable.
  builder.select = function (this: unknown, ...args: unknown[]) {
    calls.push({ method: "select", args });
    const result = terminals.select;
    if (!result) return this;
    return Object.assign(Object.create(builder as object), {
      then: (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve),
    });
  };

  builder.single = () => {
    calls.push({ method: "single", args: [] });
    return Promise.resolve(terminals.single ?? { data: null, error: null });
  };
  builder.maybeSingle = () => {
    calls.push({ method: "maybeSingle", args: [] });
    return Promise.resolve(terminals.maybeSingle ?? { data: null, error: null });
  };
  builder.order = (...args: unknown[]) => {
    calls.push({ method: "order", args });
    return Promise.resolve(terminals.order ?? { data: [], error: null });
  };
  builder.update = function (this: unknown, ...args: unknown[]) {
    calls.push({ method: "update", args });
    return Object.assign(Object.create(builder as object), {
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve(terminals.update ?? { error: null }).then(resolve),
    });
  };

  const client = {
    from: (...args: unknown[]) => {
      calls.push({ method: "from", args });
      return builder;
    },
  } as unknown as SupabaseClient;

  return { calls, client };
}

/** Every call to a builder method. */
function allCalls(spy: Spy, method: string): unknown[][] {
  return spy.calls.filter((c) => c.method === method).map((c) => c.args);
}

const ROW = {
  id: "key-1",
  label: "Poke",
  key_prefix: "sk-caltodo-01234567",
  created_at: "2026-08-22T00:00:00Z",
  last_used_at: null,
};

describe("createApiKey", () => {
  beforeEach(() => vi.clearAllMocks());

  it("stores the hash, not the plaintext, and returns the key once", async () => {
    const spy = makeClient({ single: { data: ROW, error: null } });
    const { key, record } = await createApiKey(spy.client, USER_ID);

    const insert = allCalls(spy, "insert")[0][0] as Record<string, unknown>;
    expect(insert.user_id).toBe(USER_ID);
    expect(insert.key_hash).toBe(hashApiKey(key));
    expect(JSON.stringify(insert)).not.toContain(key);

    expect(key.startsWith(KEY_PREFIX)).toBe(true);
    expect(record).toEqual({
      id: "key-1",
      label: "Poke",
      keyPrefix: "sk-caltodo-01234567",
      createdAt: "2026-08-22T00:00:00Z",
      lastUsedAt: null,
    });
  });

  it("defaults the label to Poke and trims a supplied one", async () => {
    const withDefault = makeClient({ single: { data: ROW, error: null } });
    await createApiKey(withDefault.client, USER_ID);
    expect((allCalls(withDefault, "insert")[0][0] as Record<string, unknown>).label).toBe("Poke");

    const withLabel = makeClient({ single: { data: ROW, error: null } });
    await createApiKey(withLabel.client, USER_ID, "  Claude  ");
    expect((allCalls(withLabel, "insert")[0][0] as Record<string, unknown>).label).toBe("Claude");

    const withBlank = makeClient({ single: { data: ROW, error: null } });
    await createApiKey(withBlank.client, USER_ID, "   ");
    expect((allCalls(withBlank, "insert")[0][0] as Record<string, unknown>).label).toBe("Poke");
  });

  it("rejects an over-long label before writing", async () => {
    const spy = makeClient({});
    await expect(createApiKey(spy.client, USER_ID, "x".repeat(61))).rejects.toThrow(/too long/);
    expect(allCalls(spy, "insert")).toHaveLength(0);
  });

  it("throws with the Supabase message when the insert fails", async () => {
    const spy = makeClient({ single: { data: null, error: { message: "unique violation" } } });
    await expect(createApiKey(spy.client, USER_ID)).rejects.toThrow(/unique violation/);
  });
});

describe("listApiKeys", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns metadata scoped to the user, newest first", async () => {
    const spy = makeClient({ order: { data: [ROW], error: null } });
    const keys = await listApiKeys(spy.client, USER_ID);

    expect(allCalls(spy, "eq")).toContainEqual(["user_id", USER_ID]);
    expect(allCalls(spy, "order")).toEqual([["created_at", { ascending: false }]]);
    expect(keys).toEqual([
      {
        id: "key-1",
        label: "Poke",
        keyPrefix: "sk-caltodo-01234567",
        createdAt: "2026-08-22T00:00:00Z",
        lastUsedAt: null,
      },
    ]);
  });

  it("never selects the key hash", async () => {
    const spy = makeClient({ order: { data: [], error: null } });
    await listApiKeys(spy.client, USER_ID);
    expect(String(allCalls(spy, "select")[0][0])).not.toContain("key_hash");
  });

  it("returns an empty array when the user has no keys", async () => {
    const spy = makeClient({ order: { data: null, error: null } });
    await expect(listApiKeys(spy.client, USER_ID)).resolves.toEqual([]);
  });

  it("throws when the query fails", async () => {
    const spy = makeClient({ order: { data: null, error: { message: "timeout" } } });
    await expect(listApiKeys(spy.client, USER_ID)).rejects.toThrow(/timeout/);
  });
});

describe("revokeApiKey", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes the key scoped by both user and key id", async () => {
    const spy = makeClient({ select: { data: [{ id: "key-1" }], error: null } });
    await revokeApiKey(spy.client, USER_ID, "key-1");

    expect(allCalls(spy, "eq")).toContainEqual(["user_id", USER_ID]);
    expect(allCalls(spy, "eq")).toContainEqual(["id", "key-1"]);
  });

  it("reports a key that is not the caller's as nonexistent", async () => {
    const spy = makeClient({ select: { data: [], error: null } });
    await expect(revokeApiKey(spy.client, USER_ID, "someone-elses")).rejects.toThrow(
      /does not exist/
    );
  });

  it("throws when the delete fails", async () => {
    const spy = makeClient({ select: { data: null, error: { message: "denied" } } });
    await expect(revokeApiKey(spy.client, USER_ID, "key-1")).rejects.toThrow(/denied/);
  });
});

describe("findKeyOwner", () => {
  beforeEach(() => vi.clearAllMocks());

  it("looks up by hash, never by plaintext, and returns the owner", async () => {
    const spy = makeClient({ maybeSingle: { data: { id: "key-1", user_id: USER_ID }, error: null } });
    const key = generateApiKey();

    await expect(findKeyOwner(spy.client, key)).resolves.toEqual({
      userId: USER_ID,
      keyId: "key-1",
    });

    const eqArgs = allCalls(spy, "eq")[0];
    expect(eqArgs[0]).toBe("key_hash");
    expect(eqArgs[1]).toBe(hashApiKey(key));
    expect(eqArgs[1]).not.toBe(key);
  });

  it("returns null when no key matches", async () => {
    const spy = makeClient({ maybeSingle: { data: null, error: null } });
    await expect(findKeyOwner(spy.client, "sk-caltodo-nope")).resolves.toBeNull();
  });

  it("returns null rather than throwing when the read fails, denying access", async () => {
    const spy = makeClient({ maybeSingle: { data: null, error: { message: "timeout" } } });
    await expect(findKeyOwner(spy.client, "sk-caltodo-any")).resolves.toBeNull();
  });
});

describe("touchApiKey", () => {
  beforeEach(() => vi.clearAllMocks());

  it("stamps last_used_at for the key", async () => {
    const spy = makeClient({ update: { error: null } });
    await touchApiKey(spy.client, "key-1");

    const patch = allCalls(spy, "update")[0][0] as Record<string, unknown>;
    expect(typeof patch.last_used_at).toBe("string");
    expect(allCalls(spy, "eq")).toContainEqual(["id", "key-1"]);
  });

  it("swallows a write failure so it cannot fail the MCP request", async () => {
    const spy = makeClient({ update: { error: { message: "denied" } } });
    await expect(touchApiKey(spy.client, "key-1")).resolves.toBeUndefined();
  });
});
