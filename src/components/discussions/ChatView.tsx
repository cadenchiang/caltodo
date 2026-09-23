"use client";

import { useState, useCallback, useMemo } from "react";
import type { ChatMessage, CourseMemberProfile } from "@/lib/types";
import type { ReactionsMap } from "@/hooks/useMessageReactions";
import type { TypingUser } from "@/hooks/useTypingIndicator";
import { useChatScroll } from "@/hooks/useChatScroll";
import { useQuotedMessages } from "@/hooks/useQuotedMessages";
import { computeMessageLayout, computeAnonymousNumbers } from "@/lib/chat-message-layout";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import DateSeparator from "./DateSeparator";
import TypingIndicator from "./TypingIndicator";
import ChatConfirmDialog from "./ChatConfirmDialog";
import ReportMessageModal from "./ReportMessageModal";
import ReplyComposer from "./ReplyComposer";
import ReactionsDetailModal, { type ReactionDetail } from "./ReactionsDetailModal";
import { ChatMessagesSkeleton } from "./ChatSkeleton";
import { OfflineBanner, ErrorBanner, EmptyRoomState, NotMemberState } from "./ChatStateBanners";
import { ChevronDown } from "lucide-react";

/**
 * Props for the room view.
 *
 * @param courseId - The open room
 * @param messages - Oldest-first messages (blocked users already filtered)
 * @param myAuthorKey - The viewer's author key for this room (own-message test)
 * @param members - Room members, for resolving reaction names
 * @param onRetry - Resend a failed message
 * @param onRefetch - Reload after an error
 * @param notMember - Viewer is not in this room (replaces the composer)
 * @param online - Browser connectivity
 * @param onReported - Called after a report is sent, for a toast
 */
interface ChatViewProps {
  courseId: string;
  messages: ChatMessage[];
  loading: boolean;
  hasMore: boolean;
  initialFetchDone: boolean;
  sending: boolean;
  error: string | null;
  currentUserId: string;
  myAuthorKey: string | null;
  members: CourseMemberProfile[];
  isAdmin?: boolean;
  reactionsMap?: ReactionsMap;
  notMember: boolean;
  online: boolean;
  onSend: (body: string, files?: File[], anonymous?: boolean, replyToId?: string) => void;
  onRetry: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onRefetch: () => void;
  onToggleReaction?: (messageId: string, emoji: string, userId: string) => void;
  onLoadMore: () => void;
  onReported: () => void;
  typingUsers?: TypingUser[];
  onTyping?: () => void;
  onSendComplete?: () => void;
}

/**
 * Full-height chat view: scrollable messages, composer, reply mode, and
 * the unsend / report / reactions dialogs. Own messages are recognised by
 * author key; anonymous authors are numbered in order of first appearance.
 */
export default function ChatView({
  courseId, messages, loading, hasMore, initialFetchDone, sending, error, currentUserId, myAuthorKey, members, isAdmin,
  reactionsMap, notMember, online, onSend, onRetry, onDelete, onRefetch, onToggleReaction, onLoadMore, onReported,
  typingUsers, onTyping, onSendComplete,
}: ChatViewProps) {
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null);
  /** Anonymous mode lives here so the reply composer inherits it. */
  const [anonymous, setAnonymous] = useState(false);
  const [revealed, setRevealed] = useState<Map<string, { name: string; avatar: string | null }>>(new Map());
  const [unsendTargetId, setUnsendTargetId] = useState<string | null>(null);
  const [reportTargetId, setReportTargetId] = useState<string | null>(null);
  const [reactionDetailMessageId, setReactionDetailMessageId] = useState<string | null>(null);

  const scroll = useChatScroll(messages, initialFetchDone, hasMore, onLoadMore);
  const quoted = useQuotedMessages(courseId, messages);

  /** Toggles anonymous mode; switching it on clears any typing broadcast. */
  const handleAnonymousChange = useCallback((next: boolean) => {
    setAnonymous(next);
    if (next) onSendComplete?.();
  }, [onSendComplete]);

  const onRevealIdentity = useCallback((authorKey: string, name: string, avatar: string | null) => {
    setRevealed((prev) => new Map(prev).set(authorKey, { name, avatar }));
  }, []);

  const handleToggleReactionStable = useCallback(
    (messageId: string, emoji: string) => onToggleReaction?.(messageId, emoji, currentUserId),
    [onToggleReaction, currentUserId],
  );

  const messagesById = useMemo(() => new Map(messages.map((m) => [m.id, m])), [messages]);
  const anonymousNumbers = useMemo(() => computeAnonymousNumbers(messages), [messages]);
  const layout = useMemo(() => computeMessageLayout(messages), [messages]);
  const membersById = useMemo(() => new Map(members.map((m) => [m.user_id, m])), [members]);

  /** Resolves a quoted message from the loaded window or the fetched set. */
  const quotedFor = useCallback((msg: ChatMessage): ChatMessage | null => {
    if (!msg.reply_to_id) return null;
    return messagesById.get(msg.reply_to_id) ?? quoted.get(msg.reply_to_id) ?? null;
  }, [messagesById, quoted]);

  /** Reaction rows for the open detail modal, names from the member list. */
  const reactionDetails: ReactionDetail[] = useMemo(() => {
    if (!reactionDetailMessageId || !reactionsMap) return [];
    const details: ReactionDetail[] = [];
    for (const group of reactionsMap.get(reactionDetailMessageId) ?? []) {
      for (const userId of group.userIds) {
        const member = membersById.get(userId);
        details.push({ userId, emoji: group.emoji, userName: member?.user_name ?? null, userAvatar: member?.user_avatar ?? null });
      }
    }
    return details;
  }, [reactionDetailMessageId, reactionsMap, membersById]);

  const authorLabel = (m: ChatMessage) => m.author_name ?? `#${anonymousNumbers.get(m.author_key) ?? "?"}`;
  const isOwn = (m: ChatMessage) => (!!myAuthorKey && m.author_key === myAuthorKey) || m.id.startsWith("temp-");

  if (loading && messages.length === 0) {
    return (
      <div className="relative h-full overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto pb-24"><ChatMessagesSkeleton /></div>
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <ChatInput onSend={() => {}} disabled anonymous={false} onAnonymousChange={() => {}} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden flex flex-col">
      {!online && <OfflineBanner />}
      {error && messages.length > 0 && <ErrorBanner message={error} onRetry={onRefetch} />}

      <div className="relative flex-1 min-h-0">
        <div
          ref={scroll.scrollRef}
          onScroll={scroll.handleScroll}
          className="absolute inset-0 overflow-y-auto px-3 pt-3 pb-0"
          style={{ visibility: scroll.scrollReady || messages.length === 0 ? "visible" : "hidden" }}
          aria-busy={loading}
        >
          {/* Screen readers hear new messages as they arrive */}
          <div className="flex flex-col" role="log" aria-live="polite" aria-relevant="additions" aria-label="Messages">
            {messages.length === 0 && !loading && !error && <EmptyRoomState />}
            {messages.length === 0 && error && (
              <div className="py-16 text-center space-y-3 px-6">
                <p className="text-sm text-muted-foreground">{error}</p>
                <button type="button" onClick={onRefetch} className="px-4 py-2 text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors cursor-pointer">Try again</button>
              </div>
            )}

            {messages.length > 0 && (
              <div className="flex justify-center py-4 h-[44px]">
                {!hasMore && (
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(messages[0].created_at).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </span>
                )}
              </div>
            )}

            {messages.map((msg, i) => {
              const own = isOwn(msg);
              const quote = quotedFor(msg);
              return (
                <div key={msg.id} id={`msg-${msg.id}`} className="transition-colors duration-500 rounded-lg" style={{ contentVisibility: "auto", containIntrinsicSize: "auto 60px" }}>
                  {layout[i].showTimestamp && <DateSeparator date={msg.created_at} />}
                  <MessageBubble
                    message={msg}
                    isOwn={own}
                    showAuthor={layout[i].showAuthor}
                    isLastInGroup={layout[i].isLastInGroup}
                    isLastMessage={layout[i].isLastMessage}
                    anonymousNumber={!msg.author_name ? anonymousNumbers.get(msg.author_key) : undefined}
                    reactions={reactionsMap?.get(msg.id)}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                    revealedIdentity={revealed.get(msg.author_key)}
                    onRevealIdentity={onRevealIdentity}
                    replyTo={quote}
                    replyToAnonymousNumber={quote && !quote.author_name ? anonymousNumbers.get(quote.author_key) : undefined}
                    onDelete={own ? setUnsendTargetId : undefined}
                    onReport={!own ? setReportTargetId : undefined}
                    onReply={notMember ? undefined : setReplyTarget}
                    onRetry={onRetry}
                    onToggleReaction={onToggleReaction && !notMember ? handleToggleReactionStable : undefined}
                    onViewReactions={setReactionDetailMessageId}
                    onScrollToMessage={scroll.scrollToMessage}
                  />
                </div>
              );
            })}

            <TypingIndicator typingUsers={typingUsers ?? []} />
          </div>
          <div style={{ height: Math.max(scroll.bottomBarHeight + 20, 100) }} />
        </div>

        {scroll.showScrollBtn && (
          <div className="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5" style={{ bottom: scroll.bottomBarHeight + 12 }}>
            {scroll.newMessageCount > 0 && (
              <button type="button" onClick={() => scroll.scrollToBottom(true)} className="px-2.5 py-1 rounded-full bg-popover text-foreground border border-border shadow-sm text-[11px] whitespace-nowrap cursor-pointer">
                {scroll.newMessageCount === 1 ? "1 new message" : `${scroll.newMessageCount} new messages`}
              </button>
            )}
            <button type="button" onClick={() => scroll.scrollToBottom(true)} className="w-8 h-8 rounded-full bg-popover border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer" aria-label="Scroll to newest messages">
              <ChevronDown size={16} aria-hidden="true" />
            </button>
          </div>
        )}

        {!replyTarget && (
          <div ref={scroll.bottomBarRef} className="absolute bottom-0 left-0 right-0 z-10 bg-background/90 backdrop-blur-sm">
            {notMember ? (
              <NotMemberState />
            ) : (
              <ChatInput
                onSend={(body, files, anon) => { onSend(body, files, anon); onSendComplete?.(); }}
                disabled={sending}
                error={null}
                anonymous={anonymous}
                onAnonymousChange={handleAnonymousChange}
                onTyping={onTyping}
              />
            )}
          </div>
        )}

        {replyTarget && (
          <ReplyComposer
            target={replyTarget}
            targetLabel={authorLabel(replyTarget)}
            onSend={(body, files, anon) => { onSend(body, files, anon, replyTarget.id); setReplyTarget(null); onSendComplete?.(); }}
            onCancel={() => setReplyTarget(null)}
            sending={sending}
            error={error}
            anonymous={anonymous}
            onAnonymousChange={handleAnonymousChange}
            onTyping={onTyping}
          />
        )}
      </div>

      <ChatConfirmDialog
        open={unsendTargetId !== null}
        title="Unsend message?"
        description="This removes the message for everyone, but people may have already seen it. A reported message is kept for review."
        confirmLabel="Unsend"
        destructive
        onConfirm={() => { if (unsendTargetId) onDelete(unsendTargetId); setUnsendTargetId(null); }}
        onCancel={() => setUnsendTargetId(null)}
      />
      <ReportMessageModal messageId={reportTargetId} onClose={() => setReportTargetId(null)} onReported={onReported} />
      <ReactionsDetailModal open={reactionDetailMessageId !== null} reactions={reactionDetails} onClose={() => setReactionDetailMessageId(null)} />
    </div>
  );
}
