/**
 * Tests the account scoping behind per-account class lists.
 *
 * These resolvers decide which account's courses an endpoint returns, so the
 * failure that matters is not a wrong list but a list belonging to somebody
 * else. Every test here is about the ownership constraint being part of the
 * query rather than a filter applied afterwards.
 */

import { describe, it, expect, vi } from "vitest";
import * as fs from "fs";
import * as path from "path";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  PRIMARY_ACCOUNT_ID,
  isPrimaryAccount,
  resolveCanvasAccount,
  resolveFeedAccountUrl,
} from "@/lib/account-scope";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

/**
 * A Supabase stub recording every `.eq()` constraint applied to the query.
 *
 * @param row - What `.single()` resolves to.
 * @returns The stub plus the recorded constraints and selected table.
 */
function stubClient(row: unknown) {
  const eqs: Array<[string, unknown]> = [];
  let table = "";
  let selected = "";
  const builder: Record<string, unknown> = {
    select: vi.fn((cols: string) => {
      selected = cols;
      return builder;
    }),
    eq: vi.fn((col: string, val: unknown) => {
      eqs.push([col, val]);
      return builder;
    }),
    single: vi.fn(async () => ({ data: row })),
  };
  const client = {
    from: vi.fn((t: string) => {
      table = t;
      return builder;
    }),
  } as unknown as SupabaseClient;
  return { client, eqs, get table() { return table; }, get selected() { return selected; } };
}

describe("isPrimaryAccount", () => {
  it("treats an absent id as the primary account", () => {
    expect(isPrimaryAccount(null)).toBe(true);
  });

  it("treats the sentinel as the primary account", () => {
    expect(isPrimaryAccount(PRIMARY_ACCOUNT_ID)).toBe(true);
  });

  it("treats any other id as an extra account", () => {
    expect(isPrimaryAccount("abc-123")).toBe(false);
    expect(isPrimaryAccount("")).toBe(true);
  });
});

describe("resolveCanvasAccount", () => {
  const credsRow = {
    canvas_token: "primary-token",
    canvas_base_url: "https://bcourses.berkeley.edu",
    canvas_ical_url: null,
    additional_canvas_accounts: [
      { id: "extra-1", token: "extra-token", base_url: "https://other.instructure.com" },
    ],
  };

  it("returns the flat columns for the primary account", async () => {
    const { client } = stubClient(credsRow);
    const account = await resolveCanvasAccount(client, "user-1", null);
    expect(account).toEqual({
      token: "primary-token",
      baseUrl: "https://bcourses.berkeley.edu",
      icalUrl: null,
    });
  });

  it("returns the named extra school", async () => {
    const { client } = stubClient(credsRow);
    const account = await resolveCanvasAccount(client, "user-1", "extra-1");
    expect(account?.token).toBe("extra-token");
    expect(account?.baseUrl).toBe("https://other.instructure.com");
  });

  it("constrains the read to the requesting user", async () => {
    const stub = stubClient(credsRow);
    await resolveCanvasAccount(stub.client, "user-1", "extra-1");
    expect(stub.eqs).toContainEqual(["user_id", "user-1"]);
  });

  it("returns nothing for an id the user does not own", async () => {
    // Extra schools live on the user's own row, so an id from someone else is
    // simply not in the list.
    const { client } = stubClient(credsRow);
    expect(await resolveCanvasAccount(client, "user-1", "someone-elses")).toBeNull();
  });

  it("returns nothing when the user has no credentials row", async () => {
    const { client } = stubClient(null);
    expect(await resolveCanvasAccount(client, "user-1", null)).toBeNull();
  });

  it("carries the feed URL for a school connected without a token", async () => {
    const { client } = stubClient({
      ...credsRow,
      canvas_token: null,
      canvas_ical_url: "https://bcourses.berkeley.edu/feeds/x.ics",
    });
    const account = await resolveCanvasAccount(client, "user-1", null);
    expect(account?.token).toBeNull();
    expect(account?.icalUrl).toBe("https://bcourses.berkeley.edu/feeds/x.ics");
  });
});

describe("resolveFeedAccountUrl", () => {
  it("reads the primary account from its credential column", async () => {
    const stub = stubClient({ pensieve_calendar_url: "https://x/primary.ics" });
    const url = await resolveFeedAccountUrl(stub.client, "user-1", "pensieve", null, "pensieve_calendar_url");
    expect(url).toBe("https://x/primary.ics");
    expect(stub.table).toBe("integration_credentials");
  });

  it("reads an extra account from the accounts table", async () => {
    const stub = stubClient({ connection: { calendar_url: "https://x/extra.ics" } });
    const url = await resolveFeedAccountUrl(stub.client, "user-1", "pensieve", "acct-9", "pensieve_calendar_url");
    expect(url).toBe("https://x/extra.ics");
    expect(stub.table).toBe("integration_accounts");
  });

  it("constrains an extra account by user, provider, and id together", async () => {
    // Provider is part of the constraint, so an id that exists under another
    // provider does not resolve here either.
    const stub = stubClient({ connection: { calendar_url: "https://x/extra.ics" } });
    await resolveFeedAccountUrl(stub.client, "user-1", "pensieve", "acct-9", "pensieve_calendar_url");
    expect(stub.eqs).toContainEqual(["user_id", "user-1"]);
    expect(stub.eqs).toContainEqual(["provider", "pensieve"]);
    expect(stub.eqs).toContainEqual(["id", "acct-9"]);
  });

  it("returns null when the account is not the user's", async () => {
    const stub = stubClient(null);
    expect(
      await resolveFeedAccountUrl(stub.client, "user-1", "pensieve", "acct-9", "pensieve_calendar_url")
    ).toBeNull();
  });

  it("returns null for an account row carrying no calendar URL", async () => {
    const stub = stubClient({ connection: {} });
    expect(
      await resolveFeedAccountUrl(stub.client, "user-1", "pensieve", "acct-9", "pensieve_calendar_url")
    ).toBeNull();
  });

  it("rejects a non-string URL rather than passing it on", async () => {
    const stub = stubClient({ connection: { calendar_url: 42 } });
    expect(
      await resolveFeedAccountUrl(stub.client, "user-1", "pensieve", "acct-9", "pensieve_calendar_url")
    ).toBeNull();
  });
});

describe("the course endpoints use the resolvers", () => {
  it("Canvas scopes by account_id instead of reading the flat columns", () => {
    const route = read("src/app/api/canvas/courses/route.ts");
    expect(route).toContain('searchParams.get("account_id")');
    expect(route).toContain("resolveCanvasAccount(supabase, user.id, accountId)");
    expect(route).not.toContain('.select("canvas_token, canvas_base_url")');
  });

  it("Pensive scopes by account_id instead of reading the flat column", () => {
    const route = read("src/app/api/pensieve/courses/route.ts");
    expect(route).toContain('searchParams.get("account_id")');
    expect(route).toContain("resolveFeedAccountUrl(");
    expect(route).not.toContain('.select("pensieve_calendar_url")');
  });

  it("still lets onboarding verify a token before anything is saved", () => {
    // The pre-save path takes the token straight from the query, so a user
    // can check credentials that have no account to scope to yet.
    const route = read("src/app/api/canvas/courses/route.ts");
    expect(route).toContain("if (queryToken && queryBaseUrl)");
    expect(route).toContain("isAllowedCanvasUrl(queryBaseUrl)");
  });
});
