/**
 * POST /api/gcal/initial-sync
 *
 * Syncs existing tasks with a due_date but no google_event_id to Google
 * Calendar. Streams progress as NDJSON. Only tasks due within the last
 * SYNC_FLOOR_DAYS or in the future are considered, and creates stop once
 * TIME_BUDGET_MS has elapsed so the function is never killed mid-write;
 * the "done" event then carries partial: true and the remaining count, and
 * the next run picks up where this one stopped.
 *
 * @returns NDJSON stream: start, progress, done events
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, getCalendarId } from "@/lib/gcal/token-manager";
import { createCalendarEvent, deleteCalendarEvent } from "@/lib/gcal/calendar-sync";
import { syncFloorDate, withinTimeBudget, SYNC_FLOOR_DAYS } from "@/lib/gcal/initial-sync-limits";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import type { Task } from "@/lib/types";

/** Max concurrent Google Calendar API requests. */
const CONCURRENCY_LIMIT = 2;

export async function POST() {
  const startedAt = Date.now();
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`gcal-initial-sync:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const accessToken = await getValidAccessToken(supabase, user.id);
  if (!accessToken) {
    return NextResponse.json({ synced: 0, reason: "not_connected" });
  }

  const calendarId = await getCalendarId(supabase, user.id);
  if (!calendarId) {
    return NextResponse.json({ synced: 0, needsCalendarSelection: true });
  }

  // Date floor: a semester import can carry hundreds of long-past tasks that
  // nobody wants on their calendar and that would eat the whole time budget.
  const floor = syncFloorDate();
  const { data: tasks, error: fetchError } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .not("due_date", "is", null)
    .gte("due_date", floor)
    .is("google_event_id", null)
    .is("dismissed_at", null)
    .order("due_date", { ascending: true });

  if (fetchError) {
    logger.error("POST /api/gcal/initial-sync: failed to fetch tasks", { userId: user.id, error: fetchError.message });
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }

  const { count: skippedOlder, error: countError } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .not("due_date", "is", null)
    .lt("due_date", floor)
    .is("google_event_id", null)
    .is("dismissed_at", null);
  if (countError) {
    logger.warn("POST /api/gcal/initial-sync: could not count tasks below the date floor", {
      userId: user.id, error: countError.message,
    });
  } else if ((skippedOlder ?? 0) > 0) {
    logger.info("POST /api/gcal/initial-sync: skipping tasks due before the floor", {
      userId: user.id, floor, floorDays: SYNC_FLOOR_DAYS, skipped: skippedOlder,
    });
  }

  if (!tasks || tasks.length === 0) {
    return NextResponse.json({ synced: 0, total: 0, skippedOlder: skippedOlder ?? 0 });
  }

  logger.info("POST /api/gcal/initial-sync: starting bulk sync", {
    userId: user.id, taskCount: tasks.length, skippedOlder: skippedOlder ?? 0,
  });

  const encoder = new TextEncoder();
  const total = tasks.length;

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(JSON.stringify({ type: "start", total }) + "\n"));

      let synced = 0;
      let processed = 0;
      const errors: string[] = [];
      const taskList = tasks as Task[];

      async function syncTask(task: Task): Promise<void> {
        let lastError: string | null = null;
        let attachedEventId: string | null = null;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const eventId = await createCalendarEvent(accessToken!, calendarId!, task);
            if (eventId) {
              // Attach the event only if the task still has no google_event_id.
              // Two concurrent initial-syncs (e.g. Settings auto-sync racing the
              // TaskContext sync) would otherwise each create an event and orphan
              // one. The conditional update lets exactly one win; the loser
              // deletes the duplicate event it just created.
              const { data: won } = await supabase
                .from("tasks")
                .update({ google_event_id: eventId })
                .eq("id", task.id)
                .is("google_event_id", null)
                .select("id")
                .maybeSingle();
              if (won) {
                synced++;
                attachedEventId = eventId;
              } else {
                await deleteCalendarEvent(accessToken!, calendarId!, eventId).catch(() => {});
              }
              lastError = null;
              break;
            }
            lastError = `Failed to create event for task: ${task.id}`;
          } catch (err) {
            lastError = err instanceof Error ? err.message : String(err);
          }
          if (attempt === 0) await new Promise((r) => setTimeout(r, 500));
        }
        if (lastError) {
          errors.push(lastError);
          logger.error("POST /api/gcal/initial-sync: task sync failed", { taskId: task.id, error: lastError });
        }
        processed++;
        // The task and event ids let the client mirror the attachment into
        // local state, so a delete in the same session can find the event.
        controller.enqueue(encoder.encode(JSON.stringify({
          type: "progress", synced, total, processed,
          ...(attachedEventId ? { taskId: task.id, googleEventId: attachedEventId } : {}),
        }) + "\n"));
      }

      let cursor = 0;
      let outOfTime = false;
      const running: Set<Promise<void>> = new Set();
      while (cursor < taskList.length || running.size > 0) {
        // Stop enqueuing once the budget is spent; let in-flight creates
        // finish so every event created at Google gets its DB update.
        // Otherwise the platform kills the function mid-write and the next
        // run creates duplicates for the tasks whose update never landed.
        if (!outOfTime && cursor < taskList.length && !withinTimeBudget(startedAt)) {
          outOfTime = true;
        }
        while (!outOfTime && cursor < taskList.length && running.size < CONCURRENCY_LIMIT) {
          const task = taskList[cursor++];
          const promise = syncTask(task).then(() => { running.delete(promise); });
          running.add(promise);
        }
        if (running.size > 0) await Promise.race(running);
        else if (outOfTime) break;
      }

      const remaining = taskList.length - cursor;
      const partial = remaining > 0;
      controller.enqueue(encoder.encode(JSON.stringify({ type: "done", synced, total, errors, partial, remaining }) + "\n"));
      if (partial) {
        logger.warn("POST /api/gcal/initial-sync: stopped at the time budget", {
          userId: user.id, synced, total, remaining, elapsedMs: Date.now() - startedAt,
          impact: "remaining tasks sync on the next run",
        });
      } else {
        logger.info("POST /api/gcal/initial-sync: complete", {
          userId: user.id, synced, total, errorCount: errors.length, elapsedMs: Date.now() - startedAt,
        });
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      "Transfer-Encoding": "chunked",
    },
  });
}
