/**
 * Chat room page: server wrapper that pre-fetches the latest 50 messages so
 * the first visible frame is already pinned to the bottom of the chat, and
 * computes the viewer's author key for the room so own messages are
 * recognised before any API call. Delegates all interactive UI to
 * ChatPageClient.
 */
import { createClient } from "@/lib/supabase/server";
import { computeAuthorKey } from "@/lib/chat-author-key";
import { MESSAGE_COLUMNS } from "@/lib/chat-message-shape";
import type { ChatMessage } from "@/lib/types";
import ChatPageClient from "./ChatPageClient";

const PAGE_SIZE = 50;

interface PageProps {
  params: Promise<{ courseId: string }>;
}

/**
 * Fetches the most recent PAGE_SIZE messages for the room, verifying live
 * membership, selecting only client-safe columns. Returns oldest-first.
 *
 * Any failure returns an empty list so the client renders its skeleton and
 * falls back to the sessionStorage cache plus the API.
 */
async function fetchInitial(courseId: string): Promise<{ messages: ChatMessage[]; authorKey: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { messages: [], authorKey: null };

    const { data: membership } = await supabase
      .from("course_memberships")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .is("deleted_at", null)
      .maybeSingle();
    if (!membership) return { messages: [], authorKey: null };

    const { data: rows, error } = await supabase
      .from("chat_messages")
      .select(MESSAGE_COLUMNS)
      .eq("course_id", courseId)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);
    if (error || !rows) return { messages: [], authorKey: computeAuthorKey(user.id, courseId) };

    return { messages: (rows as ChatMessage[]).reverse(), authorKey: computeAuthorKey(user.id, courseId) };
  } catch {
    return { messages: [], authorKey: null };
  }
}

export default async function CourseChatPage({ params }: PageProps) {
  const { courseId } = await params;
  const { messages, authorKey } = await fetchInitial(courseId);

  return <ChatPageClient initialCourseId={courseId} initialMessages={messages} initialAuthorKey={authorKey} />;
}
