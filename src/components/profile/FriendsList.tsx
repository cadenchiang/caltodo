"use client";

import { Loader2, Send, UserMinus, Users, X } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import IconButton from "@/components/ui/IconButton";
import UserAvatar from "@/components/ui/UserAvatar";
import type { FriendEntry } from "./profile-utils";

/** Card recipe shared by friend and suggestion cards. */
export const PERSON_CARD =
  "flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card hover:bg-accent transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

interface FriendsListProps {
  friends: FriendEntry[];
  pendingSent: FriendEntry[];
  loading: boolean;
  /** Set when the last load failed and nothing is cached. */
  error: string | null;
  /** Friendship id being removed, for its spinner. */
  removingId: string | null;
  /** Retries the load. */
  onRetry: () => void;
  /** Opens the viewer for a friend. */
  onView: (friend: FriendEntry) => void;
  /** Asks to remove a friend (the parent confirms). */
  onRemove: (friend: FriendEntry) => void;
  /** Cancels a sent request. */
  onCancelRequest: (friendshipId: string) => void;
}

/**
 * The friends grid and the sent-requests list. Each friend card is a button
 * that opens the viewer; the remove control sits beside it, always visible,
 * never nested inside the card button.
 *
 * @remarks A failed load renders an error state with retry, not "No friends
 *          yet".
 */
export default function FriendsList({
  friends,
  pendingSent,
  loading,
  error,
  removingId,
  onRetry,
  onView,
  onRemove,
  onCancelRequest,
}: FriendsListProps) {
  if (loading) {
    return <p className="text-xs text-muted-foreground py-2">Loading...</p>;
  }
  if (error && friends.length === 0 && pendingSent.length === 0) {
    return (
      <EmptyState
        title="Friends could not load"
        description="Check your connection and try again."
        action={
          <Button size="sm" variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        }
        className="py-6"
      />
    );
  }
  if (friends.length === 0 && pendingSent.length === 0) {
    return (
      <EmptyState
        icon={<Users size={20} />}
        title="No friends yet"
        description="Search above to send a request."
        className="py-6"
      />
    );
  }

  return (
    <>
      {friends.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {friends.map((friend) => {
            const name = friend.fullName || friend.email;
            const busy = removingId === friend.friendshipId;
            return (
              <li key={friend.friendshipId} className="flex items-center gap-1">
                <button type="button" onClick={() => onView(friend)} className={`${PERSON_CARD} flex-1 min-w-0`}>
                  <UserAvatar url={friend.avatarUrl} name={friend.fullName} email={friend.email} size={40} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-foreground truncate">{name}</span>
                    <span className="block text-xs text-muted-foreground truncate">{friend.email}</span>
                  </span>
                </button>
                <IconButton
                  aria-label={`Remove ${name} as a friend`}
                  onClick={() => onRemove(friend)}
                  disabled={busy}
                  className="hover:text-red-500"
                >
                  {busy ? <Loader2 size={14} className="animate-spin" /> : <UserMinus size={14} />}
                </IconButton>
              </li>
            );
          })}
        </ul>
      )}

      {pendingSent.length > 0 && (
        <div className="mt-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-2">
            <Send size={12} aria-hidden="true" />
            Sent requests
          </p>
          <ul className="flex flex-col gap-1">
            {pendingSent.map((req) => {
              const name = req.fullName || req.email;
              const busy = removingId === req.friendshipId;
              return (
                <li key={req.friendshipId} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <UserAvatar url={req.avatarUrl} name={req.fullName} email={req.email} size={28} />
                  <div className="flex-1 min-w-0">
                    {req.fullName && <p className="text-sm font-medium text-foreground truncate">{req.fullName}</p>}
                    <p className="text-xs text-muted-foreground truncate">{req.email}</p>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                  <IconButton
                    size="sm"
                    aria-label={`Cancel request to ${name}`}
                    onClick={() => onCancelRequest(req.friendshipId)}
                    disabled={busy}
                    className="hover:text-red-500"
                  >
                    {busy ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                  </IconButton>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
