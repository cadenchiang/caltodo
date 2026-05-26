#!/usr/bin/env node

/**
 * Sync the master logo to every brand-image slot in /public.
 *
 * Workflow: drop a new image at `public/logo.png`, then run
 *   npm run sync-logo
 * and this script copies it to all the favicon / apple-icon / OG /
 * PWA-icon slots so the new branding appears everywhere.
 *
 * The Miffy theme variants and external brand logos (UC Berkeley,
 * Canvas, Pensive, etc.) are intentionally NOT touched — they're
 * unrelated assets, not duplicates of the master logo.
 *
 * @module scripts/sync-logo
 */

import { copyFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");

/** Master logo source — everything else is a copy of this file. */
const SOURCE = join(PUBLIC, "logo.png");

/**
 * Every slot the master logo gets duplicated into. Keep this list in
 * sync with brand references in the codebase (grep for `/logo.png`
 * and friends if you add a new spot).
 */
const TARGETS = [
  "icon-light.png",   // favicon in light-mode browser tabs
  "icon-dark.png",    // favicon in dark-mode browser tabs
  "apple-icon.png",   // iOS Safari home-screen icon
  "og-image.png",     // OpenGraph / iMessage / Twitter preview
  "pwa-icon-192.png",         // PWA install (small)
  "pwa-icon-512.png",         // PWA install (large)
  "pwa-icon-maskable-192.png", // PWA install (small, maskable)
  "pwa-icon-maskable-512.png", // PWA install (large, maskable)
];

function bail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

if (!existsSync(SOURCE)) {
  bail(`Source file not found: ${SOURCE}\n  Drop your new logo at public/logo.png first.`);
}

const sourceSize = statSync(SOURCE).size;
console.log(`→ syncing public/logo.png (${(sourceSize / 1024).toFixed(0)} KB) to ${TARGETS.length} slots`);

let copied = 0;
for (const name of TARGETS) {
  const dest = join(PUBLIC, name);
  try {
    copyFileSync(SOURCE, dest);
    console.log(`  ✓ ${name}`);
    copied += 1;
  } catch (err) {
    console.error(`  ✗ ${name}: ${err.message}`);
  }
}

console.log(`\nDone — ${copied}/${TARGETS.length} copied.`);
console.log("\nNext steps:");
console.log("  1. Hard refresh your browser (Cmd+Shift+R) to clear the favicon cache.");
console.log("  2. If the landing-page Hero still shows the old logo, restart the dev");
console.log("     server: lsof -ti:3000 | xargs kill -9 && npm run dev");
console.log("     (Next.js caches optimized images in memory.)");
