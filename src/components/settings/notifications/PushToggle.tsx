"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import {
  getDeviceState,
  getVapidPublicKey,
  subscribeToPush,
  unsubscribeFromPush,
  type DeviceState,
} from "@/lib/push/client";
import SettingsSwitch from "./SettingsSwitch";

/**
 * Helper text for each device state. The permission prompt is only ever
 * requested from this toggle, so the copy says what will happen on tap.
 *
 * @param state - Current device state, or null while it is being read
 * @returns One line for the switch's description
 */
export function pushDescription(state: DeviceState | null): string {
  switch (state) {
    case null:
      return "Checking this device...";
    case "unsupported":
      return "This browser does not support push notifications.";
    case "no-sw":
      return "Not available here. Open caltodo as an installed app to enable push.";
    case "denied":
      return "Blocked in your browser settings. Allow notifications for caltodo, then try again.";
    case "not-subscribed":
      return "Get reminders on this device. Your browser will ask for permission.";
    case "subscribed":
      return "This device receives reminders.";
  }
}

/**
 * Push notifications on/off for this device. Subscribes via the active
 * service worker and stores the subscription; unsubscribes and deletes it.
 *
 * @remarks The browser permission prompt is raised only inside
 *          subscribeToPush, which runs only from this toggle.
 */
export default function PushToggle() {
  const { showToast } = useToast();
  const [state, setState] = useState<DeviceState | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getDeviceState().then((s) => {
      if (!cancelled) setState(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Subscribes or unsubscribes, then re-reads the device state. */
  async function handleChange(next: boolean) {
    setBusy(true);
    try {
      if (next) {
        const key = await getVapidPublicKey();
        if (!key) {
          console.error("PushToggle: VAPID key unavailable", {
            impact: "push cannot be enabled on this deployment",
          });
          showToast("Push notifications are not configured on this server.", { variant: "error" });
          return;
        }
        const result = await subscribeToPush(key);
        if (result.status === "subscribed") {
          showToast("Push notifications on.");
        } else if (result.status === "denied") {
          showToast("Notifications were not allowed. You can change this in your browser settings.", {
            variant: "error",
          });
        } else if (result.status === "unsupported") {
          showToast("This browser does not support push notifications.", { variant: "error" });
        } else {
          console.error("PushToggle: subscribe failed", {
            error: result.message,
            impact: "the device is not subscribed",
          });
          showToast(`Failed to turn on push: ${result.message}`, { variant: "error" });
        }
      } else {
        const ok = await unsubscribeFromPush();
        if (ok) {
          showToast("Push notifications off.");
        } else {
          console.error("PushToggle: unsubscribe failed", { impact: "the device may still receive pushes" });
          showToast("Failed to turn off push notifications.", { variant: "error" });
        }
      }
    } finally {
      setState(await getDeviceState());
      setBusy(false);
    }
  }

  const disabled = state === null || state === "unsupported" || state === "no-sw" || state === "denied";

  return (
    <SettingsSwitch
      label="Push notifications"
      description={pushDescription(state)}
      checked={state === "subscribed"}
      onChange={handleChange}
      busy={busy}
      disabled={disabled}
    />
  );
}
