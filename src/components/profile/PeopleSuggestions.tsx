"use client";

import { UserPlus } from "lucide-react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import IconButton from "@/components/ui/IconButton";
import UserAvatar from "@/components/ui/UserAvatar";
import { PERSON_CARD } from "./FriendsList";
import { getRelationship, type FriendLists, type SearchUser } from "./profile-utils";

interface PeopleSuggestionsProps {
  people: SearchUser[];
  loading: boolean;
  /** Set when the load failed and nothing is cached. */
  error: string | null;
  /** Current lists, to hide the add control for existing relationships. */
  lists: FriendLists;
  /** True while a request is being sent. */
  sending: boolean;
  /** Retries the load. */
  onRetry: () => void;
  /** Opens the viewer for a person. */
  onView: (person: SearchUser) => void;
  /** Sends a friend request. */
  onSend: (userId: string) => void;
}

/**
 * "People you may know". Each card is a button that opens the viewer; the
 * add-friend control is a sibling IconButton, never nested inside the card.
 *
 * @remarks Renders nothing when there is nothing to show and no error.
 */
export default function PeopleSuggestions({
  people,
  loading,
  error,
  lists,
  sending,
  onRetry,
  onView,
  onSend,
}: PeopleSuggestionsProps) {
  if (!loading && !error && people.length === 0) return null;

  return (
    <div className="mt-6">
      <h4 className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-2">
        <UserPlus size={14} className="text-muted-foreground" aria-hidden="true" />
        People you may know
      </h4>

      {loading && people.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" aria-busy="true">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl border border-border animate-pulse">
              <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
              <div className="flex-1 h-3.5 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : error && people.length === 0 ? (
        <EmptyState
          title="Suggestions could not load"
          description="Check your connection and try again."
          action={
            <Button size="sm" variant="secondary" onClick={onRetry}>
              Try again
            </Button>
          }
          className="py-6"
        />
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {people.map((person) => {
            const rel = getRelationship(person.id, lists);
            const name = person.full_name || person.email;
            return (
              <li key={person.id} className="flex items-center gap-1">
                <button type="button" onClick={() => onView(person)} className={`${PERSON_CARD} flex-1 min-w-0`}>
                  <UserAvatar url={person.avatar_url} name={person.full_name} email={person.email} size={36} />
                  <span className="flex-1 min-w-0 text-sm font-medium text-foreground truncate">{name}</span>
                </button>
                {rel === "pending_sent" ? (
                  <span className="text-3xs text-amber-500 font-medium shrink-0 px-2">Sent</span>
                ) : (
                  <IconButton
                    aria-label={`Add ${name} as a friend`}
                    onClick={() => onSend(person.id)}
                    disabled={sending || !!rel}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <UserPlus size={16} />
                  </IconButton>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
