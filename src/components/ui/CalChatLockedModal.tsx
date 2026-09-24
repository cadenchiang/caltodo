"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import ChatModal from "@/components/discussions/ChatModal";

interface CalChatLockedModalProps {
  /** Whether the modal is currently visible. */
  open: boolean;
  /** Called when the user dismisses the modal. */
  onClose: () => void;
}

/**
 * Shown when a user opens chat before completing onboarding. Chat unlocks
 * when hasCompletedOnboarding() is true: at least one integration is
 * connected (Canvas, Gradescope, Pensieve, or Google Calendar) or a sync
 * has run. The copy names exactly that set.
 */
export default function CalChatLockedModal({ open, onClose }: CalChatLockedModalProps) {
  const router = useRouter();
  const ctaRef = useRef<HTMLButtonElement>(null);

  /** Sends the user to Settings > Integrations to connect a class source. */
  const handleSync = useCallback(() => {
    onClose();
    router.push("/app/settings?section=integrations");
  }, [router, onClose]);

  return (
    <ChatModal
      open={open}
      onClose={onClose}
      title="Chat is locked"
      size="sm"
      initialFocusRef={ctaRef}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Not now
          </button>
          <button
            ref={ctaRef}
            type="button"
            onClick={handleSync}
            className="px-4 py-2 text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors cursor-pointer"
          >
            Connect a class
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0" aria-hidden="true">
          <Lock size={18} className="text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Chat opens once your classes are synced. Connect Canvas, Gradescope, Pensieve, or Google Calendar in Settings and your class chats appear here.
        </p>
      </div>
    </ChatModal>
  );
}
