import Stripe from "stripe";

/**
 * Thrown when a required Stripe env var is missing.
 * Routes catch this to return a clear 503 ("Stripe is not configured")
 * instead of a generic 500, so the client UI can show useful copy.
 */
export class StripeNotConfiguredError extends Error {
  /** The env var that was missing. */
  readonly envVar: string;
  constructor(envVar: string) {
    super(`${envVar} is not set`);
    this.name = "StripeNotConfiguredError";
    this.envVar = envVar;
  }
}

/** True when every var the checkout / portal flow needs is present. */
export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRO_MONTHLY_PRICE_ID &&
      process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
  );
}

/**
 * Build a Stripe client. Throws StripeNotConfiguredError when the secret key
 * is missing so callers can branch on configuration cleanly.
 */
function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new StripeNotConfiguredError("STRIPE_SECRET_KEY");
  return new Stripe(key, {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
  });
}

/** Lazy-evaluated singleton — only constructed when first accessed. */
let _stripe: Stripe | null = null;
export function stripe(): Stripe {
  if (!_stripe) _stripe = getStripeClient();
  return _stripe;
}

/** Stripe price IDs sourced from env so they can differ test vs live. */
export const STRIPE_PRICES = {
  proMonthly: () => requiredEnv("STRIPE_PRO_MONTHLY_PRICE_ID"),
  proAnnual: () => requiredEnv("STRIPE_PRO_ANNUAL_PRICE_ID"),
};

/**
 * Reads a required environment variable. Throws StripeNotConfiguredError if
 * missing so we never silently send an empty value to Stripe (which would
 * produce vague errors that are hard to debug).
 *
 * @param name - Env var name to read.
 * @returns The string value of the env var.
 */
function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new StripeNotConfiguredError(name);
  return v;
}

/** Webhook signing secret used to verify the Stripe-Signature header. */
export function webhookSecret(): string {
  return requiredEnv("STRIPE_WEBHOOK_SECRET");
}
