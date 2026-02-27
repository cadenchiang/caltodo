"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { CalendarDays, Loader2, Tag, UserPlus, X } from "lucide-react";
import type { TaskInsert } from "@/lib/types";
import { DEFAULT_TASK_COLOR } from "@/lib/constants";
import ColorWheel from "@/components/ui/ColorWheel";
import { getRepeatLabel } from "@/lib/repeat";
import { useTaskContext } from "@/contexts/TaskContext";
import useClickOutside from "@/hooks/useClickOutside";
import { useDebounce } from "@/hooks/useDebounce";
import UserAvatar from "@/components/ui/UserAvatar";
import DatePicker from "./DatePicker";
import TagPicker from "./TagPicker";
import Popover from "@/components/ui/Popover";

/**
 * User search result from the autocomplete API.
 */
interface SearchUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface TaskAddPopoverProps {
  date: string;
  anchorRect: DOMRect;
  onClose: () => void;
  onAdd: (task: TaskInsert) => void;
}

/**
 * Computes popover position relative to the viewport.
 * Positions below and centered on the anchor, flipping if needed.
 *
 * @param anchorRect - Bounding rect of the clicked day cell
 * @returns CSS position properties for the popover
 */
function computePosition(anchorRect: DOMRect): { top: number; left: number } {
  const popoverWidth = Math.min(340, window.innerWidth - 16);
  const popoverHeight = 300;
  const margin = 8;

  let left = anchorRect.left + anchorRect.width / 2 - popoverWidth / 2;
  let top = anchorRect.bottom + margin;

  if (left + popoverWidth > window.innerWidth) {
    left = window.innerWidth - popoverWidth - margin;
  }
  if (left < margin) {
    left = margin;
  }
  if (top + popoverHeight > window.innerHeight) {
    top = anchorRect.top - popoverHeight - margin;
  }
  if (top < margin) {
    top = margin;
  }

  return { top, left };
}

/**
 * Google Calendar-style quick-add popup for creating a task on a specific date.
 * Rendered via portal, positioned next to the clicked day cell.
 * Color picker and date/time picker appear as floating popups above the toolbar.
 *
 * @param date - The date string (YYYY-MM-DD) for the new task
 * @param anchorRect - DOMRect from the clicked day cell for positioning
 * @param onClose - Callback to close the popover
 * @param onAdd - Callback with the new task data
 */
type RepeatUnit = "day" | "week" | "month";

/**
 * Formats a 24-hour time string "HH:MM" to 12-hour format "h:mm AM/PM".
 *
 * @param time24 - Time string in "HH:MM" format (e.g. "14:30")
 * @returns Formatted time string (e.g. "2:30 PM")
 */
function formatTime12h(time24: string): string {
  const [hourStr, minute] = time24.split(":");
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minute} ${ampm}`;
}

export default function TaskAddPopover({ date, anchorRect, onClose, onAdd }: TaskAddPopoverProps) {
  const { availableTags } = useTaskContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(DEFAULT_TASK_COLOR);
  const [dueDate, setDueDate] = useState<string>(date);
  const [dueTime, setDueTime] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [repeatInterval, setRepeatInterval] = useState<number | null>(null);
  const [repeatUnit, setRepeatUnit] = useState<RepeatUnit | null>(null);
  const [repeatEndDate, setRepeatEndDate] = useState<string | null>(null);
  const [repeatEndCount, setRepeatEndCount] = useState<number | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Invite state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteQuery, setInviteQuery] = useState("");
  const [inviteSuggestions, setInviteSuggestions] = useState<SearchUser[]>([]);
  const [searchingInvite, setSearchingInvite] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<SearchUser[]>([]);
  const debouncedInviteQuery = useDebounce(inviteQuery, 150);

  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inviteInputRef = useRef<HTMLInputElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const tagButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [mounted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showColorPicker || showDatePicker || showTagPicker) {
          setShowColorPicker(false);
          setShowDatePicker(false);
          setShowTagPicker(false);
        } else if (showInvite) {
          setShowInvite(false);
          setInviteQuery("");
          setInviteSuggestions([]);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, showColorPicker, showDatePicker, showTagPicker, showInvite]);

  const handleClickOutside = useCallback(() => {
    if (!showColorPicker && !showDatePicker && !showTagPicker && !showInvite) {
      onClose();
    }
  }, [onClose, showColorPicker, showDatePicker, showTagPicker, showInvite]);

  useClickOutside(ref, handleClickOutside, mounted);

  // Search users for invite autocomplete
  useEffect(() => {
    if (debouncedInviteQuery.length < 2) {
      setInviteSuggestions([]);
      return;
    }
    let cancelled = false;
    async function search() {
      setSearchingInvite(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(debouncedInviteQuery)}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          const invitedEmails = new Set(invitedUsers.map((u) => u.email));
          setInviteSuggestions(
            (data.users ?? []).filter((u: SearchUser) => !invitedEmails.has(u.email))
          );
        }
      } catch { /* non-critical */ }
      finally { if (!cancelled) setSearchingInvite(false); }
    }
    search();
    return () => { cancelled = true; };
  }, [debouncedInviteQuery, invitedUsers]);

  // Focus invite input when expanded
  useEffect(() => {
    if (showInvite) inviteInputRef.current?.focus();
  }, [showInvite]);

  /**
   * Handles form submission — creates a task with title, date, time, color, description.
   *
   * @param e - Form submit event
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd({
      title: trimmed,
      due_date: dueDate,
      due_time: dueTime,
      description: description.trim() || "",
      color,
      tags: tags.length > 0 ? tags : undefined,
      repeat_interval: repeatInterval,
      repeat_unit: repeatUnit,
      repeat_end_date: repeatEndDate,
      repeat_end_count: repeatEndCount,
      inviteEmails: invitedUsers.length > 0 ? invitedUsers.map((u) => u.email) : undefined,
    });
    onClose();
  }

  if (!mounted) return null;

  const pos = computePosition(anchorRect);

  return createPortal(
    <div
      ref={ref}
      className={`fixed z-50 w-[min(340px,calc(100vw-16px))] overflow-visible bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-border transition-all duration-150 ease-out ${
        visible
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 -translate-y-1"
      }`}
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="px-4 pt-4 pb-3">
        <form onSubmit={handleSubmit}>
          {/* Title input */}
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full text-sm text-foreground bg-transparent focus:outline-none placeholder-subtle-foreground mb-3"
          />

          {/* Toolbar row: color dot + calendar icon with date badge */}
          <div className="relative flex items-center gap-2 mb-2">
            {/* Color dot toggle */}
            <button
              ref={colorButtonRef}
              type="button"
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowDatePicker(false);
                setShowTagPicker(false);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                showColorPicker ? "bg-accent" : "hover:bg-accent"
              }`}
              aria-label="Pick color"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              />
            </button>

            {/* Calendar icon + date badge */}
            <button
              ref={dateButtonRef}
              type="button"
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                setShowColorPicker(false);
                setShowTagPicker(false);
              }}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors ${
                showDatePicker
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              aria-label="Pick date and time"
            >
              <CalendarDays size={14} />
              <span>{format(new Date(dueDate + "T00:00:00"), "MMM d")}</span>
              {dueTime && (
                <span className="text-blue-500 font-medium">{formatTime12h(dueTime)}</span>
              )}
            </button>

            {/* Tag icon */}
            <button
              ref={tagButtonRef}
              type="button"
              onClick={() => {
                setShowTagPicker(!showTagPicker);
                setShowColorPicker(false);
                setShowDatePicker(false);
              }}
              className={`p-1.5 rounded-lg hover:bg-accent transition-colors ${
                tags.length > 0 ? "text-blue-500" : "text-subtle-foreground hover:text-blue-500"
              }`}
              aria-label="Add tags"
            >
              <Tag size={14} />
            </button>

            {/* Selected tag badge */}
            {tags.length > 0 && (
              <span className="text-[10px] text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded shrink-0">
                {tags.length === 1 ? tags[0] : `${tags.length} tags`}
              </span>
            )}

            {/* Repeat badge */}
            {repeatInterval && repeatUnit && (
              <span className="text-[10px] text-purple-500 bg-purple-50 dark:bg-purple-900/30 px-1.5 py-0.5 rounded shrink-0">
                {getRepeatLabel(repeatInterval, repeatUnit)}
              </span>
            )}

            {/* Invite person icon */}
            <button
              type="button"
              onClick={() => {
                setShowInvite(!showInvite);
                setShowColorPicker(false);
                setShowDatePicker(false);
                setShowTagPicker(false);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                showInvite || invitedUsers.length > 0
                  ? "text-blue-500 bg-accent"
                  : "text-subtle-foreground hover:text-blue-500 hover:bg-accent"
              }`}
              aria-label="Invite people"
            >
              <UserPlus size={14} />
            </button>

            {/* Invited count badge */}
            {invitedUsers.length > 0 && (
              <span className="text-[10px] text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded shrink-0">
                {invitedUsers.length === 1 ? invitedUsers[0].full_name || invitedUsers[0].email : `${invitedUsers.length} people`}
              </span>
            )}

            {/* Color picker popup */}
            <Popover
              open={showColorPicker}
              onClose={() => setShowColorPicker(false)}
              triggerRef={colorButtonRef}
              className="absolute left-0 top-full mt-1 z-10"
            >
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-border p-3">
                <ColorWheel
                  value={color}
                  onChange={(c) => {
                    setColor(c);
                    setShowColorPicker(false);
                  }}
                />
              </div>
            </Popover>

            {/* Date picker popup */}
            <Popover
              open={showDatePicker}
              onClose={() => setShowDatePicker(false)}
              triggerRef={dateButtonRef}
              className="absolute left-0 top-full mt-1 z-10"
            >
              <DatePicker
                value={dueDate}
                timeValue={dueTime}
                onChange={(d) => {
                  if (d) setDueDate(d);
                }}
                onTimeChange={(t) => setDueTime(t)}
                repeatInterval={repeatInterval}
                repeatUnit={repeatUnit}
                onRepeatChange={(interval, unit) => {
                  setRepeatInterval(interval);
                  setRepeatUnit(unit);
                  if (!interval || !unit) {
                    setRepeatEndDate(null);
                    setRepeatEndCount(null);
                  }
                }}
                repeatEndDate={repeatEndDate}
                repeatEndCount={repeatEndCount}
                onRepeatEndChange={(endDate, endCount) => {
                  setRepeatEndDate(endDate);
                  setRepeatEndCount(endCount);
                }}
              />
            </Popover>

            {/* Tag picker popup */}
            <Popover
              open={showTagPicker}
              onClose={() => setShowTagPicker(false)}
              triggerRef={tagButtonRef}
              className="absolute left-0 top-full mt-1 z-10"
            >
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-border p-3 w-52">
                <TagPicker
                  selectedTags={tags}
                  availableTags={availableTags}
                  onChange={setTags}
                />
              </div>
            </Popover>
          </div>

          {/* Invite search — inline expandable */}
          {showInvite && (
            <div className="mb-2">
              {/* Invited user chips */}
              {invitedUsers.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {invitedUsers.map((u) => (
                    <span
                      key={u.id}
                      className="inline-flex items-center gap-1 text-[11px] font-medium pl-1 pr-1.5 py-0.5 rounded-full border border-border bg-muted/50"
                    >
                      <UserAvatar url={u.avatar_url} name={u.full_name} email={u.email} size={16} />
                      <span className="text-foreground truncate max-w-[100px]">
                        {u.full_name || u.email}
                      </span>
                      <button
                        type="button"
                        onClick={() => setInvitedUsers((prev) => prev.filter((p) => p.id !== u.id))}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="relative">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-input-border bg-transparent text-xs">
                  <UserPlus size={12} className="text-muted-foreground shrink-0" />
                  <input
                    ref={inviteInputRef}
                    type="text"
                    value={inviteQuery}
                    onChange={(e) => setInviteQuery(e.target.value)}
                    placeholder="Search people to invite..."
                    className="flex-1 min-w-0 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none text-xs"
                  />
                  {searchingInvite && (
                    <Loader2 size={12} className="animate-spin text-muted-foreground" />
                  )}
                </div>
                {/* Autocomplete dropdown */}
                {inviteSuggestions.length > 0 && inviteQuery.length >= 2 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 rounded-lg border border-border bg-popover shadow-xl overflow-hidden max-h-[140px] overflow-y-auto">
                    {inviteSuggestions.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setInvitedUsers((prev) => [...prev, user]);
                          setInviteQuery("");
                          setInviteSuggestions([]);
                          inviteInputRef.current?.focus();
                        }}
                        className="flex items-center gap-2.5 w-full text-left px-2.5 py-1.5 hover:bg-accent transition-colors"
                      >
                        <UserAvatar url={user.avatar_url} name={user.full_name} email={user.email} size={24} />
                        <div className="flex-1 min-w-0">
                          {user.full_name && (
                            <p className="text-xs font-medium text-foreground truncate">{user.full_name}</p>
                          )}
                          <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description textarea */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Description (optional)"
            className="w-full text-xs text-secondary-foreground bg-transparent rounded-lg focus:outline-none resize-none placeholder-subtle-foreground mb-2"
          />

          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
