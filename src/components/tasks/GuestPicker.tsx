"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, UserPlus, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import UserAvatar from "@/components/ui/UserAvatar";

/**
 * User search result from the autocomplete API.
 */
interface SearchUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface GuestPickerProps {
  /** Currently selected guest emails. */
  selectedEmails: string[];
  /** Called when the email list changes (add or remove). */
  onEmailsChange: (emails: string[]) => void;
}

/**
 * Compact inline guest picker with debounced autocomplete.
 * Shows a search input, autocomplete dropdown, and selected guest chips.
 * Used inside task add forms to collect inviteEmails before task creation.
 *
 * @param selectedEmails - Array of currently selected email strings
 * @param onEmailsChange - Callback when emails are added or removed
 */
export default function GuestPicker({ selectedEmails, onEmailsChange }: GuestPickerProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 150);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Search users when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;

    async function search() {
      setSearching(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(debouncedQuery)}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          const alreadySelected = new Set(selectedEmails);
          const filtered = (data.users ?? []).filter(
            (u: SearchUser) => !alreadySelected.has(u.email)
          );
          setSuggestions(filtered);
        }
      } catch {
        // Non-critical
      } finally {
        if (!cancelled) setSearching(false);
      }
    }

    search();
    return () => { cancelled = true; };
  }, [debouncedQuery, selectedEmails]);

  /**
   * Adds an email to the selected list and clears the search.
   *
   * @param email - Email to add
   */
  function addEmail(email: string) {
    const trimmed = email.trim();
    if (!trimmed || selectedEmails.includes(trimmed)) return;
    onEmailsChange([...selectedEmails, trimmed]);
    setQuery("");
    setSuggestions([]);
    inputRef.current?.focus();
  }

  /**
   * Removes an email from the selected list.
   *
   * @param email - Email to remove
   */
  function removeEmail(email: string) {
    onEmailsChange(selectedEmails.filter((e) => e !== email));
  }

  /**
   * Handles Enter and Escape key events in the search input.
   */
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (suggestions.length > 0) {
        addEmail(suggestions[0].email);
      } else if (query.includes("@") && query.length >= 3) {
        addEmail(query);
      }
    }
  }

  return (
    <div className="space-y-2">
      {/* Selected guest chips */}
      {selectedEmails.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedEmails.map((email) => (
            <span
              key={email}
              className="inline-flex items-center gap-1 text-[11px] font-medium pl-2 pr-1 py-0.5 rounded-full border border-border bg-muted/50 text-foreground"
            >
              <span className="truncate max-w-[100px]">{email}</span>
              <button
                type="button"
                onClick={() => removeEmail(email)}
                className="text-muted-foreground hover:text-red-500 transition-colors p-0.5"
                aria-label={`Remove ${email}`}
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-input-border bg-transparent text-sm">
          <UserPlus size={13} className="text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search name or email..."
            className="flex-1 min-w-0 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none text-xs"
          />
          {searching && (
            <Loader2 size={12} className="animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Autocomplete dropdown */}
        {(suggestions.length > 0 || (query.includes("@") && query.length >= 3 && suggestions.length === 0 && !searching)) && (
          <div className="absolute left-0 right-0 top-full mt-1 z-30 rounded-lg border border-border bg-popover shadow-xl overflow-hidden max-h-[160px] overflow-y-auto">
            {suggestions.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => addEmail(user.email)}
                className="flex items-center gap-2.5 w-full text-left px-2.5 py-1.5 hover:bg-accent transition-colors"
              >
                <UserAvatar
                  url={user.avatar_url}
                  name={user.full_name}
                  email={user.email}
                  size={24}
                />
                <div className="flex-1 min-w-0">
                  {user.full_name && (
                    <p className="text-xs font-medium text-foreground truncate">{user.full_name}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                </div>
              </button>
            ))}
            {suggestions.length === 0 && query.includes("@") && query.length >= 3 && !searching && (
              <button
                type="button"
                onClick={() => addEmail(query)}
                className="flex items-center gap-2.5 w-full text-left px-2.5 py-1.5 hover:bg-accent transition-colors"
              >
                <UserPlus size={14} className="text-muted-foreground ml-1" />
                <span className="text-xs text-foreground">
                  Invite <span className="font-medium">{query}</span>
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
