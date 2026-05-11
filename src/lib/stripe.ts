import Stripe from "stripe";

/**
 * Singleton Stripe client used by API routes and server actions.
 * Reads the secret key from env at module load time; throws if missing
 * so misconfiguration fails loudly at first use.
 *
 * @returns A configured Stripe client.
 */
function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
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
 * Reads a required environment variable. Throws if missing so we never
 * silently send an empty value to Stripe (which would produce vague errors).
 *
 * @param name - Env var name to read.
 * @returns The string value of the env var.
 */
function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

/** Webhook signing secret used to verify the Stripe-Signature header. */
export function webhookSecret(): string {
  return requiredEnv("STRIPE_WEBHOOK_SECRET");
}
