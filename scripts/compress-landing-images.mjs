#!/usr/bin/env node
/**
 * Compress oversized landing-page PNGs in public/.
 *
 * Originals are copied to public/originals/<name>.png as a backup before
 * overwriting, and every re-encode reads from that backup so repeat runs
 * are idempotent. See scripts/lib/compress-image.mjs for the mechanics.
 *
 * Targets (path relative to public/, max output width in pixels):
 *   - app-screenshot-board.png  → 1920 (hero MacBook mockup, ~1024px CSS)
 *   - step-personalize.png      → 1600 (half-column card)
 *   - step-calendar.png         → 1600 (half-column card)
 *   - step-sync.png             → 1600 (full-width card)
 *
 * logo.png used to live here too; it moved to compress-app-images.mjs,
 * which owns every asset on the authenticated critical path.
 *
 * Usage: npm run compress-landing-images
 *
 * @module scripts/compress-landing-images
 */
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runBatch } from "./lib/compress-image.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, "..", "public");
const ORIGINALS = resolve(PUBLIC, "originals");

/** Targets: [filename, max output width in px] */
const TARGETS = [
  ["app-screenshot-board.png", 1920],
  ["step-personalize.png", 1600],
  ["step-calendar.png", 1600],
  ["step-sync.png", 1600]
];

async function main() {
  await runBatch({
    publicDir: PUBLIC,
    originalsDir: ORIGINALS,
    targets: TARGETS,
    label: "landing images",
  });
}

main().catch((err) => {
  console.error("Landing image compression failed:", err);
  process.exit(1);
});
