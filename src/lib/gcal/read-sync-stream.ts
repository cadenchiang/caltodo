/**
 * Shared NDJSON stream reader for the /api/gcal/initial-sync endpoint.
 * Used by both GoogleCalendarSettings (manual sync) and TaskContext (post-assignment sync).
 *
 * Reads newline-delimited JSON events from the response stream:
 *   {"type":"start","total":N}
 *   {"type":"progress","synced":N,"total":N,"taskId"?:"...","googleEventId"?:"..."}
 *   {"type":"done","synced":N,"total":N,"errors":[],"partial"?:bool,"remaining"?:N}
 */

/** Result shape returned by the "done" event. */
export interface SyncStreamResult {
  synced: number;
  total: number;
  errors: string[];
  /** True when the server stopped at its time budget with tasks left over. */
  partial?: boolean;
  /** Tasks not attempted this run (only meaningful when partial). */
  remaining?: number;
}

/** Callbacks for stream progress and completion events. */
export interface SyncStreamCallbacks {
  onProgress: (synced: number, total: number) => void;
  onDone: () => void;
  /**
   * Fired for each progress event that carries the task id and the event id
   * the server just attached, so the client can mirror it into local state.
   */
  onTaskSynced?: (taskId: string, googleEventId: string) => void;
}

/**
 * Reads an NDJSON stream from the initial-sync endpoint, firing callbacks
 * for progress and completion events.
 *
 * @param response - The fetch Response with an NDJSON body
 * @param callbacks - Progress and done handlers
 * @returns The final "done" event payload, or null if stream ended without one
 */
export async function readSyncStream(
  response: Response,
  callbacks: SyncStreamCallbacks,
): Promise<SyncStreamResult | null> {
  const reader = response.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult: SyncStreamResult | null = null;
  while (true) {
    const { done, value } = await reader.read();
    if (done) { buffer += decoder.decode(); break; }
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const event = JSON.parse(line);
        if (event.type === "start" || event.type === "progress") {
          callbacks.onProgress(event.synced ?? 0, event.total);
          if (event.type === "progress" && typeof event.taskId === "string" && typeof event.googleEventId === "string") {
            callbacks.onTaskSynced?.(event.taskId, event.googleEventId);
          }
        } else if (event.type === "done") {
          finalResult = event;
          callbacks.onDone();
        }
      } catch { /* skip malformed lines */ }
    }
  }
  if (buffer.trim()) {
    try {
      const event = JSON.parse(buffer);
      if (event.type === "done") { finalResult = event; callbacks.onDone(); }
    } catch { /* skip */ }
  }
  return finalResult;
}
