"use client";

import { Loader2, X } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import UserAvatar from "@/components/ui/UserAvatar";
import type { FriendEntry } from "./profile-utils";

interface FriendRequestsProps {
  /** Requests other users sent to the signed-in user. */
  requests: FriendEntry[];
  /** Friendship id currently being responded to. */
  respondingId: string | null;
  /** Accepts or declines a request. */
  onRespond: (friendshipId: string, action: "accept" | "decline") => void;
}

/**
 * Received friend requests, each with Accept and Decline. Renders nothing
 * when there are none.
 *
 * @param requests - Pending received requests
 * @param respondingId - Row showing a spinner
 * @param onRespond - Accept or decline handler
 */
export default function FriendRequests({ requests, respondingId, onRespond }: FriendRequestsProps) {
  if (requests.length === 0) return null;
  return (
    <div className="rounded-xl border border-blue-200 dark:border-blue-800/40 border-l-4 border-l-blue-500 p-4">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-foreground">Friend requests</h3>
        <Badge variant="count">{requests.length}</Badge>
      </div>
      <ul className="flex flex-col gap-2">
        {requests.map((req) => {
          const busy = respondingId === req.friendshipId;
          return (
            <li key={req.friendshipId} className="flex items-center gap-3">
              <UserAvatar url={req.avatarUrl} name={req.fullName} email={req.email} size={36} />
              <div className="flex-1 min-w-0">
                {req.fullName && <p className="text-sm font-medium text-foreground truncate">{req.fullName}</p>}
                <p className="text-xs text-muted-foreground truncate">{req.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => onRespond(req.friendshipId, "accept")} disabled={busy}>
                  {busy ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : "Accept"}
                </Button>
                <IconButton
                  size="sm"
                  aria-label={`Decline request from ${req.fullName || req.email}`}
                  onClick={() => onRespond(req.friendshipId, "decline")}
                  disabled={busy}
                  className="hover:text-red-500"
                >
                  <X size={16} />
                </IconButton>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
