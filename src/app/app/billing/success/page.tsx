import { redirect } from "next/navigation";

/** Where a completed checkout lands. Everything is free, so there is nothing to show. */
export const BILLING_SUCCESS_REDIRECT = "/app/inbox";

/**
 * Post-checkout landing. Stripe's success_url still points here, and the
 * app is free forever, so the old upgrade-success page is gone: this route only
 * redirects into the app.
 *
 * @remarks The webhook may not have arrived yet; the row updates within a
 *          few seconds and the next entitlement fetch picks it up.
 */
export default function BillingSuccessPage() {
  redirect(BILLING_SUCCESS_REDIRECT);
}
