/**
 * Source-level checks for the chat product surface: the composer, states,
 * notification settings, moderation, touch/keyboard reach, dead code, and
 * the storage/moderation migrations. Each block names the finding it pins.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { SETTINGS_SECTIONS } from "@/lib/settingsConfig";
import { friendlyChatError } from "@/lib/chat-errors";
import { COUNTER_THRESHOLD } from "@/components/discussions/ChatInput";
import { nextFocusIndex } from "@/components/discussions/chatFocusTrap";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const exists = (rel: string) => fs.existsSync(path.join(ROOT, rel));
const DISC = "src/components/discussions";

describe("5: composer", () => {
  const input = read(`${DISC}/ChatInput.tsx`);
  it("has a send button that disables with a spinner while sending", () => {
    expect(input).toContain('aria-label={disabled ? "Sending" : "Send message"}');
    expect(input).toContain("disabled={!canSend}");
    expect(input).toContain("<Loader2");
  });
  it("sends on Enter only for fine pointers, Shift+Enter is a newline", () => {
    expect(input).toContain('window.matchMedia("(pointer: coarse)")');
    expect(input).toContain('e.key === "Enter" && !e.shiftKey && !coarsePointer');
  });
  it("shows a counter within 500 of the 5000 limit", () => {
    expect(COUNTER_THRESHOLD).toBe(4500);
    expect(input).toContain("{value.length}/{MAX_MESSAGE_LENGTH}");
  });
  it("keeps the text when a send is refused (nothing dropped silently)", () => {
    // handleSend returns before clearing the box when it cannot send.
    expect(input).toContain("if (!canSend) return;\n    onSend(");
  });
});

describe("6: states", () => {
  it("room has empty, not-a-member, offline and error-with-retry states", () => {
    const banners = read(`${DISC}/ChatStateBanners.tsx`);
    expect(banners).toContain("No messages yet");
    expect(banners).toContain("You&apos;re not in this chat");
    expect(banners).toContain("You&apos;re offline");
    expect(banners).toContain("Try again");
    const view = read(`${DISC}/ChatView.tsx`);
    expect(view).toContain("<NotMemberState />");
    expect(view).toContain("<OfflineBanner />");
    expect(view).toContain("<EmptyRoomState />");
  });
  it("failed bubbles offer tap-to-retry", () => {
    expect(read(`${DISC}/MessageBubble.tsx`)).toContain("Not sent. Tap to retry");
  });
  it("the list page shows a boards error with retry instead of a skeleton forever", () => {
    const page = read("src/app/app/discussions/page.tsx");
    expect(page).toContain("Chat didn&apos;t load");
    expect(page).toContain("onClick={() => refetch()}");
  });
});

describe("7: notifications", () => {
  it("has a Chat settings section with banners, sound and desktop toggles", () => {
    expect(SETTINGS_SECTIONS.map((s) => s.id)).toContain("chat");
    const section = read("src/components/settings/sections/ChatSection.tsx");
    expect(section).toContain('id="chat-pref-banners"');
    expect(section).toContain('id="chat-pref-sound"');
    expect(section).toContain('id="chat-pref-desktop"');
    expect(section).toContain("requestDesktopPermission()");
    expect(read("src/app/app/settings/SettingsContent.tsx")).toContain("<ChatSection />");
  });
  it("never requests Notification permission on page load", () => {
    for (const f of ["src/app/app/discussions/[courseId]/ChatPageClient.tsx", "src/hooks/useRoomNotifications.ts", "src/components/ui/GlobalChatNotifier.tsx"]) {
      expect(read(f)).not.toContain("Notification.requestPermission");
    }
  });
  it("marks the open room read as messages arrive while visible (M20)", () => {
    const hook = read("src/hooks/useRoomNotifications.ts");
    expect(hook).toContain('const visible = document.visibilityState === "visible";');
    expect(hook).toContain("if (visible) markAsRead(courseId);");
  });
  it("the notifier respects prefs, mute and hidden rooms", () => {
    const notifier = read("src/components/ui/GlobalChatNotifier.tsx");
    expect(notifier).toContain("if (prefs.sound) playMessageReceived();");
    expect(notifier).toContain("if (prefs.banners)");
    expect(notifier).toContain("isChatMuted(courseId, board.course.source === \"system\")");
    expect(notifier).toContain("!isBoardHidden(b)");
  });
});

describe("8: touch and keyboard", () => {
  it("message actions show on focus-within and coarse pointers", () => {
    const bubble = read(`${DISC}/MessageBubble.tsx`);
    expect(bubble).toContain("group-focus-within/msg:opacity-100 pointer-coarse:opacity-100");
    expect(read(`${DISC}/MessageToolbar.tsx`)).toContain('aria-label="More options"');
  });
  it("sidebar rows have a visible options button", () => {
    expect(read(`${DISC}/ChatRow.tsx`)).toContain("aria-label={`Options for ${displayName}`}");
  });
  it("member rows are buttons and the admin reveal is a labelled button", () => {
    expect(read(`${DISC}/MemberList.tsx`)).toContain("<button\n                type=\"button\"\n                onClick={() => onMemberClick?.(member.user_id)}");
    expect(read(`${DISC}/MessageBubble.tsx`)).toContain("aria-label={`Reveal who sent this");
  });
});

describe("9: reporting and moderation", () => {
  it("has no window.alert or window.confirm left in the chat", () => {
    for (const f of fs.readdirSync(path.join(ROOT, DISC))) {
      expect(read(`${DISC}/${f}`), f).not.toMatch(/\b(window\.)?(alert|confirm)\(/);
    }
  });
  it("reports carry a reason and dedupe per user per message", () => {
    const route = read("src/app/api/discussions/report/route.ts");
    expect(route).toContain("isReportReason(body.reason)");
    expect(route).toContain('.eq("reporter_id", user.id)');
    expect(route).toContain("status: 409");
    expect(read("supabase/migrations/20260923000002_chat_blocks_and_report_reasons.sql")).toContain("idx_message_reports_unique_reporter");
  });
  it("blocks are server-stored and the room filters by the blocked users' keys", () => {
    expect(exists("src/app/api/discussions/block/route.ts")).toBe(true);
    expect(read("src/app/app/discussions/[courseId]/ChatPageClient.tsx")).toContain("!blockedKeys.has(m.author_key)");
  });
  it("mounts the welcome modal on both chat pages and onboarding no longer pre-dismisses it", () => {
    expect(read("src/app/app/discussions/page.tsx")).toContain("<CalChatWelcomeModal />");
    expect(read("src/app/app/discussions/[courseId]/ChatPageClient.tsx")).toContain("<CalChatWelcomeModal />");
    const onboarding = read("src/app/app/onboarding/page.tsx");
    expect(onboarding).not.toContain("calchat_welcome: true");
    expect(onboarding).not.toContain('localStorage.setItem("calchat_welcome_accepted", "true")');
  });
});

describe("12: private realtime", () => {
  it("presence and typing channels are private and keyed by the user's own id", () => {
    expect(read("src/hooks/useRoomPresence.ts")).toContain("config: { private: true, presence: { key: currentUserId } }");
    expect(read("src/hooks/useTypingIndicator.ts")).toContain("config: { private: true, presence: { key: currentUserId } }");
    expect(read("src/lib/chat-realtime.ts")).toContain("{ config: { private: true } }");
    const sql = read("supabase/migrations/20260923000003_private_realtime_channels.sql");
    expect(sql).toContain("alter table realtime.messages enable row level security;");
    expect(sql).toContain("select public.get_my_course_ids()");
  });
});

describe("13 and 15: system events and room title", () => {
  it("has no client-only system events left", () => {
    expect(exists("src/hooks/chatSystemEvents.ts")).toBe(false);
    expect(read("src/hooks/useCourseChat.ts")).not.toContain("course_memberships");
    expect(read(`${DISC}/ChatDetailsSidebar.tsx`)).toContain("Nickname for this chat");
  });
  it("derives the title from boards with ?name= as a hint only", () => {
    expect(read("src/app/app/discussions/[courseId]/ChatPageClient.tsx")).toContain("activeBoard?.course.name ?? hintName");
  });
});

describe("16: attachments", () => {
  it("scopes uploads under the user's prefix and the bucket enforces size and type", () => {
    expect(read("src/lib/chat-upload.ts")).toContain("`${userId}/${courseId}/${Date.now()}");
    const sql = read("supabase/migrations/20260923000004_chat_attachments_storage_policy.sql");
    expect(sql).toContain("(storage.foldername(name))[1] = auth.uid()::text");
    expect(sql).toContain("file_size_limit = 10485760");
    expect(sql).toContain("for delete to authenticated");
  });
  it("renders foreign URLs as links with no referrer, never embeds", () => {
    const body = read(`${DISC}/MessageBody.tsx`);
    expect(body).toContain('referrerPolicy="no-referrer"');
    expect(body).toContain('rel="noopener noreferrer nofollow"');
  });
});

describe("17 to 19: design system, copy and accessibility", () => {
  it("has no hardcoded brand hex or zinc classes in the chat", () => {
    for (const f of fs.readdirSync(path.join(ROOT, DISC))) {
      if (f === "GroupAvatar.tsx") continue; // per-name avatar gradients, deliberate
      expect(read(`${DISC}/${f}`), f).not.toMatch(/#0e89d6|#E9E9EB|zinc-|gray-200|border-black\/30/);
    }
  });
  it("dialogs carry role, aria-modal and a focus trap", () => {
    const modal = read(`${DISC}/ChatModal.tsx`);
    expect(modal).toContain('role="dialog"');
    expect(modal).toContain('aria-modal="true"');
    expect(modal).toContain("trapTabKey(e, cardRef.current)");
    expect(modal).toContain("motion-reduce:animate-none");
    expect(nextFocusIndex(2, 3, false)).toBe(0);
    expect(nextFocusIndex(0, 3, true)).toBe(2);
    expect(nextFocusIndex(-1, 3, false)).toBe(0);
    expect(nextFocusIndex(0, 0, false)).toBe(-1);
  });
  it("announces incoming messages politely and labels the sidebar heading per the guide", () => {
    expect(read(`${DISC}/ChatView.tsx`)).toContain('role="log" aria-live="polite"');
    expect(read(`${DISC}/ChatSidebar.tsx`)).toContain('<h2 className="text-base font-semibold text-foreground">Chats</h2>');
  });
  it("uses the Pensieve spelling and lowercase caltodo", () => {
    expect(read("src/components/ui/CalChatLockedModal.tsx")).toContain("Pensieve");
    expect(read("src/components/ui/CalChatLockedModal.tsx")).not.toMatch(/Pensive\b/);
    expect(read(`${DISC}/CalChatWelcomeModal.tsx`)).toContain("caltodo admin");
  });
  it("the emoji picker follows the app theme, not the OS", () => {
    expect(read(`${DISC}/ChatEmojiPicker.tsx`)).toContain('theme={resolvedTheme === "dark" ? "dark" : "light"}');
  });
});

describe("21: plain error copy", () => {
  it("turns raw statuses into sentences", () => {
    expect(friendlyChatError(403, "Not enrolled in this course", "send")).toBe("You're not in this chat.");
    expect(friendlyChatError(403, "Complete onboarding to access Chat", "send")).toContain("Connect a class integration");
    expect(friendlyChatError(0, null, "send your message")).toContain("Check your connection");
    expect(friendlyChatError(500, "Failed to fetch messages", "load this chat")).not.toContain("500");
    expect(friendlyChatError(422, "Message contains inappropriate content", "send")).toBe("Message contains inappropriate content");
  });
});

describe("22: load cost", () => {
  it("prefetches rooms on hover / focus, not all on mount", () => {
    expect(read(`${DISC}/ChatRow.tsx`)).toContain("onMouseEnter={() => prefetchRoom(board.course.id)}");
    expect(read(`${DISC}/ChatSidebar.tsx`)).not.toContain("prefetchMessages");
    expect(read("src/app/app/discussions/page.tsx")).not.toContain("prefetchMessages");
  });
  it("pages members and reactions", () => {
    expect(read("src/app/api/discussions/members/route.ts")).toContain("X-Total-Count");
    expect(read("src/app/api/discussions/reactions/route.ts")).toContain('.in("message_id", messageIds)');
  });
  it("hydrates session caches in effects, not initializers", () => {
    expect(read("src/hooks/useDiscussionBoards.ts")).toContain("useState<DiscussionBoard[]>([])");
    expect(read("src/hooks/useChatMembers.ts")).toContain("useState<CourseMemberProfile[]>([])");
  });
});

describe("23: dead code", () => {
  it("is gone", () => {
    for (const f of [
      "src/components/ui/CalChatAnnouncementModal.tsx",
      `${DISC}/BoardList.tsx`,
      `${DISC}/BoardCard.tsx`,
      `${DISC}/EmptyBoardState.tsx`,
      `${DISC}/UnsendConfirmModal.tsx`,
      `${DISC}/LeaveGroupModal.tsx`,
    ]) {
      expect(exists(f), f).toBe(false);
    }
    expect(read("src/components/ui/CalChatLockedModal.tsx")).not.toContain("isTourActive");
    expect(read("src/hooks/useCourseChat.ts")).not.toContain("spamCooldown");
    expect(read("src/app/app/discussions/loading.tsx")).toContain("<ChatPageSkeleton />");
    expect(read("src/lib/constants.ts")).not.toContain("was removed from the product");
  });
});
