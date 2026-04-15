/**
 * Client-side push subscription helpers.
 *
 * Runs in the browser only. Used by the Notifications settings section to
 * request permission, subscribe via the active service worker, and POST
 * the subscription to /api/push/subscribe.
 *
 * Edge cases:
 *  - iOS Safari requires the PWA be added to home screen first. We can't
 *    detect this perfectly; we surface the browser's permission prompt
 *    and let it fail gracefully if unsupported.
 *  - If the user previously granted permission and we re-subscribe, the
 *    server upserts on endpoint so no duplicate row is created.
 */

/** True if this browser supports the Push API + service workers + Notifications. */
export function isPushSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Converts a base64url VAPID public key to the Uint8Array form required by
 * PushManager.subscribe().
 *
 * @param base64Url - URL-safe base64 (no padding) public key string.
 * @returns Uint8Array suitable for applicationServerKey.
 */
function urlBase64ToUint8Array(base64Url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/** Outcome of subscribeToPush(). */
export type SubscribeResult =
  | { status: "subscribed" }
  | { status: "denied" }
  | { status: "unsupported" }
  | { status: "error"; message: string };

/**
 * Requests notification permission and subscribes the active service worker
 * to push, then sends the subscription to the server.
 *
 * @param vapidPublicKey - The server's VAPID public key (base64url).
 * @returns A SubscribeResult describing the outcome.
 */
export async function subscribeToPush(
  vapidPublicKey: string
): Promise<SubscribeResult> {
  if (!isPushSupported()) return { status: "unsupported" };

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return { status: "denied" };

    const registration =
      (await navigator.serviceWorker.getRegistration()) ||
      (await navigator.serviceWorker.ready);
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    }

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userAgent: navigator.userAgent,
      }),
    });
    if (!res.ok) {
      return { status: "error", message: `server ${res.status}` };
    }
    return { status: "subscribed" };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Unsubscribes the active service worker from push and tells the server to
 * delete the row. Safe to call when not subscribed.
 *
 * @returns true on success or if there was nothing to unsubscribe.
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return true;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return true;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return true;

    await fetch("/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
    await subscription.unsubscribe();
    return true;
  } catch {
    return false;
  }
}

/**
 * Module-level cache for the server's VAPID public key. The key rarely
 * changes, so fetching it once per page load avoids a round trip on every
 * subscribe attempt.
 */
let cachedVapidKey: string | null = null;

/**
 * Fetches and caches the VAPID public key. Returns null if the server
 * hasn't configured VAPID (dev without env vars).
 */
export async function getVapidPublicKey(): Promise<string | null> {
  if (cachedVapidKey) return cachedVapidKey;
  try {
    const res = await fetch("/api/push/vapid-public-key");
    if (!res.ok) return null;
    const { key } = (await res.json()) as { key: string };
    cachedVapidKey = key;
    return key;
  } catch {
    return null;
  }
}

/** Device-subscription state used by the settings UI. */
export type DeviceState =
  | "unsupported"   // No Push/SW API in this browser
  | "no-sw"          // Push API exists, but no service worker registered yet (dev mode)
  | "denied"         // Permission blocked at the browser level
  | "not-subscribed" // SW present, permission not blocked, but not subscribed
  | "subscribed";    // Actively subscribed

/**
 * Resolves the current device state without hanging.
 *
 * Uses navigator.serviceWorker.getRegistration() rather than `.ready`
 * because `.ready` never resolves when no SW is registered (e.g. `npm run
 * dev` has Serwist disabled). Returns "no-sw" so the UI can explain.
 */
export async function getDeviceState(): Promise<DeviceState> {
  if (!isPushSupported()) return "unsupported";
  if (typeof Notification !== "undefined" && Notification.permission === "denied") {
    return "denied";
  }
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return "no-sw";
    const sub = await registration.pushManager.getSubscription();
    return sub ? "subscribed" : "not-subscribed";
  } catch {
    return "no-sw";
  }
}
