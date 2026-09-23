/**
 * Per-device chat notification preferences.
 *
 * Three switches, all in localStorage: in-app banners, sounds, and desktop
 * (system) notifications. Desktop notifications are opt-in only: the
 * browser permission prompt is requested from the explicit toggle in
 * Settings > Chat, never on page load. The notifier and the open room both
 * consult these before making a noise.
 *
 * @module chat-notification-prefs
 */

/** localStorage keys. */
export const CHAT_PREF_KEYS = {
  banners: "calchat_notif_banners",
  sound: "calchat_notif_sound",
  desktop: "calchat_notif_desktop",
} as const;

/** Event fired whenever a preference changes. */
export const CHAT_PREFS_CHANGED_EVENT = "calchat-prefs-changed";

export interface ChatNotificationPrefs {
  /** In-app banner in the corner when a message arrives elsewhere. */
  banners: boolean;
  /** Receive / send sounds. */
  sound: boolean;
  /** System notifications while the tab is hidden (needs browser permission). */
  desktop: boolean;
}

/** Defaults: banners and sound on, desktop off until the user opts in. */
export const DEFAULT_CHAT_PREFS: ChatNotificationPrefs = { banners: true, sound: true, desktop: false };

/**
 * Reads one boolean preference.
 *
 * @param key - Storage key
 * @param fallback - Value when nothing is stored or storage is unavailable
 */
function readBool(key: string, fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return raw === "true";
  } catch {
    return fallback;
  }
}

/**
 * Reads all chat notification preferences.
 *
 * @returns The current preferences, defaults where nothing is stored
 */
export function getChatNotificationPrefs(): ChatNotificationPrefs {
  return {
    banners: readBool(CHAT_PREF_KEYS.banners, DEFAULT_CHAT_PREFS.banners),
    sound: readBool(CHAT_PREF_KEYS.sound, DEFAULT_CHAT_PREFS.sound),
    desktop: readBool(CHAT_PREF_KEYS.desktop, DEFAULT_CHAT_PREFS.desktop),
  };
}

/**
 * Stores one preference and notifies listeners.
 *
 * @param pref - Which preference
 * @param value - New value
 */
export function setChatNotificationPref(pref: keyof ChatNotificationPrefs, value: boolean): void {
  try {
    localStorage.setItem(CHAT_PREF_KEYS[pref], String(value));
  } catch {
    // localStorage unavailable
  }
  window.dispatchEvent(new CustomEvent(CHAT_PREFS_CHANGED_EVENT, { detail: { pref, value } }));
}

/**
 * Whether a desktop notification may be shown right now: the user opted in
 * and the browser granted permission.
 */
export function desktopNotificationsAllowed(): boolean {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  return getChatNotificationPrefs().desktop && Notification.permission === "granted";
}

/**
 * Requests browser permission for desktop notifications. Only call from an
 * explicit user action (the Settings toggle).
 *
 * @returns The resulting permission, or "denied" when unsupported
 */
export async function requestDesktopPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}
