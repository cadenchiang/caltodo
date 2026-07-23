/**
 * POST /api/gcal/initial-sync
 *
 * Syncs all existing tasks with a due_date but no google_event_id
 * to Google Calendar. Streams progress as NDJSON.
 *
 * @returns NDJSON stream: start, progress, done events
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, getCalendarId } from "@/lib/gcal/token-manager";
import { createCalendarEvent, deleteCalendarEvent } from "@/lib/gcal/calendar-sync";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import type { Task } from "@/lib/types";

/** Max concurrent Google Calendar API requests. */
const CONCURRENCY_LIMIT = 2;

export async function POST() {
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

  const { data: tasks, error: fetchError } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .not("due_date", "is", null)
    .is("google_event_id", null)
    .is("dismissed_at", null)
    .order("due_date", { ascending: true });

  if (fetchError) {
    logger.error("POST /api/gcal/initial-sync: failed to fetch tasks", { userId: user.id, error: fetchError.message });
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }

  if (!tasks || tasks.length === 0) {
    return NextResponse.json({ synced: 0, total: 0 });
  }

  logger.info("POST /api/gcal/initial-sync: starting bulk sync", { userId: user.id, taskCount: tasks.length });

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
        controller.enqueue(encoder.encode(JSON.stringify({ type: "progress", synced, total, processed }) + "\n"));
      }

      let cursor = 0;
      const running: Set<Promise<void>> = new Set();
      while (cursor < taskList.length || running.size > 0) {
        while (cursor < taskList.length && running.size < CONCURRENCY_LIMIT) {
          const task = taskList[cursor++];
          const promise = syncTask(task).then(() => { running.delete(promise); });
          running.add(promise);
        }
        if (running.size > 0) await Promise.race(running);
      }

      controller.enqueue(encoder.encode(JSON.stringify({ type: "done", synced, total, errors }) + "\n"));
      logger.info("POST /api/gcal/initial-sync: complete", { userId: user.id, synced, total, errorCount: errors.length });
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
