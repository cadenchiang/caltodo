"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ProfileHeader from "./ProfileHeader";
import FriendRequests from "./FriendRequests";
import FriendSearch from "./FriendSearch";
import FriendsList from "./FriendsList";
import PeopleSuggestions from "./PeopleSuggestions";
import UserViewerModal from "./UserViewerModal";
import { useFriends } from "./useFriends";
import { useSuggestions } from "./useSuggestions";
import { toSearchUser, type FriendEntry, type SearchUser } from "./profile-utils";

/**
 * Profile page: the signed-in user's header, friend requests, friend search,
 * the friends list, and people they may know. Composes the focused pieces
 * under components/profile; owns only the viewer selection and the
 * remove-friend confirmation the list asks for.
 */
export default function ProfileSection() {
  const { showToast } = useToast();
  const friends = useFriends();
  const suggestions = useSuggestions();
  const [viewing, setViewing] = useState<SearchUser | null>(null);
  const [removing, setRemoving] = useState<FriendEntry | null>(null);

  const lists = { friends: friends.friends, pendingReceived: friends.pendingReceived, pendingSent: friends.pendingSent };

  /** Sends a request and offers Undo on the success toast. */
  async function sendWithUndo(userId: string) {
    const friendshipId = await friends.sendRequest(userId);
    if (!friendshipId) return;
    void suggestions.refresh();
    showToast("Friend request sent.", {
      action: { label: "Undo", onClick: () => void friends.remove(friendshipId) },
    });
  }

  /** Removes the friend the list asked about, then closes the confirm. */
  async function confirmRemove() {
    if (!removing) return;
    try {
      await friends.remove(removing.friendshipId);
    } finally {
      setRemoving(null);
    }
  }

  return (
    <section className="space-y-6">
      <ProfileHeader friendCount={friends.friends.length} />

      <FriendRequests requests={friends.pendingReceived} respondingId={friends.respondingId} onRespond={friends.respond} />

      <div>
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-3">
          <Users size={14} className="text-muted-foreground" aria-hidden="true" />
          Friends {!friends.loading && `(${friends.friends.length})`}
        </h3>

        <FriendSearch lists={lists} sending={friends.sending} onSend={sendWithUndo} />

        <FriendsList
          friends={friends.friends}
          pendingSent={friends.pendingSent}
          loading={friends.loading}
          error={friends.error}
          removingId={friends.removingId}
          onRetry={() => void friends.refresh()}
          onView={(friend) => setViewing(toSearchUser(friend))}
          onRemove={setRemoving}
          onCancelRequest={(id) => void friends.remove(id)}
        />

        <PeopleSuggestions
          people={suggestions.people}
          loading={suggestions.loading}
          error={suggestions.error}
          lists={lists}
          sending={friends.sending}
          onRetry={() => void suggestions.refresh()}
          onView={setViewing}
          onSend={(id) => void sendWithUndo(id)}
        />
      </div>

      <UserViewerModal
        user={viewing}
        lists={lists}
        sending={friends.sending}
        onClose={() => setViewing(null)}
        onSend={sendWithUndo}
        onRespond={friends.respond}
        onRemove={friends.remove}
      />

      <ConfirmDialog
        open={removing !== null}
        title={`Remove ${removing?.fullName || removing?.email || "this friend"} as a friend?`}
        body="They will not be notified. You can send a new request later."
        confirmLabel="Remove friend"
        destructive
        loading={removing !== null && friends.removingId === removing.friendshipId}
        onConfirm={confirmRemove}
        onCancel={() => setRemoving(null)}
      />
    </section>
  );
}
