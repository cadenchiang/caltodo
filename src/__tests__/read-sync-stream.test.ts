/**
 * Tests for readSyncStream, the NDJSON reader for /api/gcal/initial-sync.
 *
 * Verifies progress and done events reach their callbacks, per-task event
 * ids are surfaced through onTaskSynced, and a partial "done" payload is
 * returned intact so callers can treat it as "continue next time".
 */

import { describe, it, expect, vi } from "vitest";
import { readSyncStream } from "@/lib/gcal/read-sync-stream";

/** Builds a Response whose body streams the given NDJSON lines in chunks. */
function streamResponse(chunks: string[]): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
  return new Response(body);
}

describe("readSyncStream", () => {
  it("fires onTaskSynced only for progress events carrying both ids", async () => {
    const onTaskSynced = vi.fn();
    const onProgress = vi.fn();
    const res = streamResponse([
      '{"type":"start","total":2}\n',
      '{"type":"progress","synced":1,"total":2,"processed":1,"taskId":"t1","googleEventId":"e1"}\n',
      '{"type":"progress","synced":1,"total":2,"processed":2}\n',
      '{"type":"done","synced":1,"total":2,"errors":["x"]}\n',
    ]);

    const result = await readSyncStream(res, { onProgress, onDone: () => {}, onTaskSynced });

    expect(onTaskSynced).toHaveBeenCalledTimes(1);
    expect(onTaskSynced).toHaveBeenCalledWith("t1", "e1");
    expect(onProgress).toHaveBeenCalledTimes(3);
    expect(result).toEqual({ type: "done", synced: 1, total: 2, errors: ["x"] });
  });

  it("handles a done event split across chunks and without a trailing newline", async () => {
    const onDone = vi.fn();
    const res = streamResponse([
      '{"type":"start","total":1}\n{"type":"done","syn',
      'ced":0,"total":1,"errors":[]}',
    ]);
    const result = await readSyncStream(res, { onProgress: () => {}, onDone });
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(result?.synced).toBe(0);
    expect(result?.total).toBe(1);
  });

  it("returns null when the stream ends without a done event", async () => {
    const res = streamResponse(['{"type":"start","total":3}\n']);
    const result = await readSyncStream(res, { onProgress: () => {}, onDone: () => {} });
    expect(result).toBeNull();
  });
});
