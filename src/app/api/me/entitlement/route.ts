import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getEntitlement } from "@/lib/entitlements";

/**
 * GET /api/me/entitlement
 * Returns the current user's effective entitlement state. Used by the
 * client to decide whether to render gated UI vs an upgrade prompt.
 *
 * Returns 401 when not signed in.
 */
export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const entitlement = await getEntitlement(user.id);
  // Return only what the client needs to gate UI — omit internal Stripe ids
  // (customer/subscription) which shouldn't reach the browser.
  return NextResponse.json({
    effectivePlan: entitlement.effectivePlan,
    cancelAtPeriodEnd: entitlement.cancelAtPeriodEnd,
    currentPeriodEnd: entitlement.currentPeriodEnd,
  });
}
