"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getChatNotificationPrefs,
  setChatNotificationPref,
  requestDesktopPermission,
  DEFAULT_CHAT_PREFS,
  type ChatNotificationPrefs,
} from "@/lib/chat-notification-prefs";

/** Browser permission state for desktop notifications. */
type Permission = "default" | "granted" | "denied" | "unsupported";

/** Reads the browser's notification permission, safely. */
function readPermission(): Permission {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

/**
 * A labelled on/off switch.
 *
 * @param id - Element id for the label association
 * @param label - Switch label
 * @param description - One-line explanation
 * @param checked - Current value
 * @param onChange - Called with the new value
 * @param disabled - Disables the switch
 */
function ToggleRow({ id, label, description, checked, onChange, disabled }: {
  id: string; label: string; description: string; checked: boolean; onChange: (next: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <label id={`${id}-label`} htmlFor={id} className="text-sm text-foreground">{label}</label>
        <p id={`${id}-desc`} className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-desc`}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${checked ? "bg-blue-500" : "bg-input-border"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

/**
 * Settings > Chat: notification switches. Banners and sounds are on by
 * default; desktop notifications are off until the user turns them on
 * here, which is the only place the browser permission prompt is shown.
 */
export default function ChatSection() {
  const [prefs, setPrefs] = useState<ChatNotificationPrefs>(DEFAULT_CHAT_PREFS);
  const [permission, setPermission] = useState<Permission>("default");
  const [requesting, setRequesting] = useState(false);

  // Read after mount so the server render matches the first client frame
  useEffect(() => {
    setPrefs(getChatNotificationPrefs());
    setPermission(readPermission());
  }, []);

  const update = useCallback((pref: keyof ChatNotificationPrefs, value: boolean) => {
    setChatNotificationPref(pref, value);
    setPrefs((p) => ({ ...p, [pref]: value }));
  }, []);

  /** Desktop toggle: turning on asks the browser first. */
  const handleDesktop = useCallback(async (next: boolean) => {
    if (!next) {
      update("desktop", false);
      return;
    }
    setRequesting(true);
    const result = await requestDesktopPermission();
    setRequesting(false);
    setPermission(result === "granted" ? "granted" : result === "denied" ? "denied" : readPermission());
    update("desktop", result === "granted");
  }, [update]);

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-1">Chat</h2>
      <p className="text-sm text-muted-foreground mb-4">How class chats get your attention on this device.</p>

      <div className="divide-y divide-border">
        <ToggleRow
          id="chat-pref-banners"
          label="Banners"
          description="Show a small banner when a message arrives in a chat you are not looking at."
          checked={prefs.banners}
          onChange={(v) => update("banners", v)}
        />
        <ToggleRow
          id="chat-pref-sound"
          label="Sounds"
          description="Play a short sound when you send or receive a message."
          checked={prefs.sound}
          onChange={(v) => update("sound", v)}
        />
        <ToggleRow
          id="chat-pref-desktop"
          label="Desktop notifications"
          description={
            permission === "unsupported"
              ? "Your browser does not support desktop notifications."
              : permission === "denied"
                ? "Blocked in your browser. Allow notifications for caltodo in your browser settings, then turn this on."
                : "Notify you through your system while caltodo is in a background tab. Your browser will ask for permission."
          }
          checked={prefs.desktop && permission === "granted"}
          onChange={handleDesktop}
          disabled={requesting || permission === "unsupported" || permission === "denied"}
        />
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Mute a single chat from its details panel. CalYak is muted for everyone until you unmute it.
      </p>
    </section>
  );
}
