"use client";

import { EyeOff } from "lucide-react";
import ChatModal from "./ChatModal";

/** A single reaction entry with user info for the detail modal. */
export interface ReactionDetail {
  userId: string;
  emoji: string;
  userName: string | null;
  userAvatar: string | null;
}

/**
 * Props for the reactions detail modal.
 *
 * @param open - Whether the modal is visible
 * @param reactions - Flat list of reaction entries; names come from the
 *                    room's member list (reactions are never anonymous,
 *                    a missing name means the member list has not loaded)
 * @param onClose - Fires on close, backdrop click, or Escape
 */
interface ReactionsDetailModalProps {
  open: boolean;
  reactions: ReactionDetail[];
  onClose: () => void;
}

/** Modal listing who reacted to a message and with what. */
export default function ReactionsDetailModal({ open, reactions, onClose }: ReactionsDetailModalProps) {
  return (
    <ChatModal open={open} onClose={onClose} title="Reactions" size="sm">
      {reactions.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No reactions yet</p>
      ) : (
        <ul className="-mx-4 -my-4 divide-y divide-border list-none">
          {reactions.map((r, i) => (
            <li key={`${r.userId}-${r.emoji}-${i}`} className="flex items-center gap-3 px-4 py-3">
              {r.userAvatar ? (
                <img src={r.userAvatar} alt="" referrerPolicy="no-referrer" className="w-9 h-9 rounded-full object-cover shrink-0" />
              ) : r.userName ? (
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-[13px] font-medium text-muted-foreground shrink-0" aria-hidden="true">
                  {r.userName[0]?.toUpperCase()}
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0" aria-hidden="true">
                  <EyeOff size={14} className="text-muted-foreground" />
                </div>
              )}
              <span className="flex-1 text-sm font-medium text-foreground truncate">{r.userName ?? "Classmate"}</span>
              <span className="text-lg shrink-0" aria-label={`Reacted with ${r.emoji}`}>{r.emoji}</span>
            </li>
          ))}
        </ul>
      )}
    </ChatModal>
  );
}
