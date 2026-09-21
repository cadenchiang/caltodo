/**
 * Tests for the non-database side of account deletion.
 *
 * Audit M18: deleting the auth user never canceled the Stripe subscription
 * and left avatar and chat-attachment objects behind; later webhooks then
 * upserted a user_id that no longer existed.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { isForeignKeyViolation } from "@/lib/stripe-guards";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

// Stripe client stub, swapped per test.
const cancel = vi.fn();
vi.mock("@/lib/stripe", () => {
  class StripeNotConfiguredError extends Error {
    envVar: string;
    constructor(envVar: string) {
      super(`${envVar} is not set`);
      this.envVar = envVar;
    }
  }
  return {
    StripeNotConfiguredError,
    stripe: () => {
      if (!process.env.STRIPE_SECRET_KEY) throw new StripeNotConfiguredError("STRIPE_SECRET_KEY");
      return { subscriptions: { cancel } };
    },
  };
});

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { cancelStripeSubscription, deleteUserStorageObjects } from "@/lib/account-cleanup";

/** A minimal admin client whose subscriptions row and storage are scripted. */
function adminStub(opts: {
  row?: { stripe_subscription_id: string | null } | null;
  rowError?: { message: string } | null;
  avatarFiles?: Array<{ name: string }>;
  owned?: Array<{ name: string }>;
  ownedError?: { message: string } | null;
}) {
  const removed: Record<string, string[]> = {};
  const client = {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: opts.row ?? null, error: opts.rowError ?? null }),
        }),
      }),
    }),
    schema: () => ({
      from: () => ({
        select: () => ({
          eq: () => ({
            or: async () => ({ data: opts.owned ?? [], error: opts.ownedError ?? null }),
          }),
        }),
      }),
    }),
    storage: {
      from: (bucket: string) => ({
        list: async () => ({ data: opts.avatarFiles ?? [], error: null }),
        remove: async (paths: string[]) => {
          removed[bucket] = paths;
          return { error: null };
        },
      }),
    },
  };
  return { client: client as never, removed };
}

describe("cancelStripeSubscription", () => {
  beforeEach(() => {
    cancel.mockReset();
    process.env.STRIPE_SECRET_KEY = "sk_test";
  });
  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
  });

  it("is a no-op when the row has no subscription", async () => {
    const { client } = adminStub({ row: { stripe_subscription_id: null } });
    expect(await cancelStripeSubscription(client, "u1")).toEqual({ ok: true, subscriptionId: null });
    expect(cancel).not.toHaveBeenCalled();
  });

  it("cancels the stored subscription", async () => {
    cancel.mockResolvedValue({});
    const { client } = adminStub({ row: { stripe_subscription_id: "sub_1" } });
    expect(await cancelStripeSubscription(client, "u1")).toEqual({ ok: true, subscriptionId: "sub_1" });
    expect(cancel).toHaveBeenCalledWith("sub_1");
  });

  it("treats an already-missing subscription as canceled", async () => {
    cancel.mockRejectedValue(Object.assign(new Error("No such subscription"), { code: "resource_missing" }));
    const { client } = adminStub({ row: { stripe_subscription_id: "sub_1" } });
    expect((await cancelStripeSubscription(client, "u1")).ok).toBe(true);
  });

  it("refuses when Stripe rejects the cancel", async () => {
    cancel.mockRejectedValue(new Error("boom"));
    const { client } = adminStub({ row: { stripe_subscription_id: "sub_1" } });
    expect((await cancelStripeSubscription(client, "u1")).ok).toBe(false);
  });

  it("tolerates Stripe being unconfigured", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const { client } = adminStub({ row: { stripe_subscription_id: "sub_1" } });
    expect(await cancelStripeSubscription(client, "u1")).toEqual({ ok: true, subscriptionId: "sub_1" });
    expect(cancel).not.toHaveBeenCalled();
  });

  it("refuses when the row cannot be read", async () => {
    const { client } = adminStub({ rowError: { message: "down" } });
    expect((await cancelStripeSubscription(client, "u1")).ok).toBe(false);
  });
});

describe("deleteUserStorageObjects", () => {
  it("removes the avatar folder and the owned chat attachments", async () => {
    const { client, removed } = adminStub({
      avatarFiles: [{ name: "avatar.png" }, { name: "board-img-1.jpg" }],
      owned: [{ name: "course-1/123-abc.png" }],
    });
    expect(await deleteUserStorageObjects(client, "u1")).toEqual({ avatars: 2, chatAttachments: 1 });
    expect(removed.avatars).toEqual(["u1/avatar.png", "u1/board-img-1.jpg"]);
    expect(removed["chat-attachments"]).toEqual(["course-1/123-abc.png"]);
  });

  it("reports a failed lookup without throwing, so deletion continues", async () => {
    const { client } = adminStub({ ownedError: { message: "schema not exposed" } });
    expect(await deleteUserStorageObjects(client, "u1")).toEqual({ avatars: 0, chatAttachments: -1 });
  });
});

describe("the delete route", () => {
  const route = read("src/app/api/account/delete/route.ts");

  it("cancels Stripe and cleans storage before deleting anything", () => {
    const cancelAt = route.indexOf("await cancelStripeSubscription(adminClient, userId)");
    const storageAt = route.indexOf("await deleteUserStorageObjects(adminClient, userId)");
    const tasksAt = route.indexOf('.from("tasks")');
    const userAt = route.indexOf("adminClient.auth.admin.deleteUser(userId)");
    expect(cancelAt).toBeGreaterThan(-1);
    expect(cancelAt).toBeLessThan(storageAt);
    expect(storageAt).toBeLessThan(tasksAt);
    expect(tasksAt).toBeLessThan(userAt);
  });

  it("aborts when the subscription could not be canceled", () => {
    expect(route).toMatch(/if \(!cancel\.ok\) \{\s*return NextResponse\.json\(\{ error: "Failed to cancel subscription" \}, \{ status: 500 \}\);/);
  });
});

describe("the webhook after an account is gone", () => {
  it("acknowledges a sync for a deleted user instead of retrying forever", () => {
    const route = read("src/app/api/stripe/webhook/route.ts");
    expect(route).toContain("if (isForeignKeyViolation(error)) {");
    expect(route).toContain('"stripe_subscription_synced_for_deleted_user"');
    expect(isForeignKeyViolation({ code: "23503" })).toBe(true);
    expect(isForeignKeyViolation({ code: "23505" })).toBe(false);
  });

  it("no longer ignores write errors", () => {
    const route = read("src/app/api/stripe/webhook/route.ts");
    expect(route).not.toMatch(/\n  await admin\n    \.from\("subscriptions"\)/);
    expect(route.match(/if \(error\) throw new Error\(`subscriptions update failed/g)?.length).toBe(2);
  });
});
