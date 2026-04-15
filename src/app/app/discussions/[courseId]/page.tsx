/**
 * Chat room page — server wrapper that pre-fetches the latest 50 messages
 * so the first visible frame is already pinned to the bottom of the chat
 * with no top-then-scroll flash. Delegates all interactive UI to
 * ChatPageClient which runs as a client component.
 */
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { obfuscateAuthorId } from "@/lib/author-obfuscate";
import type { ChatMessage } from "@/lib/types";
import ChatPageClient from "./ChatPageClient";

const PAGE_SIZE = 50;

interface PageProps {
  params: Promise<{ courseId: string }>;
}

/**
 * Fetches the most recent PAGE_SIZE messages for the target chat room,
 * verifying membership and applying the same author-id obfuscation rules
 * the API route uses. Returns oldest-first (display order).
 *
 * Any failure returns an empty array so the client can render its
 * existing skeleton; the useCourseChat hook will then fall back to
 * sessionStorage cache + the /api/discussions/messages endpoint.
 */
async function fetchInitialMessages(courseId: string): Promise<ChatMessage[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: membership } = await supabase
      .from("course_memberships")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .is("deleted_at", null)
      .maybeSingle();
    if (!membership) return [];

    const { data: rows, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);
    if (error || !rows) return [];

    const userIsAdmin = isAdmin(user.email);
    const sanitized = rows.map((msg) => {
      if (userIsAdmin) return msg;
      if (msg.author_id === user.id) return msg;
      if (msg.author_name) return msg;
      return { ...msg, author_id: obfuscateAuthorId(msg.author_id, courseId) };
    });

    // API returns newest-first; reverse for oldest-first display order.
    return sanitized.reverse() as ChatMessage[];
  } catch {
    return [];
  }
}

export default async function CourseChatPage({ params }: PageProps) {
  const { courseId } = await params;
  const initialMessages = await fetchInitialMessages(courseId);

  return <ChatPageClient initialCourseId={courseId} initialMessages={initialMessages} />;
}
