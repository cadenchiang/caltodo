/**
 * Tests for the Stripe webhook's idempotency and subscription keying.
 *
 * Audit M17: webhooks keyed on customer id only, so a past_due sub A set
 * the plan free, checkout allowed sub B, and A's later deleted event
 * flipped the row to free with B still paid. No event-id idempotency.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  isEventForStoredSubscription,
  hasNonCanceledSubscription,
  isUniqueViolation,
} from "@/lib/stripe-guards";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

describe("isEventForStoredSubscription", () => {
  it("applies when nothing is stored yet", () => {
    expect(isEventForStoredSubscription(null, "sub_B")).toBe(true);
    expect(isEventForStoredSubscription(undefined, "sub_B")).toBe(true);
    expect(isEventForStoredSubscription("", "sub_B")).toBe(true);
  });

  it("applies when the ids match", () => {
    expect(isEventForStoredSubscription("sub_B", "sub_B")).toBe(true);
  });

  it("ignores an event about a different subscription (the audit scenario)", () => {
    // Row holds the newer sub B; a deleted event for the old sub A arrives.
    expect(isEventForStoredSubscription("sub_B", "sub_A")).toBe(false);
  });
});

describe("hasNonCanceledSubscription", () => {
  it("is false with no subscriptions or only ended ones", () => {
    expect(hasNonCanceledSubscription([])).toBe(false);
    expect(hasNonCanceledSubscription([{ status: "canceled" }, { status: "incomplete_expired" }])).toBe(false);
  });

  it("is true for anything still live, including past_due", () => {
    for (const status of ["active", "trialing", "past_due", "unpaid", "incomplete", "paused"]) {
      expect(hasNonCanceledSubscription([{ status: "canceled" }, { status }])).toBe(true);
    }
  });
});

describe("isUniqueViolation", () => {
  it("recognises SQLSTATE 23505 and nothing else", () => {
    expect(isUniqueViolation({ code: "23505" })).toBe(true);
    expect(isUniqueViolation({ code: "42703" })).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
    expect(isUniqueViolation(undefined)).toBe(false);
  });
});

describe("the webhook route", () => {
  const route = read("src/app/api/stripe/webhook/route.ts");
  const store = read("src/lib/stripe-webhook-store.ts");

  it("claims the event id before handling and acknowledges duplicates", () => {
    expect(route).toContain("const claimed = await claimEvent(event);");
    expect(route).toContain('if (claimed === "duplicate") {');
    expect(route).toContain("return NextResponse.json({ received: true, duplicate: true });");
    expect(route.indexOf("await claimEvent(event)")).toBeLessThan(route.indexOf("switch (event.type)"));
  });

  it("releases the claim when the handler fails so the retry is applied", () => {
    expect(route).toContain("await releaseEvent(event.id);");
    expect(route.indexOf("await releaseEvent(event.id);")).toBeLessThan(route.indexOf('{ error: "handler_failed" }'));
  });

  it("keys updated and deleted events on the stored subscription id", () => {
    expect(route).toMatch(/case "customer\.subscription\.updated":\s*if \(await concernsStoredSubscription\(event\.data\.object, event\.type\)\)/);
    expect(route).toMatch(/case "customer\.subscription\.deleted":\s*if \(await concernsStoredSubscription\(event\.data\.object, event\.type\)\)/);
    expect(store).toContain("isEventForStoredSubscription(stored, sub.id)");
    expect(store).toContain('.select("stripe_subscription_id")');
    expect(store).toContain('.eq("stripe_customer_id", customerId)');
  });

  it("records events in the table the migration creates", () => {
    expect(store).toContain('.from("stripe_webhook_events")');
    expect(store).toContain("isUniqueViolation(error)");
    const migration = read("supabase/migrations/20260921000008_stripe_webhook_events.sql");
    expect(migration).toContain("create table public.stripe_webhook_events");
    expect(migration).toContain("event_id text primary key");
    expect(migration).toContain("enable row level security");
  });
});

describe("the checkout route", () => {
  const route = read("src/app/api/stripe/checkout/route.ts");

  it("refuses when the customer has any non-canceled subscription at Stripe", () => {
    expect(route).toContain('stripe().subscriptions.list({ customer: customerId, status: "all", limit: 100 })');
    expect(route).toContain("if (hasNonCanceledSubscription(existing.data)) {");
    expect(route).toContain('error: "subscription_exists"');
    expect(route).toContain("{ status: 409 }");
  });

  it("checks before creating the session", () => {
    expect(route.indexOf("hasNonCanceledSubscription(existing.data)")).toBeLessThan(
      route.indexOf("stripe().checkout.sessions.create("),
    );
  });
});
