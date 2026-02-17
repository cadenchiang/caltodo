/**
 * POST /api/gcal/initial-sync
 *
 * Syncs all existing tasks with a due_date but no google_event_id
 * to Google Calendar. Called after calendar selection.
 *
 * Streams progress as NDJSON (newline-delimited JSON) so the client
 * can display a real-time progress bar. Each line is one of:
 *   {"type":"start","total":N}
 *   {"type":"progress","synced":N,"total":N}
 *   {"type":"done","synced":N,"total":N,"errors":[]}
 *
 * Non-streaming JSON responses are returned for error/edge cases
 * (unauthorized, no calendar, no tasks).
 *
 * Uses a concurrency pool (5 parallel requests) for fast syncing.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, getCalendarId } from "@/lib/gcal/token-manager";
import { createCalendarEvent } from "@/lib/gcal/calendar-client";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import type { Task } from "@/lib/types";

/** Max concurrent Google Calendar API requests (kept low to avoid 403 rate limits). */
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

  // Require a calendar to be selected before syncing
  const calendarId = await getCalendarId(supabase, user.id);

  if (!calendarId) {
    logger.info("POST /api/gcal/initial-sync: no calendar selected, prompting selection", {
      userId: user.id,
    });
    return NextResponse.json({ synced: 0, needsCalendarSelection: true });
  }

  // Fetch all tasks with due_date but no google_event_id
  const { data: tasks, error: fetchError } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .not("due_date", "is", null)
    .is("google_event_id", null)
    .order("due_date", { ascending: true });

  if (fetchError) {
    logger.error("POST /api/gcal/initial-sync: failed to fetch tasks", {
      userId: user.id,
      error: fetchError.message,
    });
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }

  if (!tasks || tasks.length === 0) {
    return NextResponse.json({ synced: 0, total: 0 });
  }

  logger.info("POST /api/gcal/initial-sync: starting bulk sync", {
    userId: user.id,
    taskCount: tasks.length,
    calendarId,
  });

  const encoder = new TextEncoder();
  const total = tasks.length;

  const stream = new ReadableStream({
    async start(controller) {
      // Emit start event
      controller.enqueue(
        encoder.encode(JSON.stringify({ type: "start", total }) + "\n")
      );

      let synced = 0;
      let processed = 0;
      const errors: string[] = [];
      const taskList = tasks as Task[];

      /**
       * Syncs a single task to Google Calendar and updates progress.
       *
       * @param task - The task to sync
       */
      async function syncTask(task: Task): Promise<void> {
        try {
          const eventId = await createCalendarEvent(accessToken!, calendarId!, task);
          if (eventId) {
            await supabase
              .from("tasks")
              .update({ google_event_id: eventId })
              .eq("id", task.id);
            synced++;
          } else {
            errors.push(`Failed to create event for task: ${task.id}`);
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          errors.push(`Error syncing task ${task.id}: ${message}`);
          logger.error("POST /api/gcal/initial-sync: task sync error", {
            taskId: task.id,
            error: message,
          });
        }

        processed++;

        // Emit progress event after each task completes
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: "progress", synced, total, processed }) + "\n")
        );
      }

      // Process tasks in parallel with concurrency limit
      let cursor = 0;
      const running: Set<Promise<void>> = new Set();

      while (cursor < taskList.length || running.size > 0) {
        // Fill up to CONCURRENCY_LIMIT parallel requests
        while (cursor < taskList.length && running.size < CONCURRENCY_LIMIT) {
          const task = taskList[cursor++];
          const promise = syncTask(task).then(() => {
            running.delete(promise);
          });
          running.add(promise);
        }

        // Wait for at least one to finish before continuing
        if (running.size > 0) {
          await Promise.race(running);
        }
      }

      // Emit done event
      controller.enqueue(
        encoder.encode(JSON.stringify({ type: "done", synced, total, errors }) + "\n")
      );

      logger.info("POST /api/gcal/initial-sync: bulk sync complete", {
        userId: user.id,
        synced,
        total,
        errorCount: errors.length,
      });

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
