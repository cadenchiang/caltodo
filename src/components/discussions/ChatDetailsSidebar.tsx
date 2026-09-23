"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, EyeOff, Bell, BellOff } from "lucide-react";
import MemberList from "@/components/discussions/MemberList";
import UserProfileModal from "@/components/discussions/UserProfileModal";
import ChatConfirmDialog from "@/components/discussions/ChatConfirmDialog";
import { HIDE_CHAT_COPY } from "@/components/discussions/ChatSidebar";
import { useToast } from "@/contexts/ToastContext";
import { NAME_KEY_PREFIX, isChatMuted, toggleMute as sharedToggleMute } from "@/lib/chat-actions";
import { hideChat } from "@/lib/chat-hide";

/**
 * Props for the ChatDetailsSidebar component.
 *
 * @param courseId - The active course UUID
 * @param courseName - The default course display name
 * @param onlineUserIds - Set of user IDs currently online in this room
 * @param onClose - Callback to close the sidebar
 * @param onNameOverride - Callback when user saves a nickname (null to clear)
 * @param onMuteChange - Callback when mute toggle changes
 * @param isSystemCourse - System courses have no nickname and are muted by default
 */
interface ChatDetailsSidebarProps {
  courseId: string;
  courseName: string;
  onlineUserIds: Set<string>;
  onClose: () => void;
  onNameOverride: (name: string | null) => void;
  onMuteChange: (muted: boolean) => void;
  isSystemCourse?: boolean;
}

/**
 * Right panel with room details: per-device nickname, mute toggle, the
 * member list, and Hide chat. Hide uses the same confirm copy as the list.
 */
export default function ChatDetailsSidebar({
  courseId,
  courseName,
  onlineUserIds,
  onClose,
  onNameOverride,
  onMuteChange,
  isSystemCourse = false,
}: ChatDetailsSidebarProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [nameInput, setNameInput] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showHideConfirm, setShowHideConfirm] = useState(false);
  const [hiding, setHiding] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  // Load persisted nickname and mute state after mount
  useEffect(() => {
    try {
      setNameInput(localStorage.getItem(NAME_KEY_PREFIX + courseId) ?? "");
    } catch {
      // localStorage unavailable
    }
    setIsMuted(isChatMuted(courseId, isSystemCourse));
  }, [courseId, isSystemCourse]);

  /**
   * Saves the nickname to localStorage and notifies the parent.
   * An empty value clears it. The nickname is per device and private, so
   * nothing is announced to the room.
   */
  const handleSaveName = useCallback(() => {
    const trimmed = nameInput.trim();
    try {
      if (trimmed) localStorage.setItem(NAME_KEY_PREFIX + courseId, trimmed);
      else localStorage.removeItem(NAME_KEY_PREFIX + courseId);
    } catch {
      // localStorage unavailable
    }
    onNameOverride(trimmed || null);
    setIsEditingName(false);
  }, [courseId, nameInput, onNameOverride]);

  const handleToggleMute = useCallback(() => {
    const newMuted = sharedToggleMute(courseId, isMuted);
    setIsMuted(newMuted);
    onMuteChange(newMuted);
  }, [courseId, isMuted, onMuteChange]);

  /** Hides the room, then returns to the list. */
  const handleHide = useCallback(async () => {
    setHiding(true);
    const ok = await hideChat(courseId, isSystemCourse);
    setHiding(false);
    if (!ok) {
      showToast("We couldn't hide that chat. Try again.", { variant: "error" });
      return;
    }
    setShowHideConfirm(false);
    router.push("/app/discussions");
  }, [courseId, isSystemCourse, router, showToast]);

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border shrink-0">
        <h2 className="text-base font-semibold text-foreground">Details</h2>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          aria-label="Close details"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {!isSystemCourse && (
          <>
            <div>
              <label htmlFor="chat-nickname" className="text-xs font-medium text-foreground">
                Nickname for this chat
              </label>
              <p id="chat-nickname-help" className="text-[11px] text-muted-foreground mt-0.5">
                Only on this device. Classmates still see the class name.
              </p>
              <input
                id="chat-nickname"
                type="text"
                aria-describedby="chat-nickname-help"
                value={isEditingName ? nameInput : nameInput || courseName}
                onChange={(e) => setNameInput(e.target.value)}
                onFocus={() => {
                  if (!isEditingName) {
                    setIsEditingName(true);
                    if (!nameInput) setNameInput(courseName);
                  }
                }}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  if (e.key === "Escape") {
                    setIsEditingName(false);
                    try {
                      setNameInput(localStorage.getItem(NAME_KEY_PREFIX + courseId) ?? "");
                    } catch { /* ignore */ }
                  }
                }}
                placeholder={courseName}
                maxLength={60}
                className="mt-1.5 w-full px-3 py-2 rounded-lg border border-input-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <hr className="border-border -mx-5" />
          </>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isMuted ? (
              <BellOff size={16} className="text-muted-foreground" aria-hidden="true" />
            ) : (
              <Bell size={16} className="text-muted-foreground" aria-hidden="true" />
            )}
            <span id="chat-mute-label" className="text-sm text-foreground">Mute messages</span>
          </div>
          <button
            type="button"
            onClick={handleToggleMute}
            className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${isMuted ? "bg-blue-500" : "bg-input-border"}`}
            role="switch"
            aria-checked={isMuted}
            aria-labelledby="chat-mute-label"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${isMuted ? "translate-x-4" : "translate-x-0"}`}
            />
          </button>
        </div>

        <hr className="border-border -mx-5" />

        <MemberList courseId={courseId} onlineUserIds={onlineUserIds} avatarSize="lg" onMemberClick={setProfileUserId} />

        <hr className="border-border -mx-5" />

        <button
          type="button"
          onClick={() => setShowHideConfirm(true)}
          className="flex items-center gap-2 px-3 py-2 -mx-3 text-sm rounded-xl text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <EyeOff size={15} aria-hidden="true" />
          <span>Hide chat</span>
        </button>
      </div>

      <ChatConfirmDialog
        open={showHideConfirm}
        title={HIDE_CHAT_COPY.title}
        description={HIDE_CHAT_COPY.description}
        confirmLabel={HIDE_CHAT_COPY.confirmLabel}
        loading={hiding}
        onConfirm={handleHide}
        onCancel={() => setShowHideConfirm(false)}
      />

      {profileUserId && (
        <UserProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} />
      )}
    </div>
  );
}
