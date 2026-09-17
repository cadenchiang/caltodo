/**
 * Client-side setup that must run once after Google OAuth succeeds.
 *
 * Storing tokens is not enough to sync: until a calendar selection is saved,
 * /api/gcal/initial-sync answers `needsCalendarSelection` and nothing is ever
 * written. Settings runs these calls after a connect; onboarding needs the
 * same sequence, so it lives here instead of inside one component.
 *
 * @module gcal/connect-setup
 */

/** Most calendars /api/gcal/select-calendar accepts. */
const MAX_CALENDARS = 10;

/** Outcome of {@link setUpConnectedCalendar}. */
export type ConnectSetupResult =
  | { ok: true; calendarIds: string[] }
  | { ok: false; step: "select-calendar"; error: string };

/**
 * Orders the calendar selection so the dedicated caltodo calendar is the
 * write target. The sync code writes to index 0, which keeps synced
 * assignments out of the user's personal calendars.
 *
 * @param caltodoCalendarId - The dedicated calendar's ID, or null if creating it failed.
 * @param otherIds - The user's other calendar IDs (read-only display).
 * @returns 1 to 10 IDs. Falls back to ["primary"] when nothing else is known.
 */
export function chooseCalendarIds(caltodoCalendarId: string | null, otherIds: string[]): string[] {
  const others = otherIds.filter((id) => id && id !== caltodoCalendarId);
  if (caltodoCalendarId) return [caltodoCalendarId, ...others].slice(0, MAX_CALENDARS);
  if (others.length > 0) return others.slice(0, MAX_CALENDARS);
  return ["primary"];
}

/**
 * Ensures the caltodo calendar exists, then saves the calendar selection,
 * which also registers the push channel server-side.
 *
 * Failing to create the dedicated calendar or to list calendars is recoverable
 * (the selection degrades toward "primary"), so only a failed save is fatal.
 *
 * @param fetchImpl - Injectable fetch, for tests.
 * @returns The saved calendar IDs, or the failing step and its message. Never throws.
 */
export async function setUpConnectedCalendar(
  fetchImpl: typeof fetch = fetch,
): Promise<ConnectSetupResult> {
  let caltodoCalendarId: string | null = null;
  try {
    const res = await fetchImpl("/api/gcal/ensure-caltodo-calendar", { method: "POST" });
    if (res.ok) {
      caltodoCalendarId = ((await res.json()) as { calendarId?: string }).calendarId ?? null;
    } else {
      console.warn("setUpConnectedCalendar: could not ensure caltodo calendar; falling back", { status: res.status });
    }
  } catch (err) {
    console.warn("setUpConnectedCalendar: ensure-caltodo-calendar request failed; falling back", { error: String(err) });
  }

  const otherIds: string[] = [];
  try {
    const res = await fetchImpl("/api/gcal/calendars?all=true");
    if (res.ok) {
      const data = (await res.json()) as { calendars?: Array<{ id: string }> };
      for (const c of data.calendars ?? []) otherIds.push(c.id);
    } else {
      console.warn("setUpConnectedCalendar: could not list calendars; continuing without them", { status: res.status });
    }
  } catch (err) {
    console.warn("setUpConnectedCalendar: calendars request failed; continuing without them", { error: String(err) });
  }

  const calendarIds = chooseCalendarIds(caltodoCalendarId, otherIds);

  try {
    const res = await fetchImpl("/api/gcal/select-calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calendarIds }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      const error = body.error || `Request failed: ${res.status}`;
      console.error("setUpConnectedCalendar: saving the calendar selection failed", {
        status: res.status, error, impact: "tasks will not sync until a calendar is selected",
      });
      return { ok: false, step: "select-calendar", error };
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error("setUpConnectedCalendar: select-calendar request failed", {
      error, impact: "tasks will not sync until a calendar is selected",
    });
    return { ok: false, step: "select-calendar", error };
  }

  return { ok: true, calendarIds };
}
