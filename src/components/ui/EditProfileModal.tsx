"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Camera, Check, Loader2, X } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { classifyImage } from "@/lib/nsfw-check";

interface EditProfileModalProps {
  /** Whether the modal is open. */
  open: boolean;
  /** Callback to close the modal. */
  onClose: () => void;
  /** Current avatar URL from profile. */
  avatarUrl?: string | null;
  /** Current full name from profile. */
  fullName?: string | null;
  /** Current email (read-only display). */
  email?: string | null;
}

/**
 * Modal for editing user profile (avatar and name).
 * Uploads avatar via /api/account/avatar, saves name via PUT /api/account/name.
 * Dispatches "profile-updated" CustomEvent on success for sidebar sync.
 *
 * @param open - Controls modal visibility
 * @param onClose - Callback to dismiss the modal
 * @param avatarUrl - Current avatar URL
 * @param fullName - Current display name
 * @param email - Current email (read-only)
 */
export default function EditProfileModal({
  open,
  onClose,
  avatarUrl,
  fullName,
  email,
}: EditProfileModalProps) {
  const { showToast } = useToast();
  const [closing, setClosing] = useState(false);
  const [localAvatar, setLocalAvatar] = useState(avatarUrl ?? null);
  const [nameInput, setNameInput] = useState(fullName ?? "");
  const [uploading, setUploading] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Sync props when modal opens
  useEffect(() => {
    if (open) {
      setLocalAvatar(avatarUrl ?? null);
      setNameInput(fullName ?? "");
      setImgError(false);
      setClosing(false);
    }
  }, [open, avatarUrl, fullName]);

  // Focus name input on open
  useEffect(() => {
    if (open && nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 150);
    }
  }, [open]);

  /**
   * Animates the modal closed then calls onClose.
   */
  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => onClose(), 150);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleClose]);

  /**
   * Returns a high-resolution version of an avatar URL.
   * Google avatar URLs default to 96px; this upgrades to 256px.
   *
   * @param url - Original avatar URL
   * @returns URL with upgraded resolution, or original if not Google
   */
  function getHiResAvatar(url: string): string {
    if (url.includes("googleusercontent.com")) {
      return url.replace(/=s\d+-c/, "=s256-c");
    }
    return url;
  }

  /**
   * Generates initials from name or email for the avatar fallback.
   *
   * @returns 1-2 character uppercase initials string
   */
  function getInitials(): string {
    if (nameInput) {
      const parts = nameInput.split(" ").filter(Boolean);
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      if (parts.length === 1) return parts[0][0].toUpperCase();
    }
    if (email) return email[0].toUpperCase();
    return "?";
  }

  /**
   * Handles avatar file selection. Uploads to /api/account/avatar,
   * updates local state and localStorage cache on success.
   *
   * @param e - File input change event
   */
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("File too large. Max 2 MB.");
      return;
    }

    // Block NSFW images from being used as avatars
    const nsfwResult = await classifyImage(file);
    if (nsfwResult.isSensitive) {
      showToast("This image cannot be used as a profile photo.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/account/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Failed to upload photo.");
        return;
      }

      const { avatar_url } = await res.json();
      setLocalAvatar(avatar_url);
      setImgError(false);

      try {
        const cached = localStorage.getItem("caltodo_user_profile");
        if (cached) {
          const profile = JSON.parse(cached);
          profile.avatarUrl = avatar_url;
          localStorage.setItem("caltodo_user_profile", JSON.stringify(profile));
        }
      } catch { /* ignore */ }

      window.dispatchEvent(new CustomEvent("profile-updated", { detail: { avatarUrl: avatar_url } }));
      showToast("Profile photo updated.");
    } catch {
      showToast("Failed to upload photo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  /**
   * Saves the edited display name via PUT /api/account/name.
   * Updates local state, localStorage cache, and dispatches profile-updated event.
   */
  async function handleSaveName() {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === fullName) {
      handleClose();
      return;
    }

    setSavingName(true);
    try {
      const res = await fetch("/api/account/name", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Failed to update name.");
        return;
      }

      try {
        const cached = localStorage.getItem("caltodo_user_profile");
        if (cached) {
          const profile = JSON.parse(cached);
          profile.fullName = trimmed;
          localStorage.setItem("caltodo_user_profile", JSON.stringify(profile));
        }
      } catch { /* ignore */ }

      window.dispatchEvent(new CustomEvent("profile-updated", { detail: { fullName: trimmed } }));
      showToast("Name updated.");
      handleClose();
    } catch {
      showToast("Failed to update name.");
    } finally {
      setSavingName(false);
    }
  }

  if (!open) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-150 ${
        closing ? "opacity-0" : "animate-in fade-in duration-150"
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative bg-card rounded-2xl border border-border shadow-2xl w-[380px] max-w-[90vw] overflow-hidden transition-all duration-150 ${
          closing ? "scale-95 opacity-0" : "animate-in zoom-in-95 fade-in duration-200"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-base font-semibold text-foreground">Edit Profile</h3>
        </div>

        {/* Avatar */}
        <div className="flex justify-center pb-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center shrink-0 group cursor-pointer disabled:cursor-wait"
            title="Change profile photo"
          >
            <div className="absolute inset-0 bg-muted" />
            {localAvatar && !imgError ? (
              <img
                src={getHiResAvatar(localAvatar)}
                alt="Profile"
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="absolute inset-0 bg-blue-500 flex items-center justify-center text-white text-3xl font-medium">
                {getInitials()}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera size={20} className="text-white" />
              )}
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>

        {/* Name input */}
        <div className="px-5 pb-3">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Display Name
          </label>
          <input
            ref={nameInputRef}
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveName();
            }}
            placeholder="Enter your name"
            maxLength={100}
            className="w-full px-3 py-2 rounded-xl border border-input-border bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Email (read-only) */}
        {email && (
          <div className="px-5 pb-4">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Email
            </label>
            <p className="text-sm text-muted-foreground truncate">{email}</p>
          </div>
        )}

        {/* Save button */}
        <div className="px-5 pb-5">
          <button
            onClick={handleSaveName}
            disabled={savingName}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-all"
          >
            {savingName ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
