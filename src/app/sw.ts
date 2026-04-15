import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

/**
 * Service worker entry for CalTodo PWA.
 *
 * Built by @serwist/next at `next build` and emitted to /public/sw.js.
 * Uses Serwist's defaultCache recipe (Workbox-derived) for static assets,
 * with a navigation fallback to /offline when the network is unreachable.
 *
 * Edge cases:
 *  - API routes (Supabase, PostHog, /api/**) are excluded from precache via
 *    navigateFallbackDenylist so live data always hits the network.
 *  - skipWaiting() + clientsClaim() ensure new SW versions activate on next
 *    page load without manual reload.
 */
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

/**
 * Push event — fires when the server sends a Web Push (deadline reminder).
 * Renders an OS notification using the JSON payload from the cron route.
 */
self.addEventListener("push", (event: PushEvent) => {
  if (!event.data) return;
  let payload: { title?: string; body?: string; url?: string; tag?: string };
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "CalTodo", body: event.data.text() };
  }
  const title = payload.title || "CalTodo";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || "",
      tag: payload.tag,
      icon: "/pwa-icon-192.png",
      badge: "/pwa-icon-192.png",
      data: { url: payload.url || "/app/today" },
    })
  );
});

/**
 * Notification click — focuses an existing CalTodo tab/window if open,
 * otherwise opens a new one at the URL stored in the notification's data.
 */
self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  const target = (event.notification.data as { url?: string } | null)?.url || "/app/today";
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of all) {
        if ("focus" in client) {
          await (client as WindowClient).focus();
          if ("navigate" in client) {
            try { await (client as WindowClient).navigate(target); } catch {}
          }
          return;
        }
      }
      await self.clients.openWindow(target);
    })()
  );
});
