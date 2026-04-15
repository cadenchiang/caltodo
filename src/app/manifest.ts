import type { MetadataRoute } from "next";

/**
 * Web app manifest for CalTodo PWA.
 *
 * Enables "Add to Home Screen" on iOS/Android and standalone (chrome-less)
 * launch. Next.js App Router serves this at /manifest.webmanifest.
 *
 * Icons:
 *  - 192/512 "any" purpose for general use
 *  - 192/512 "maskable" with ~10% safe-zone padding for adaptive Android icons
 *
 * Returns: MetadataRoute.Manifest object consumed by Next.js.
 * Edge cases: start_url requires auth and will redirect unauthenticated users
 * to /login — acceptable behavior for an installed app.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CalTodo",
    short_name: "CalTodo",
    description:
      "Sync your classes, upload your syllabus, and manage every deadline in one place.",
    start_url: "/app/today",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    categories: ["productivity", "education"],
    icons: [
      {
        src: "/pwa-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/pwa-icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
