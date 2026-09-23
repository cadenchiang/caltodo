"use client";

import Link from "next/link";
import { ArrowLeft, Users, Info } from "lucide-react";
import GroupAvatar from "./GroupAvatar";
import { getInitials } from "@/lib/chat-utils";

/**
 * Props for the room header.
 *
 * @param displayName - Room title (nickname, board name, or the ?name= hint)
 * @param isSystemCourse - System rooms get the group icon
 * @param memberCount - Members in the room
 * @param hereCount - People present in the room right now
 * @param detailsOpen - Whether the details panel is open
 * @param onToggleDetails - Details toggle
 */
interface ChatRoomHeaderProps {
  displayName: string;
  isSystemCourse: boolean;
  memberCount: number;
  hereCount: number;
  detailsOpen: boolean;
  onToggleDetails: () => void;
}

/**
 * Room header: back to the list (a link to /app/discussions, not browser
 * history, so it works from a deep link), avatar, title, "N members, N
 * here", and the details toggle.
 */
export default function ChatRoomHeader({ displayName, isSystemCourse, memberCount, hereCount, detailsOpen, onToggleDetails }: ChatRoomHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-3 md:px-4 pt-[max(0.75rem,env(safe-area-inset-top))] md:pt-5 pb-3 border-b border-border shrink-0">
      <Link
        href="/app/discussions"
        className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-muted transition-colors md:hidden"
        aria-label="Back to all chats"
      >
        <ArrowLeft size={18} className="text-foreground" aria-hidden="true" />
      </Link>
      {isSystemCourse ? (
        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0" aria-hidden="true">
          <Users size={14} className="text-muted-foreground" />
        </div>
      ) : (
        <div className="shrink-0" aria-hidden="true">
          <GroupAvatar initials={getInitials(displayName)} name={displayName} size={28} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-foreground truncate">{displayName}</h1>
        <p className="text-[11px] h-[16px] text-muted-foreground">
          {memberCount > 0 && <span>{memberCount} {memberCount === 1 ? "member" : "members"}, </span>}
          <span className={hereCount > 0 ? "text-green-600 dark:text-green-400" : ""}>{hereCount} here</span>
        </p>
      </div>
      <button
        type="button"
        onClick={onToggleDetails}
        aria-pressed={detailsOpen}
        aria-label={detailsOpen ? "Hide chat details" : "Show chat details"}
        className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-muted transition-colors cursor-pointer"
      >
        <Info size={18} className="text-muted-foreground" aria-hidden="true" />
      </button>
    </div>
  );
}
