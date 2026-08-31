#!/usr/bin/env node
/**
 * Compress oversized PNGs that load inside the authenticated app shell.
 *
 * Companion to compress-landing-images.mjs, which covers the marketing
 * page. These are the assets a signed-in user pays for on every cold load,
 * so they were sized from a DevTools trace of /app/inbox rather than by eye:
 *
 *   - empty-task-illustration.png → 768  Measured as the LCP element of
 *       /app/inbox. Rendered at `w-72` (288px CSS) in TaskDetailPanel's
 *       empty state; the source was 1895px wide and 942KB.
 *   - bcourses-logo.png           → 128  Rendered at `w-4` (16px), and
 *       eagerly warmed by IntegrationSettings; the source was 620px/384KB.
 *   - canvas-logo.png             → 256  Rendered up to a `w-full` tile in
 *       the onboarding integration cards.
 *   - login-bear.png              → 512  Rendered at `w-56` (224px) on the
 *       login page, the first screen every new user sees.
 *   - logo.png                    → 512  App-chrome logo, rendered at h-7
 *       to h-12. NOTE: scripts/sync-logo.mjs raw-copies this file into
 *       pwa-icon-512.png, so 512 is a hard floor — do not lower it.
 *
 * Originals are backed up to public/originals/ on first run and every
 * re-encode reads from that backup, so running this repeatedly is safe.
 *
 * Usage: npm run compress-app-images
 *
 * @module scripts/compress-app-images
 */
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runBatch } from "./lib/compress-image.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, "..", "public");
const ORIGINALS = resolve(PUBLIC, "originals");

/** Targets: [filename, max output width in px]. See module docstring for sizing rationale. */
const TARGETS = [
  ["empty-task-illustration.png", 768],
  ["bcourses-logo.png", 128],
  ["canvas-logo.png", 256],
  ["login-bear.png", 512],
  ["logo.png", 512]
];

async function main() {
  await runBatch({
    publicDir: PUBLIC,
    originalsDir: ORIGINALS,
    targets: TARGETS,
    label: "app-shell images",
  });
  console.log(
    "\nNote: logo.png feeds scripts/sync-logo.mjs. Run `npm run sync-logo` if you\n" +
      "want the favicon / OG / PWA icon slots re-copied from the smaller master.",
  );
}

main().catch((err) => {
  console.error("App image compression failed:", err);
  process.exit(1);
});
