"use client";

/**
 * One Realtime subscription per chat room, shared by every listener.
 *
 * Messages arrive as Broadcast events on the private topic `chat:<courseId>`,
 * sent by a database trigger with only safe columns (migration
 * 20260923000005). Nothing here uses postgres_changes on chat_messages, so
 * author_id never reaches the browser (audit C2). The topic is private, so
 * only course members can subscribe (RLS on realtime.messages).
 *
 * supabase-js returns the existing channel object for a repeated topic, so
 * the room view and the global notifier must not each build one. This
 * module holds a ref-counted channel per room and fans events out.
 *
 * @module chat-realtime
 */

import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { ensureRealtimeAuth } from "@/lib/supabase/realtime-auth";
import type { ChatMessage } from "@/lib/types";

/** Broadcast event names the trigger sends. */
export const MESSAGE_INSERTED_EVENT = "message_inserted";
export const MESSAGE_DELETED_EVENT = "message_deleted";

/** Realtime topic for a room's message channel. Must match the RLS policy. */
export function roomMessagesTopic(courseId: string): string {
  return `chat:${courseId}`;
}

/** What a listener receives. */
export interface RoomEventHandlers {
  onInserted?: (message: ChatMessage) => void;
  onDeleted?: (payload: { id: string; course_id: string }) => void;
}

interface RoomSubscription {
  channel: RealtimeChannel | null;
  listeners: Set<RoomEventHandlers>;
  /** True once the channel object exists; subscribe() may still be pending. */
  started: boolean;
  cancelled: boolean;
}

const rooms = new Map<string, RoomSubscription>();

/**
 * Validates a broadcast payload as a safe message row. The trigger controls
 * the shape, but a stray payload must not crash the list.
 */
function isSafeMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === "string" && typeof v.course_id === "string" && typeof v.body === "string" && typeof v.author_key === "string";
}

/**
 * Subscribes to a room's message events.
 *
 * @param courseId - The room
 * @param handlers - Callbacks for inserts and deletes
 * @returns Unsubscribe function; the channel closes when the last listener leaves
 */
export function subscribeRoomEvents(courseId: string, handlers: RoomEventHandlers): () => void {
  let room = rooms.get(courseId);
  if (!room) {
    room = { channel: null, listeners: new Set(), started: false, cancelled: false };
    rooms.set(courseId, room);
    startRoom(courseId, room);
  }
  room.listeners.add(handlers);

  return () => {
    const current = rooms.get(courseId);
    if (!current) return;
    current.listeners.delete(handlers);
    if (current.listeners.size === 0) {
      current.cancelled = true;
      current.channel?.unsubscribe();
      rooms.delete(courseId);
    }
  };
}

/** Opens the private broadcast channel for a room. */
async function startRoom(courseId: string, room: RoomSubscription): Promise<void> {
  const supabase = createClient();
  await ensureRealtimeAuth(supabase);
  if (room.cancelled) return;

  const channel = supabase.channel(roomMessagesTopic(courseId), { config: { private: true } });
  channel.on("broadcast", { event: MESSAGE_INSERTED_EVENT }, ({ payload }) => {
    if (!isSafeMessage(payload)) return;
    for (const l of room.listeners) l.onInserted?.(payload);
  });
  channel.on("broadcast", { event: MESSAGE_DELETED_EVENT }, ({ payload }) => {
    const p = payload as { id?: unknown; course_id?: unknown };
    if (typeof p?.id !== "string" || typeof p?.course_id !== "string") return;
    for (const l of room.listeners) l.onDeleted?.({ id: p.id, course_id: p.course_id });
  });
  channel.subscribe();
  room.channel = channel;
  room.started = true;
}

/** Test hook: number of open room subscriptions. */
export function openRoomSubscriptionCount(): number {
  return rooms.size;
}
