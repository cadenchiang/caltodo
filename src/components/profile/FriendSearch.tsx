"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Search, UserPlus } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import Popover from "@/components/ui/Popover";
import UserAvatar from "@/components/ui/UserAvatar";
import { FIELD_INPUT } from "@/components/ui/field-recipe";
import type { FriendLists, SearchUser } from "./profile-utils";
import { getRelationship } from "./profile-utils";

/** Shortest query that triggers a search. */
const MIN_QUERY = 2;

interface FriendSearchProps {
  /** Current lists, to label each result's relationship. */
  lists: FriendLists;
  /** True while a request is being sent. */
  sending: boolean;
  /** Sends a request to the chosen user. */
  onSend: (userId: string) => Promise<unknown>;
}

/**
 * Search box with a results popover. Choosing a result with no existing
 * relationship sends a friend request. A failed search shows an inline
 * error with retry rather than an empty list.
 *
 * @param lists - Friend lists for relationship labels
 * @param sending - Disables results while a request is in flight
 * @param onSend - Sends the request
 */
export default function FriendSearch({ lists, sending, onSend }: FriendSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const debounced = useDebounce(query, 150);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounced.length < MIN_QUERY) {
      setResults([]);
      setError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(debounced)}`);
        if (!res.ok) throw new Error(`Search failed: ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setResults(data.users ?? []);
          setError(null);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("FriendSearch: search failed", { query: debounced, error: message, impact: "no results shown" });
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setSearching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debounced, attempt]);

  const open = query.length >= MIN_QUERY && (results.length > 0 || error !== null);

  /** Clears the query, which also closes the popover. */
  function close() {
    setQuery("");
    setResults([]);
    setError(null);
  }

  return (
    <div ref={wrapperRef} className="relative mb-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          aria-label="Search people by name or email"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className={`${FIELD_INPUT} pl-9 pr-9`}
        />
        {searching && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden="true" />
        )}
      </div>

      <Popover
        open={open}
        onClose={close}
        triggerRef={inputRef}
        autoFocus={false}
        aria-label="Search results"
        className="absolute left-0 right-0 top-full mt-1 z-dropdown max-h-[220px] overflow-y-auto"
      >
        {error ? (
          <div className="px-3 py-3 text-sm">
            <p className="text-danger">Search failed.</p>
            <button
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
              className="mt-1 text-xs font-medium text-blue-500 hover:underline cursor-pointer"
            >
              Try again
            </button>
          </div>
        ) : (
          results.map((user) => {
            const rel = getRelationship(user.id, lists);
            return (
              <button
                key={user.id}
                type="button"
                onClick={async () => {
                  if (rel) return;
                  await onSend(user.id);
                  close();
                }}
                disabled={sending || !!rel}
                className="flex items-center gap-3 w-full text-left px-3 py-2 hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer"
              >
                <UserAvatar url={user.avatar_url} name={user.full_name} email={user.email} size={28} />
                <div className="flex-1 min-w-0">
                  {user.full_name && <p className="text-sm font-medium text-foreground truncate">{user.full_name}</p>}
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                {rel === "friend" ? (
                  <span className="text-3xs text-muted-foreground font-medium">Friends</span>
                ) : rel === "pending_sent" ? (
                  <span className="text-3xs text-amber-500 font-medium">Request sent</span>
                ) : rel === "pending_received" ? (
                  <span className="text-3xs text-blue-500 font-medium">Wants to connect</span>
                ) : (
                  <UserPlus size={14} className="text-muted-foreground" aria-hidden="true" />
                )}
              </button>
            );
          })
        )}
      </Popover>
    </div>
  );
}
