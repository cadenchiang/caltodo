/**
 * GET /api/cron/integration-health
 *
 * Daily fleet-wide integration check. Emails an alert when an integration has
 * produced ZERO successful syncs across the entire user base for 24h+.
 *
 * Why this exists: on 2026-07-21 the Gradescope cooldown claim began failing
 * and every auto-sync stopped. The per-user alerting in integration-alerts.ts
 * did fire, but throttled per (user, source, error) it read like scattered
 * blips rather than a total outage, and the integration stayed dead for five
 * days. Absence of success is the signal that catches that class of failure;
 * presence of errors is not.
 *
 * Protected by CRON_SECRET.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { sendAlertEmail } from "@/lib/integration-alerts";
import {
  checkIntegrationHealth,
  formatHealthAlert,
} from "@/lib/integration-health-check";

export async function GET(request: NextRequest) {
  // Fail CLOSED, matching the other cron routes: this reads across all users.
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const health = await checkIntegrationHealth(supabase);
    const unhealthy = health.filter((h) => h.unhealthy);

    logger.info("integration health check", { health });

    if (unhealthy.length > 0) {
      const sources = unhealthy.map((h) => h.source).join(", ");
      logger.error("integration health: fleet-wide outage detected", { unhealthy });
      await sendAlertEmail(
        `[caltodo] ${sources} has had no successful syncs in 24h`,
        formatHealthAlert(unhealthy)
      );
    }

    return NextResponse.json({ ok: true, health });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("integration health check failed", { error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
