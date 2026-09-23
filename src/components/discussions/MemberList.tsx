"use client";

import { useState, useMemo } from "react";
import { useChatMembers } from "@/hooks/useChatMembers";
import { usePresence, type UserStatus } from "@/contexts/PresenceContext";

/**
 * Returns the Tailwind background class for a given user status.
 *
 * @param status - User status value
 * @returns Tailwind bg class string
 */
function statusDotColor(status: UserStatus): string {
  switch (status) {
    case "idle":
      return "bg-yellow-500";
    case "dnd":
      return "bg-red-500";
    default:
      return "bg-green-500";
  }
}

/**
 * Shows all members enrolled in a course with status-colored indicators.
 * Sorts online members to the top, then alphabetically within each group.
 * Computes per-chat online count (intersection of global online IDs and chat members).
 *
 * @param courseId - The course UUID to fetch members for
 * @param onlineUserIds - Set of user IDs currently online (from global Presence)
 * @param avatarSize - "default" (36px) or "lg" (56px) avatar rendering
 * @param onMemberClick - Callback when a member row is clicked (passes user ID)
 */
interface MemberListProps {
  courseId: string;
  onlineUserIds?: Set<string>;
  /** Avatar display size. "lg" renders 56px avatars for the details sidebar. */
  avatarSize?: "default" | "lg";
  /** Callback when a member row is clicked (passes user ID). */
  onMemberClick?: (userId: string) => void;
}

export default function MemberList({
  courseId,
  onlineUserIds,
  avatarSize = "default",
  onMemberClick,
}: MemberListProps) {
  const isLg = avatarSize === "lg";
  const { members, loading } = useChatMembers(courseId);
  const { userStatuses } = usePresence();
  const [expanded, setExpanded] = useState(false);

  // Sort: online members first, then alphabetical within each group
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const aOnline = onlineUserIds?.has(a.user_id) ? 0 : 1;
      const bOnline = onlineUserIds?.has(b.user_id) ? 0 : 1;
      if (aOnline !== bOnline) return aOnline - bOnline;
      return (a.user_name ?? "").localeCompare(b.user_name ?? "");
    });
  }, [members, onlineUserIds]);

  // Per-chat online count: only count members of THIS chat who are online
  const onlineCount = useMemo(() => {
    if (!onlineUserIds || onlineUserIds.size === 0) return 0;
    return members.filter((m) => onlineUserIds.has(m.user_id)).length;
  }, [members, onlineUserIds]);

  if (loading && members.length === 0) {
    return (
      <div className="animate-pulse">
        <div className="h-3 bg-muted rounded w-20 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-muted" />
              <div className="h-2.5 bg-muted rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (members.length === 0) return null;

  const visibleMembers = expanded ? sortedMembers : sortedMembers.slice(0, 8);

  return (
    <div>
      {/* Online / total count */}
      <div className="flex items-center gap-2 pb-3">
        <span className="text-[12px] font-medium text-muted-foreground">
          {members.length} members
        </span>
        <span className="text-[12px] font-medium">
          {onlineCount > 0 ? (
            <span className="text-green-500">{onlineCount} online</span>
          ) : (
            <span className="text-muted-foreground/40">0 online</span>
          )}
        </span>
      </div>

      {/* Member list */}
      <div className="space-y-0.5">
        {visibleMembers.map((member) => {
          const isOnline = onlineUserIds?.has(member.user_id);
          const status = userStatuses.get(member.user_id) ?? "online";
          const dotColor = statusDotColor(status);
          return (
            <div
              key={member.user_id}
              onClick={() => onMemberClick?.(member.user_id)}
              className={`flex items-center gap-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 px-2 -mx-2 transition-colors ${onMemberClick ? "cursor-pointer" : ""}`}
            >
              <div className="relative shrink-0">
                {member.user_avatar ? (
                  <img
                    src={member.user_avatar}
                    alt=""
                    referrerPolicy="no-referrer"
                    className={
                      isLg
                        ? "w-14 h-14 rounded-full object-cover"
                        : "w-9 h-9 rounded-full object-cover"
                    }
                  />
                ) : (
                  <div
                    className={
                      isLg
                        ? "w-14 h-14 rounded-full bg-muted flex items-center justify-center text-lg font-medium text-muted-foreground"
                        : "w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground"
                    }
                  >
                    {(member.user_name ?? "?")[0]?.toUpperCase()}
                  </div>
                )}
                {isOnline && (
                  <span
                    className={
                      isLg
                        ? `absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${dotColor} border-[2.5px] border-white dark:border-zinc-900`
                        : `absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${dotColor} border-2 border-white dark:border-zinc-900`
                    }
                  />
                )}
              </div>
              <span
                className={
                  isLg
                    ? "text-[15px] text-foreground truncate"
                    : "text-[14px] text-foreground truncate"
                }
              >
                {member.user_name ?? "Unknown"}
              </span>
            </div>
          );
        })}
      </div>

      {members.length > 8 && (
        <div className="pt-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] text-blue-500 hover:text-blue-600 font-medium cursor-pointer"
          >
            {expanded ? "Show less" : `Show all ${members.length}`}
          </button>
        </div>
      )}
    </div>
  );
}
