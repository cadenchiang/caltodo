"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Check } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { usePresence, type UserStatus } from "@/contexts/PresenceContext";
import { classifyImage } from "@/lib/nsfw-check";
import ImageCropModal from "@/components/ui/ImageCropModal";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

/** Status option config for the picker. */
const STATUS_OPTIONS: { value: UserStatus; label: string; color: string }[] = [
  { value: "online", label: "Online", color: "bg-green-500" },
  { value: "idle", label: "Idle", color: "bg-yellow-500" },
  { value: "dnd", label: "Do not disturb", color: "bg-red-500" },
];

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
 * Built on the Modal primitive (dialog role, focus trap, Escape, scroll
 * lock). The image cropper is rendered as a sibling of the profile dialog,
 * not inside its backdrop, so clicks in the crop dialog no longer bubble to
 * the profile modal's close handler (audit section 4, blocker).
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
  const { userStatuses, setStatus, currentUserId } = usePresence();
  const currentStatus = (currentUserId ? userStatuses.get(currentUserId) : undefined) ?? "online";
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
    }
  }, [open, avatarUrl, fullName]);

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
   * Opens the crop modal after file selection.
   *
   * @param e - File input change event
   */
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("File too large. Max 5 MB.", { variant: "error" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setCropSrc(URL.createObjectURL(file));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  /**
   * Uploads a cropped avatar blob to /api/account/avatar.
   * Runs NSFW check, uploads, and syncs state.
   *
   * @param blob - Cropped image blob from ImageCropModal
   */
  async function handleCroppedAvatar(blob: Blob) {
    setCropSrc(null);

    // NSFW check on the cropped blob
    const file = new File([blob], "avatar.jpg", { type: blob.type });
    const nsfwResult = await classifyImage(file);
    if (nsfwResult.isSensitive) {
      showToast("This image cannot be used as a profile photo.", { variant: "error" });
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
        console.error("[EditProfileModal] avatar upload rejected", {
          status: res.status,
          error: data.error,
          impact: "avatar unchanged",
        });
        showToast(data.error || "Couldn't upload the photo.", { variant: "error" });
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
    } catch (err) {
      console.error("[EditProfileModal] avatar upload failed", {
        error: err instanceof Error ? err.message : String(err),
        impact: "avatar unchanged",
      });
      showToast("Couldn't upload the photo.", { variant: "error" });
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
      onClose();
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
        console.error("[EditProfileModal] name update rejected", {
          status: res.status,
          error: data.error,
          impact: "name unchanged",
        });
        showToast(data.error || "Couldn't update the name.", { variant: "error" });
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
      onClose();
    } catch (err) {
      console.error("[EditProfileModal] name update failed", {
        error: err instanceof Error ? err.message : String(err),
        impact: "name unchanged",
      });
      showToast("Couldn't update the name.", { variant: "error" });
    } finally {
      setSavingName(false);
    }
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Edit profile"
        size="sm"
        initialFocusRef={nameInputRef}
      >
        {/* Avatar */}
        <div className="flex justify-center pb-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center shrink-0 group cursor-pointer disabled:cursor-wait"
            aria-label="Change profile photo"
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
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
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
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Name input */}
        <div className="pb-3">
          <label htmlFor="edit-profile-name" className="text-xs font-medium text-muted-foreground mb-1 block">
            Display name
          </label>
          <input
            id="edit-profile-name"
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
          <div className="pb-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Email</p>
            <p className="text-sm text-muted-foreground truncate">{email}</p>
          </div>
        )}

        {/* Status picker */}
        <div className="pb-4">
          <p className="text-xs font-medium text-muted-foreground mb-1.5" id="edit-profile-status">
            Status
          </p>
          <div className="flex gap-1.5" role="group" aria-labelledby="edit-profile-status">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                aria-pressed={currentStatus === opt.value}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  currentStatus === opt.value
                    ? "border-blue-500 bg-blue-500/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="inverted"
          onClick={handleSaveName}
          loading={savingName}
          leadingIcon={<Check size={14} />}
          className="w-full"
        >
          Save
        </Button>
      </Modal>

      {/* Sibling of the profile dialog on purpose: see the component docstring. */}
      <ImageCropModal
        open={!!cropSrc}
        imageSrc={cropSrc || ""}
        aspect={1}
        cropShape="round"
        onCrop={handleCroppedAvatar}
        onClose={() => {
          if (cropSrc) URL.revokeObjectURL(cropSrc);
          setCropSrc(null);
        }}
      />
    </>
  );
}
