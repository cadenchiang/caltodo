"use client";

import { useMemo } from "react";
import { useChatMembers } from "@/hooks/useChatMembers";

/**
 * Props for MemberList.
 *
 * @param courseId - The course UUID to list members for
 * @param onlineUserIds - Ids present in this room right now
 * @param avatarSize - "default" (36px) or "lg" (56px)
 * @param onMemberClick - Opens a member's profile
 */
interface MemberListProps {
  courseId: string;
  onlineUserIds?: Set<string>;
  avatarSize?: "default" | "lg";
  onMemberClick?: (userId: string) => void;
}

/**
 * Members of the room, those present first, then alphabetical. Rows are
 * real buttons so they work with a keyboard. Loads 50 at a time with a
 * "Show more" button; the header shows the total from the server.
 */
export default function MemberList({ courseId, onlineUserIds, avatarSize = "default", onMemberClick }: MemberListProps) {
  const isLg = avatarSize === "lg";
  const { members, total, loading, hasMore, loadMore } = useChatMembers(courseId);

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const aHere = onlineUserIds?.has(a.user_id) ? 0 : 1;
      const bHere = onlineUserIds?.has(b.user_id) ? 0 : 1;
      if (aHere !== bHere) return aHere - bHere;
      return (a.user_name ?? "").localeCompare(b.user_name ?? "");
    });
  }, [members, onlineUserIds]);

  const hereCount = useMemo(
    () => (onlineUserIds ? members.filter((m) => onlineUserIds.has(m.user_id)).length : 0),
    [members, onlineUserIds],
  );

  if (loading && members.length === 0) {
    return (
      <div className="animate-pulse motion-reduce:animate-none" aria-hidden="true">
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

  const avatarClass = isLg ? "w-14 h-14" : "w-9 h-9";

  return (
    <div>
      <div className="flex items-center gap-2 pb-3">
        <h3 className="text-xs font-medium text-foreground">
          {total || members.length} {(total || members.length) === 1 ? "member" : "members"}
        </h3>
        <span className={`text-xs font-medium ${hereCount > 0 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
          {hereCount} here
        </span>
      </div>

      <ul className="space-y-0.5 list-none">
        {sortedMembers.map((member) => {
          const isHere = onlineUserIds?.has(member.user_id);
          const label = member.user_name ?? "Classmate";
          return (
            <li key={member.user_id}>
              <button
                type="button"
                onClick={() => onMemberClick?.(member.user_id)}
                disabled={!onMemberClick}
                className="flex items-center gap-3 py-2 px-2 -mx-2 w-[calc(100%+1rem)] rounded-xl text-left hover:bg-muted transition-colors cursor-pointer disabled:cursor-default disabled:hover:bg-transparent"
              >
                <div className="relative shrink-0">
                  {member.user_avatar ? (
                    <img src={member.user_avatar} alt="" referrerPolicy="no-referrer" className={`${avatarClass} rounded-full object-cover`} />
                  ) : (
                    <div className={`${avatarClass} rounded-full bg-muted flex items-center justify-center font-medium text-muted-foreground ${isLg ? "text-lg" : "text-sm"}`} aria-hidden="true">
                      {label[0]?.toUpperCase()}
                    </div>
                  )}
                  {isHere && (
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 rounded-full bg-green-500 border-2 border-card ${isLg ? "w-3.5 h-3.5" : "w-3 h-3"}`}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <span className={`text-foreground truncate ${isLg ? "text-[15px]" : "text-sm"}`}>
                  {label}
                  {isHere && <span className="sr-only"> (here now)</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <div className="pt-2">
          <button type="button" onClick={loadMore} className="text-xs text-blue-500 hover:text-blue-600 font-medium cursor-pointer">
            Show more ({total - members.length} more)
          </button>
        </div>
      )}
    </div>
  );
}
