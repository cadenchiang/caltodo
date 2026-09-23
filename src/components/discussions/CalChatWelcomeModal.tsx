"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MessageCircle, EyeOff, ShieldCheck } from "lucide-react";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useDismissedModals } from "@/hooks/useDismissedModals";
import ChatModal from "./ChatModal";

/**
 * One-time welcome shown on the first visit to /app/discussions. It carries
 * the community standards and the anonymity disclosure (anonymous is
 * pseudonymous: #N is the same person within a chat), so the user must
 * accept before using chat; it cannot be dismissed with Escape or the
 * backdrop. Persisted via dismissed_modals.calchat_welcome with a
 * localStorage mirror.
 */
export default function CalChatWelcomeModal() {
  const { hasCompletedOnboarding } = useOnboardingStatus();
  const { isDismissed, dismiss, loaded } = useDismissedModals();
  const [open, setOpen] = useState(false);
  const [respectChecked, setRespectChecked] = useState(false);
  const [trackingChecked, setTrackingChecked] = useState(false);
  const firstCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loaded) return;
    if (!hasCompletedOnboarding || isDismissed("calchat_welcome")) return;
    setOpen(true);
  }, [loaded, hasCompletedOnboarding, isDismissed]);

  const handleAccept = useCallback(() => {
    dismiss("calchat_welcome");
    setOpen(false);
  }, [dismiss]);

  const canAccept = respectChecked && trackingChecked;

  return (
    <ChatModal
      open={open}
      onClose={() => {}}
      dismissible={false}
      title="Welcome to chat"
      initialFocusRef={firstCheckboxRef}
      footer={
        <button
          type="button"
          onClick={handleAccept}
          disabled={!canAccept}
          className="px-4 py-2 text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Let&apos;s go
        </button>
      }
    >
      <p className="text-sm text-muted-foreground leading-relaxed">
        Chat with your classmates in real time. You can send messages with your name or anonymously.
      </p>

      <ul className="list-none divide-y divide-border">
        <li className="flex items-start gap-3.5 py-3">
          <MessageCircle size={18} className="text-foreground shrink-0 mt-0.5" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Real-time class chat</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Message classmates, share files, and react to messages.</p>
          </div>
        </li>
        <li className="flex items-start gap-3.5 py-3">
          <EyeOff size={18} className="text-foreground shrink-0 mt-0.5" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Anonymous mode</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Your name is hidden and you appear as a number like #3. The same number is the same person within a chat, so anonymous is pseudonymous, not untraceable.
            </p>
          </div>
        </li>
        <li className="flex items-start gap-3.5 py-3">
          <ShieldCheck size={18} className="text-foreground shrink-0 mt-0.5" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Safe and moderated</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Anonymous messages are linked to your account for safety. Only a caltodo admin can see who sent one, and every reveal is logged.
            </p>
          </div>
        </li>
      </ul>

      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            ref={firstCheckboxRef}
            type="checkbox"
            checked={respectChecked}
            onChange={(e) => setRespectChecked(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-input-border accent-blue-500 cursor-pointer"
          />
          <span className="text-[13px] text-foreground leading-snug">I will be respectful and follow community standards</span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={trackingChecked}
            onChange={(e) => setTrackingChecked(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-input-border accent-blue-500 cursor-pointer"
          />
          <span className="text-[13px] text-foreground leading-snug">I understand anonymous messages are linked to my account for safety</span>
        </label>
      </div>
    </ChatModal>
  );
}
